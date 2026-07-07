import { clearAuthSession, getAuthToken, redirectToLogin } from "../../../lib/authSession";
import { normalizeStudentTestDetailsPayload } from "./studentApi";
import type { CodingExecutionResult } from "../types/codeconnect.types";
import type { StudentTestAnswer, StudentTestAttemptState, StudentTestAttemptStatus, StudentTestDetails } from "../types/student.types";

const studentAttemptApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  import.meta.env.VITE_API_URL ??
  "";

type RequestMethod = "GET" | "POST";

type RequestOptions = {
  body?: unknown;
  method?: RequestMethod;
};

type TokenRecord = Record<string, unknown>;

type WrittenAnswerPayload =
  | {
      questionId: string;
      sectionType: "MCQ";
      selectedOptionIndex: number | null;
    }
  | {
      answerText: string;
      questionId: string;
      sectionType: "QA";
    };

export type StartedStudentTestAttempt = {
  attemptId: string;
  durationMinutes?: number;
  remainingSeconds?: number;
  startedAt?: string;
  status?: StudentTestAttemptStatus;
  test?: StudentTestDetails;
  testId?: string;
};

export type ActiveStudentTestAttempt = StartedStudentTestAttempt & {
  submittedAt?: string;
  testId: string;
};

export type CodingSubmissionPayload = {
  attemptId: string;
  codingQuestionId: string;
  code: string;
  customInput?: string;
  language: string;
  questionId: string;
  testId: string;
};

export class StudentTestAttemptApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StudentTestAttemptApiError";
    this.status = status;
  }
}

export class StudentTestAttemptApiAuthError extends StudentTestAttemptApiError {
  constructor(status: number) {
    super(status === 401 ? "Your session has expired. Please log in again." : "You do not have access to this test attempt.", status);
    this.name = "StudentTestAttemptApiAuthError";
  }
}

export function getStudentTestAttemptApiErrorMessage(error: unknown) {
  if (error instanceof StudentTestAttemptApiError) {
    return error.message;
  }

  return "Unable to reach the test attempt service. Please try again.";
}

export async function startStudentTestAttemptApi(testId: string): Promise<StartedStudentTestAttempt> {
  const response = await studentAttemptApiRequest("/test-attempts/start", {
    body: { testId },
    method: "POST",
  });
  const payload = unwrapData(response);
  const record = asRecord(payload);
  const attemptId = readString(record, ["attemptId", "testAttemptId", "id", "_id"]);

  if (!attemptId) {
    throw new StudentTestAttemptApiError("The test attempt was started, but the backend did not return an attempt id.", 500);
  }

  return {
    attemptId,
    durationMinutes: readNumber(record, ["durationMinutes", "duration", "testDurationMinutes"]),
    remainingSeconds: readNumber(record, ["remainingSeconds", "remainingTimeSeconds", "timeRemainingSeconds"]),
    startedAt: readString(record, ["startedAt", "startTime", "createdAt"]),
    status: readAttemptStatus(record),
    test: readStudentTestDetails(record.test ?? record.testDetails),
    testId: readTestId(record),
  };
}

export async function getActiveStudentTestAttemptApi(): Promise<ActiveStudentTestAttempt | null> {
  const response = await studentAttemptApiRequest("/test-attempts/active");
  const payload = unwrapData(response);

  if (!payload) {
    return null;
  }

  const record = asRecord(payload);
  const attemptId = readString(record, ["attemptId", "testAttemptId", "id", "_id"]);
  const testId = readTestId(record);

  if (!attemptId || !testId) {
    return null;
  }

  return {
    attemptId,
    durationMinutes: readNumber(record, ["durationMinutes", "duration", "testDurationMinutes"]),
    remainingSeconds: readNumber(record, ["remainingSeconds", "remainingTimeSeconds", "timeRemainingSeconds"]),
    startedAt: readString(record, ["startedAt", "startTime", "createdAt"]),
    status: readAttemptStatus(record),
    submittedAt: readString(record, ["submittedAt", "completedAt"]),
    test: readStudentTestDetails(record.test ?? record.testDetails),
    testId,
  };
}

