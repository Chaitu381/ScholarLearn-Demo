import { clearAuthSession, getAuthToken, redirectToLogin } from "../../../lib/authSession";

const lecturerApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  import.meta.env.VITE_API_URL ??
  "";

type RequestMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

type RequestOptions = {
  body?: unknown;
  method?: RequestMethod;
};

type TokenRecord = Record<string, unknown>;

export type LecturerCreateTestPayload = {
  batchId: string;
  description: string;
  durationMinutes: number;
  endTime: string;
  sections: Array<{
    marks: number;
    questions: unknown[];
    sectionType: "CODING" | "MCQ" | "QA";
  }>;
  startTime: string;
  subjectId: string;
  testType: "FINAL" | "MONTHLY" | "WEEKLY";
  title: string;
  totalMarks: number;
};

type LegacyCreateTestPayload = {
  codingQuestions: Array<{
    question: unknown;
    testCases: unknown[];
  }>;
  publish: boolean;
  sections: Array<{
    marks: number;
    questionCount: number;
    questions: unknown[];
    type: string;
  }>;
  test: unknown;
};

export class LecturerApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "LecturerApiError";
    this.status = status;
  }
}

export class LecturerApiAuthError extends LecturerApiError {
  constructor(status: number) {
    super(status === 401 ? "Your session has expired. Please log in again." : "Access denied for this lecturer resource.", status);
    this.name = "LecturerApiAuthError";
  }
}

export function getLecturerApiStatusMessage(error: unknown) {
  if (error instanceof LecturerApiAuthError) {
    return error.message;
  }

  if (error instanceof LecturerApiError) {
    return `Live lecturer data unavailable (${error.status}); using demo data.`;
  }

  return "Live lecturer data unavailable; using demo data.";
}

export function getLecturerSubmissionErrorMessage(error: unknown) {
  if (error instanceof LecturerApiError) {
    return error.message;
  }

  return "Unable to submit test. Please check the form and try again.";
}