export async function bulkSubmitStudentAnswersApi(test: StudentTestDetails, attempt: StudentTestAttemptState) {
  const answers = Object.values(attempt.answers).flatMap((answer) => mapWrittenAnswer(answer));

  if (!answers.length) {
    return undefined;
  }

  return studentAttemptApiRequest("/student-answers/bulk-submit", {
    body: {
      answers,
      attemptId: attempt.attemptId,
      testId: test.testId,
    },
    method: "POST",
  });
}

export async function runCodingSubmissionApi(payload: CodingSubmissionPayload) {
  const response = await studentAttemptApiRequest("/coding-submissions/run", {
    body: payload,
    method: "POST",
  });

  return normalizeCodingExecutionResult(response, "Run completed");
}

export async function submitCodingSubmissionApi(payload: CodingSubmissionPayload) {
  const response = await studentAttemptApiRequest("/coding-submissions/submit", {
    body: payload,
    method: "POST",
  });

  return normalizeCodingExecutionResult(response, "Accepted");
}

export async function submitCodingAnswersApi(test: StudentTestDetails, attempt: StudentTestAttemptState) {
  const codingAnswers = Object.values(attempt.answers).filter((answer): answer is Extract<StudentTestAnswer, { sectionType: "CODING" }> => answer.sectionType === "CODING");

  return Promise.all(
    codingAnswers.map((answer) =>
      submitCodingSubmissionApi({
        attemptId: attempt.attemptId,
        codingQuestionId: findCodingQuestionId(test, answer.questionId),
        code: answer.code,
        language: answer.language,
        questionId: answer.questionId,
        testId: test.testId,
      }),
    ),
  );
}

function findCodingQuestionId(test: StudentTestDetails, questionId: string) {
  for (const section of test.sections) {
    if (section.sectionType !== "CODING") {
      continue;
    }

    const question = section.questions.find((item) => item.id === questionId);
    if (question) {
      return question.codingQuestionId ?? question.id;
    }
  }

  return questionId;
}

export async function submitTestAttemptApi(test: StudentTestDetails, attempt: StudentTestAttemptState, autoSubmitted: boolean) {
  return studentAttemptApiRequest(`/test-attempts/${encodeURIComponent(attempt.attemptId)}/submit`, {
    body: {
      autoSubmitted,
      submittedAt: new Date().toISOString(),
      testId: test.testId,
    },
    method: "POST",
  });
}

export async function autoSubmitTestAttemptApi(test: StudentTestDetails, attempt: StudentTestAttemptState) {
  return studentAttemptApiRequest(`/test-attempts/${encodeURIComponent(attempt.attemptId)}/auto-submit`, {
    body: {
      submittedAt: new Date().toISOString(),
      testId: test.testId,
    },
    method: "POST",
  });
}

export async function submitCompleteStudentTestAttemptApi(
  test: StudentTestDetails,
  attempt: StudentTestAttemptState,
  options: { autoSubmitted: boolean },
) {
  const [writtenAnswersResult, codingResults] = await Promise.all([
    bulkSubmitStudentAnswersApi(test, attempt),
    submitCodingAnswersApi(test, attempt),
  ]);
  const attemptResult = options.autoSubmitted
    ? await autoSubmitTestAttemptApi(test, attempt)
    : await submitTestAttemptApi(test, attempt, false);

  return {
    attemptResult,
    codingResults,
    writtenAnswersResult,
  };
}

export function getTestAttemptResultApi(attemptId: string) {
  return studentAttemptApiRequest(`/test-attempts/${encodeURIComponent(attemptId)}/result`);
}

export function getCodingSubmissionsByAttemptApi(attemptId: string) {
  return studentAttemptApiRequest(`/coding-submissions/attempt/${encodeURIComponent(attemptId)}`);
}