export async function lecturerApiRequest<TResponse = unknown>(endpoint: string, options: RequestOptions = {}) {
  const response = await fetch(buildApiUrl(endpoint), {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options.body !== undefined),
    method: options.method ?? "GET",
  });

  if (response.status === 401) {
    clearAuthSession();
    redirectToLogin();
    throw new LecturerApiAuthError(response.status);
  }

  if (response.status === 403) {
    throw new LecturerApiAuthError(response.status);
  }

  if (!response.ok) {
    throw new LecturerApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const lecturerApi = {
  createAssignment(payload: unknown) {
    return lecturerApiRequest("/assignments", { body: payload, method: "POST" });
  },
  createCodingQuestion(payload: unknown) {
    return lecturerApiRequest("/coding-questions", { body: payload, method: "POST" });
  },
  createCodingTestCase(payload: unknown) {
    return lecturerApiRequest("/coding-test-cases", { body: payload, method: "POST" });
  },
  createTest(payload: unknown) {
    return lecturerApiRequest("/tests", { body: payload, method: "POST" });
  },
  createTestSection(testId: string, payload: unknown) {
    return lecturerApiRequest(`/tests/${encodeURIComponent(testId)}/sections`, { body: payload, method: "POST" });
  },
  getAttendanceGraph(studentId: string) {
    return lecturerApiRequest(`/attendance/student/${encodeURIComponent(studentId)}/graph`);
  },
  getLecturerAssignments() {
    return lecturerApiRequest("/assignments/lecturer/me");
  },
  getLecturerBatch(batchId: string) {
    return lecturerApiRequest(`/lecturers/batches/${encodeURIComponent(batchId)}`);
  },
  getLecturerBatchStudent(batchId: string, studentId: string) {
    return lecturerApiRequest(`/lecturers/batches/${encodeURIComponent(batchId)}/students/${encodeURIComponent(studentId)}`);
  },
  getLecturerBatchStudents(batchId: string) {
    return lecturerApiRequest(`/lecturers/batches/${encodeURIComponent(batchId)}/students`);
  },
  getLecturerBatches() {
    return lecturerApiRequest("/lecturers/me/batches");
  },
  getLecturerDashboard() {
    return lecturerApiRequest("/lecturers/me/dashboard");
  },
  getLecturerTests() {
    return lecturerApiRequest("/tests/lecturer/me");
  },
  getStudentAnalytics(studentId: string) {
    return lecturerApiRequest(`/students/${encodeURIComponent(studentId)}/analytics`);
  },
  getStudentAttendance(studentId: string) {
    return lecturerApiRequest(`/attendance/student/${encodeURIComponent(studentId)}`);
  },
  getStudentFinalReport(studentId: string) {
    return lecturerApiRequest(`/students/${encodeURIComponent(studentId)}/final-report`);
  },
  getStudentFinalTests(studentId: string) {
    return lecturerApiRequest(`/tests/student/${encodeURIComponent(studentId)}/final`);
  },
  getStudentGrade(studentId: string) {
    return lecturerApiRequest(`/students/${encodeURIComponent(studentId)}/grade`);
  },
  getStudentMonthlyTests(studentId: string) {
    return lecturerApiRequest(`/tests/student/${encodeURIComponent(studentId)}/monthly`);
  },
  getStudentPerformance(studentId: string) {
    return lecturerApiRequest(`/students/${encodeURIComponent(studentId)}/performance`);
  },
  getStudentProgress(studentId: string) {
    return lecturerApiRequest(`/students/${encodeURIComponent(studentId)}/progress`);
  },
  getStudentRank(studentId: string) {
    return lecturerApiRequest(`/students/${encodeURIComponent(studentId)}/rank`);
  },
  getStudentRiskScore(studentId: string) {
    return lecturerApiRequest(`/students/${encodeURIComponent(studentId)}/risk-score`);
  },
  getStudentTests(studentId: string) {
    return lecturerApiRequest(`/tests/student/${encodeURIComponent(studentId)}`);
  },
  getStudentWeakTopics(studentId: string) {
    return lecturerApiRequest(`/students/${encodeURIComponent(studentId)}/weak-topics`);
  },
  getStudentWeeklyTests(studentId: string) {
    return lecturerApiRequest(`/tests/student/${encodeURIComponent(studentId)}/weekly`);
  },
  publishTest(testId: string) {
    return lecturerApiRequest(`/tests/${encodeURIComponent(testId)}/publish`, { method: "POST" });
  },
};

export function createLecturerTest(payload: LecturerCreateTestPayload) {
  return lecturerApi.createTest(payload);
}

export async function createLecturerTestWithSections(payload: LegacyCreateTestPayload) {
  const createdTest = await lecturerApi.createTest(payload.test);
  const testId = readCreatedId(createdTest);

  if (!testId) {
    throw new LecturerApiError("Test was created but the response did not include a test id.", 500);
  }

  const createdCodingQuestions = await Promise.all(
    payload.codingQuestions.map(async (codingQuestion) => {
      const createdQuestion = await lecturerApi.createCodingQuestion({
        ...asRecord(codingQuestion.question),
        testId,
      });
      const codingQuestionId = readCreatedId(createdQuestion);

      await Promise.all(
        codingQuestion.testCases.map((testCase) =>
          lecturerApi.createCodingTestCase({
            ...asRecord(testCase),
            codingQuestionId,
            testId,
          }),
        ),
      );

      return {
        codingQuestionId,
        createdQuestion,
      };
    }),
  );

  const createdSections = await Promise.all(
    payload.sections.map((section) => lecturerApi.createTestSection(testId, section)),
  );

  const publishedTest = payload.publish ? await lecturerApi.publishTest(testId) : undefined;

  return {
    createdCodingQuestions,
    createdSections,
    createdTest,
    publishedTest,
    testId,
  };
}

export async function getStudentFullProfileApiData(batchId: string, studentId: string) {
  const [
    lecturerStudent,
    analytics,
    finalReport,
    performance,
    weakTopics,
    progress,
    riskScore,
    grade,
    rank,
    attendance,
    attendanceGraph,
    tests,
    weeklyTests,
    monthlyTests,
    finalTests,
  ] = await Promise.all([
    lecturerApi.getLecturerBatchStudent(batchId, studentId),
    lecturerApi.getStudentAnalytics(studentId),
    lecturerApi.getStudentFinalReport(studentId),
    lecturerApi.getStudentPerformance(studentId),
    lecturerApi.getStudentWeakTopics(studentId),
    lecturerApi.getStudentProgress(studentId),
    lecturerApi.getStudentRiskScore(studentId),
    lecturerApi.getStudentGrade(studentId),
    lecturerApi.getStudentRank(studentId),
    lecturerApi.getStudentAttendance(studentId),
    lecturerApi.getAttendanceGraph(studentId),
    lecturerApi.getStudentTests(studentId),
    lecturerApi.getStudentWeeklyTests(studentId),
    lecturerApi.getStudentMonthlyTests(studentId),
    lecturerApi.getStudentFinalTests(studentId),
  ]);

  return {
    analytics,
    attendance,
    attendanceGraph,
    finalReport,
    finalTests,
    grade,
    lecturerStudent,
    monthlyTests,
    performance,
    progress,
    rank,
    riskScore,
    tests,
    weakTopics,
    weeklyTests,
  };
}

function buildApiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const normalizedBase = lecturerApiBaseUrl.toString().replace(/\/$/, "");
  return normalizedBase ? `${normalizedBase}${normalizedEndpoint}` : normalizedEndpoint;
}

function readCreatedId(payload: unknown) {
  const record = asRecord(payload);
  const nested = asRecord(record.data);
  const value =
    record.testId ??
    record.id ??
    record._id ??
    record.codingQuestionId ??
    nested.testId ??
    nested.id ??
    nested._id ??
    nested.codingQuestionId;

  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
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

    if (isTokenRecord(payload) && typeof payload.message === "string") {
      return payload.message;
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