async function studentAttemptApiRequest<TResponse = unknown>(endpoint: string, options: RequestOptions = {}) {
  const response = await fetch(buildApiUrl(endpoint), {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options.body !== undefined),
    method: options.method ?? "GET",
  });

  if (response.status === 401) {
    clearAuthSession();
    redirectToLogin();
    throw new StudentTestAttemptApiAuthError(response.status);
  }

  if (response.status === 403) {
    throw new StudentTestAttemptApiAuthError(response.status);
  }

  if (!response.ok) {
    throw new StudentTestAttemptApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

function mapWrittenAnswer(answer: StudentTestAnswer): WrittenAnswerPayload[] {
  if (answer.sectionType === "MCQ") {
    return [
      {
        questionId: answer.questionId,
        sectionType: "MCQ",
        selectedOptionIndex: answer.selectedOptionIndex,
      },
    ];
  }

  if (answer.sectionType === "QA") {
    return [
      {
        answerText: answer.text,
        questionId: answer.questionId,
        sectionType: "QA",
      },
    ];
  }

  return [];
}

function normalizeCodingExecutionResult(payload: unknown, fallbackStatus: CodingExecutionResult["status"]): CodingExecutionResult {
  const data = unwrapData(payload);
  const record = asRecord(data);
  const statusValue = readString(record, ["status", "verdict", "result"]);
  const status = normalizeCodingStatus(statusValue, fallbackStatus);
  const passed = readNumber(record, ["passed", "passedCount", "testCasesPassed"]) ?? (status === "Accepted" ? 1 : 0);
  const total = readNumber(record, ["total", "totalCount", "totalTestCases"]) ?? Math.max(passed, 1);

  return {
    memory: readString(record, ["memory", "memoryUsed"]) || "-",
    output: readString(record, ["output", "stdout", "message"]) || status,
    passed,
    runtime: readString(record, ["runtime", "executionTime"]) || "-",
    status,
    total,
  };
}

function normalizeCodingStatus(value: string, fallbackStatus: CodingExecutionResult["status"]): CodingExecutionResult["status"] {
  const normalized = value.toLowerCase();

  if (normalized.includes("accept") || normalized === "passed") {
    return "Accepted";
  }

  if (normalized.includes("run") || normalized.includes("complete") || normalized.includes("success")) {
    return "Run completed";
  }

  return fallbackStatus;
}

function readStudentTestDetails(value: unknown) {
  return normalizeStudentTestDetailsPayload(value);
}

function readTestId(record: Record<string, unknown>) {
  const directTestId = readString(record, ["testId"]);
  if (directTestId) {
    return directTestId;
  }

  const nestedTest = asRecord(record.test ?? record.testDetails);
  return readString(nestedTest, ["testId", "id", "_id"]);
}

function readAttemptStatus(record: Record<string, unknown>): StudentTestAttemptStatus | undefined {
  const status = readString(record, ["status", "attemptStatus"]).toUpperCase();

  if (status === "AUTO_SUBMITTED" || status === "EXPIRED" || status === "IN_PROGRESS" || status === "SUBMITTED") {
    return status;
  }

  return undefined;
}

function buildApiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const normalizedBase = studentAttemptApiBaseUrl.toString().replace(/\/$/, "");
  return normalizedBase ? `${normalizedBase}${normalizedEndpoint}` : normalizedEndpoint;
}

function buildHeaders(hasBody: boolean) {
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  const token = getAuthToken();

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function unwrapData(payload: unknown) {
  const record = asRecord(payload);
  return record.data ?? record.result ?? payload;
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsedValue = Number(value);
      if (!Number.isNaN(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function isTokenRecord(value: unknown): value is TokenRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    const validationMessage = formatValidationErrorPayload(payload);
    if (validationMessage) {
      return validationMessage;
    }
  } catch {
    // Ignore malformed error bodies and use the HTTP status text below.
  }

  return response.statusText || "Request failed.";
}

function formatValidationErrorPayload(payload: unknown) {
  if (!isTokenRecord(payload)) {
    return "";
  }

  const directMessages = [
    typeof payload.message === "string" ? payload.message : "",
    typeof payload.error === "string" ? payload.error : "",
  ].filter(Boolean);
  const errorMessages = flattenValidationErrors(payload.errors ?? payload.validationErrors);
  const allMessages = [...directMessages, ...errorMessages].filter(Boolean);

  return allMessages.length ? allMessages.join(" ") : "";
}

function flattenValidationErrors(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenValidationErrors(item));
  }

  if (isTokenRecord(value)) {
    const message = typeof value.message === "string" ? value.message : "";
    const field = typeof value.field === "string" ? value.field : "";
    const nested = Object.entries(value)
      .filter(([key]) => key !== "message" && key !== "field")
      .flatMap(([key, nestedValue]) =>
        flattenValidationErrors(nestedValue).map((nestedMessage) => `${key}: ${nestedMessage}`),
      );

    if (message) {
      return [field ? `${field}: ${message}` : message, ...nested];
    }

    return nested;
  }

  return [];
}
