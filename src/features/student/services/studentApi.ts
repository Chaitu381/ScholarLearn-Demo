import { clearAuthSession, getAuthSession, getAuthToken, redirectToLogin } from "../../../lib/authSession";
import { studentMockData } from "../data/studentMockData";
import { getMockStudentTestDetails } from "../data/studentTestAttemptMockData";
import type {
  StudentMockData,
  StudentTestCodingQuestion,
  StudentTestDetails,
  StudentTestMcqQuestion,
  StudentTestQaQuestion,
  StudentTestSection,
  TestCategory,
  TestRecord,
  TestStatus,
} from "../types/student.types";

const studentApiBaseUrl =
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

export class StudentApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StudentApiError";
    this.status = status;
  }
}

export class StudentApiAuthError extends StudentApiError {
  constructor(status: number) {
    super(status === 401 ? "Your session has expired. Please log in again." : "Access denied for this student resource.", status);
    this.name = "StudentApiAuthError";
  }
}

export function getStudentApiErrorMessage(error: unknown) {
  if (error instanceof StudentApiError) {
    return error.message;
  }

  return "Live student data unavailable; using demo data.";
}

export async function studentApiRequest<TResponse = unknown>(endpoint: string, options: RequestOptions = {}) {
  const response = await fetch(buildApiUrl(endpoint), {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options.body !== undefined),
    method: options.method ?? "GET",
  });

  if (response.status === 401) {
    clearAuthSession();
    redirectToLogin();
    throw new StudentApiAuthError(response.status);
  }

  if (response.status === 403) {
    throw new StudentApiAuthError(response.status);
  }

  if (!response.ok) {
    throw new StudentApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const studentApi = {
  getAttendance(studentId: string) {
    return studentApiRequest(`/attendance/student/${encodeURIComponent(studentId)}`);
  },
  getAttendanceGraph(studentId: string) {
    return studentApiRequest(`/attendance/student/${encodeURIComponent(studentId)}/graph`);
  },
  getStudentAnalytics(studentId: string) {
    return studentApiRequest(`/students/${encodeURIComponent(studentId)}/analytics`);
  },
  getStudentFinalTests(studentId: string) {
    return studentApiRequest(`/tests/student/${encodeURIComponent(studentId)}/final`);
  },
  getStudentGrade(studentId: string) {
    return studentApiRequest(`/students/${encodeURIComponent(studentId)}/grade`);
  },
  getStudentMonthlyTests(studentId: string) {
    return studentApiRequest(`/tests/student/${encodeURIComponent(studentId)}/monthly`);
  },
  getStudentPerformance(studentId: string) {
    return studentApiRequest(`/students/${encodeURIComponent(studentId)}/performance`);
  },
  getStudentProgress(studentId: string) {
    return studentApiRequest(`/students/${encodeURIComponent(studentId)}/progress`);
  },
  getStudentRank(studentId: string) {
    return studentApiRequest(`/students/${encodeURIComponent(studentId)}/rank`);
  },
  getStudentRiskScore(studentId: string) {
    return studentApiRequest(`/students/${encodeURIComponent(studentId)}/risk-score`);
  },
  getStudentTests(studentId: string) {
    return studentApiRequest(`/tests/student/${encodeURIComponent(studentId)}`);
  },
  getStudentWeakTopics(studentId: string) {
    return studentApiRequest(`/students/${encodeURIComponent(studentId)}/weak-topics`);
  },
  getStudentWeeklyTests(studentId: string) {
    return studentApiRequest(`/tests/student/${encodeURIComponent(studentId)}/weekly`);
  },
};

export async function getStudentDashboardData(): Promise<StudentMockData> {
  const studentId = getCurrentStudentId();

  if (!studentId) {
    return studentMockData;
  }

  const [
    analyticsResult,
    attendanceResult,
    attendanceGraphResult,
    performanceResult,
    progressResult,
    weakTopicsResult,
    riskScoreResult,
    gradeResult,
    rankResult,
    testsResult,
    weeklyTestsResult,
    monthlyTestsResult,
    finalTestsResult,
  ] = await Promise.allSettled([
    studentApi.getStudentAnalytics(studentId),
    studentApi.getAttendance(studentId),
    studentApi.getAttendanceGraph(studentId),
    studentApi.getStudentPerformance(studentId),
    studentApi.getStudentProgress(studentId),
    studentApi.getStudentWeakTopics(studentId),
    studentApi.getStudentRiskScore(studentId),
    studentApi.getStudentGrade(studentId),
    studentApi.getStudentRank(studentId),
    studentApi.getStudentTests(studentId),
    studentApi.getStudentWeeklyTests(studentId),
    studentApi.getStudentMonthlyTests(studentId),
    studentApi.getStudentFinalTests(studentId),
  ]);

  const fulfilledValues = [
    analyticsResult,
    attendanceResult,
    attendanceGraphResult,
    performanceResult,
    progressResult,
    weakTopicsResult,
    riskScoreResult,
    gradeResult,
    rankResult,
    testsResult,
    weeklyTestsResult,
    monthlyTestsResult,
    finalTestsResult,
  ].flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));

  if (!fulfilledValues.length) {
    return studentMockData;
  }

  return mergeStudentDashboardData(studentMockData, {
    analytics: valueOrUndefined(analyticsResult),
    attendance: valueOrUndefined(attendanceResult),
    attendanceGraph: valueOrUndefined(attendanceGraphResult),
    finalTests: valueOrUndefined(finalTestsResult),
    grade: valueOrUndefined(gradeResult),
    monthlyTests: valueOrUndefined(monthlyTestsResult),
    performance: valueOrUndefined(performanceResult),
    progress: valueOrUndefined(progressResult),
    rank: valueOrUndefined(rankResult),
    riskScore: valueOrUndefined(riskScoreResult),
    tests: valueOrUndefined(testsResult),
    weakTopics: valueOrUndefined(weakTopicsResult),
    weeklyTests: valueOrUndefined(weeklyTestsResult),
  });
}

export async function getStudentTestDetails(testId: string): Promise<StudentTestDetails> {
  const studentId = getCurrentStudentId();

  if (!studentId) {
    return getMockStudentTestDetails(testId);
  }

  try {
    const payload = await studentApi.getStudentTests(studentId);
    return normalizeStudentTestDetailsPayload(payload, testId) ?? getMockStudentTestDetails(testId);
  } catch {
    return getMockStudentTestDetails(testId);
  }
}

export function normalizeStudentTestDetailsPayload(payload: unknown, testId?: string): StudentTestDetails | undefined {
  const records = readRecords(payload, "tests");
  const candidates = records.length ? records : isRecord(unwrapData(payload)) ? [asRecord(unwrapData(payload))] : [];
  const selectedRecord =
    candidates.find((record) => readString(record, ["testId", "id", "_id"]) === testId) ??
    candidates.find((record) => readString(record, ["testId", "id", "_id"])) ??
    candidates[0];

  if (!selectedRecord) {
    return undefined;
  }

  const sections = normalizeStudentTestSections(selectedRecord.sections ?? selectedRecord.testSections);
  if (!sections.length) {
    return undefined;
  }

  const resolvedTestId = readString(selectedRecord, ["testId", "id", "_id"]) || testId || "test";

  return {
    batch: readString(selectedRecord, ["batch", "batchName"]) || "Assigned Batch",
    durationMinutes: readNumber(selectedRecord, ["durationMinutes", "duration", "testDurationMinutes"], 60),
    instructions: readStringArray(selectedRecord.instructions, [
      "The timer starts immediately after you click Start Test.",
      "Refresh restores this attempt from the original start time.",
      "Frontend locking is UX protection only; backend must enforce final test rules.",
    ]),
    sections,
    subject: readString(selectedRecord, ["subject", "subjectName"]) || "Assessment",
    testId: resolvedTestId,
    testType: normalizeStudentTestType(readString(selectedRecord, ["testType", "type"])),
    title: readString(selectedRecord, ["title", "testTitle", "name"]) || "Student Test",
    totalMarks: readNumber(selectedRecord, ["totalMarks", "marks"], sections.reduce((total, section) => total + section.marks, 0)),
  };
}

function mergeStudentDashboardData(
  fallback: StudentMockData,
  payloads: Record<string, unknown>,
): StudentMockData {
  const analyticsRecord = asRecord(unwrapData(payloads.analytics));
  const dashboardRecord = asRecord(analyticsRecord.dashboard ?? analyticsRecord.studentDashboard);
  const mergedDashboard: StudentMockData = {
    ...fallback,
    ...pickStudentDashboardShape(dashboardRecord),
  };

  const tests = normalizeTestRecords(payloads.tests);
  if (tests.length) {
    mergedDashboard.tests = tests;
  }

  const weakTopics = readStringArray(asRecord(unwrapData(payloads.weakTopics)).weakTopics ?? payloads.weakTopics, []);
  if (weakTopics.length) {
    mergedDashboard.testPerformance = {
      ...mergedDashboard.testPerformance,
      weakTopics,
    };
  }

  const rankRecord = asRecord(unwrapData(payloads.rank));
  const currentRank = readNumber(rankRecord, ["rank", "currentRank", "batchRank"], 0);
  if (currentRank > 0) {
    mergedDashboard.leaderboardPreview = {
      ...mergedDashboard.leaderboardPreview,
      currentRank,
    };
  }

  const attendanceRecord = asRecord(unwrapData(payloads.attendance));
  const attendancePercentage = readNumber(attendanceRecord, ["percentage", "overall", "attendancePercentage"], 0);
  if (attendancePercentage > 0) {
    mergedDashboard.overviewStats = mergedDashboard.overviewStats.map((stat) =>
      stat.label.toLowerCase().includes("attendance")
        ? { ...stat, value: `${attendancePercentage}%`, status: attendancePercentage >= 85 ? "Healthy" : "Needs focus" }
        : stat,
    );
  }

  return mergedDashboard;
}

function normalizeStudentTestSections(value: unknown): StudentTestSection[] {
  const records = Array.isArray(value) ? value.filter(isRecord) : [];
  const sections: StudentTestSection[] = [];

  records.forEach((section, sectionIndex) => {
    const type = normalizeSectionType(readString(section, ["sectionType", "type"]));
    const questions = Array.isArray(section.questions) ? section.questions.filter(isRecord) : [];
    const sectionId = readString(section, ["id", "sectionId", "_id"]) || `section-${sectionIndex + 1}`;
    const title = readString(section, ["title", "sectionTitle", "name"]) || type;
    const marks = readNumber(section, ["marks", "totalMarks"], 0);

    if (type === "MCQ") {
      const mcqQuestions = questions.map((question, index) => normalizeMcqQuestion(question, index));
      if (mcqQuestions.length) {
        sections.push({
          id: sectionId,
          marks: marks || sumQuestionMarks(mcqQuestions),
          questions: mcqQuestions,
          sectionType: "MCQ",
          title,
        });
      }
      return;
    }

    if (type === "QA") {
      const qaQuestions = questions.map((question, index) => normalizeQaQuestion(question, index));
      if (qaQuestions.length) {
        sections.push({
          id: sectionId,
          marks: marks || sumQuestionMarks(qaQuestions),
          questions: qaQuestions,
          sectionType: "QA",
          title,
        });
      }
      return;
    }

    if (type === "CODING") {
      const codingQuestions = questions.map((question, index) => normalizeCodingQuestion(question, index));
      if (codingQuestions.length) {
        sections.push({
          id: sectionId,
          marks: marks || sumQuestionMarks(codingQuestions),
          questions: codingQuestions,
          sectionType: "CODING",
          title,
        });
      }
    }
  });

  return sections;
}

function normalizeMcqQuestion(question: Record<string, unknown>, index: number): StudentTestMcqQuestion {
  const options = normalizeOptions(question.options);
  const correctOptionIndex =
    readOptionalNumber(question, ["correctOptionIndex", "correctAnswerIndex"]) ??
    options.findIndex((option) => option.isCorrect);

  return {
    correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : undefined,
    id: readString(question, ["id", "questionId", "_id"]) || `mcq-${index + 1}`,
    marks: readNumber(question, ["marks"], 1),
    options: options.map((option) => option.optionText),
    questionText: readString(question, ["questionText", "question", "title"]) || `MCQ Question ${index + 1}`,
  };
}

function normalizeQaQuestion(question: Record<string, unknown>, index: number): StudentTestQaQuestion {
  return {
    expectedAnswer: readString(question, ["expectedAnswer", "answer"]),
    id: readString(question, ["id", "questionId", "_id"]) || `qa-${index + 1}`,
    marks: readNumber(question, ["marks"], 1),
    questionText: readString(question, ["questionText", "question", "title"]) || `Question ${index + 1}`,
  };
}

function normalizeCodingQuestion(question: Record<string, unknown>, index: number): StudentTestCodingQuestion {
  return {
    allowedLanguages: readStringArray(question.allowedLanguages ?? question.languages, ["Java"]),
    codingQuestionId: readString(question, ["codingQuestionId", "questionId"]),
    constraints: readString(question, ["constraints"]) || "Use the given input and output format.",
    id: readString(question, ["id", "questionId", "_id"]) || `coding-${index + 1}`,
    inputFormat: readString(question, ["inputFormat", "input format"]) || "Input is provided in standard input.",
    marks: readNumber(question, ["marks"], 1),
    outputFormat: readString(question, ["outputFormat", "output format"]) || "Print the answer to standard output.",
    problemStatement: readString(question, ["problemStatement", "statement", "questionText"]) || "Solve the coding problem.",
    sampleInput: readString(question, ["sampleInput", "sample input"]) || "",
    sampleOutput: readString(question, ["sampleOutput", "sample output"]) || "",
    starterCode: readString(question, ["starterCode", "starter code"]) || "",
    title: readString(question, ["title", "problemTitle", "name"]) || `Coding Problem ${index + 1}`,
  };
}

function normalizeTestRecords(payload: unknown): TestRecord[] {
  return readRecords(payload, "tests").map((record, index) => ({
    category: normalizeTestCategory(readString(record, ["category", "testType", "type"])),
    date: readString(record, ["date", "startTime", "scheduledAt", "createdAt"]) || new Date().toISOString(),
    id: readString(record, ["id", "testId", "_id"]) || `test-${index + 1}`,
    maxScore: readNumber(record, ["maxScore", "totalMarks", "marks"], 100),
    score: readNumber(record, ["score", "obtainedMarks"], 0),
    status: normalizeTestStatus(readString(record, ["status", "testStatus"])),
    subject: readString(record, ["subject", "subjectName"]) || "Assessment",
    title: readString(record, ["title", "testTitle", "name"]) || `Test ${index + 1}`,
  }));
}

function pickStudentDashboardShape(record: Record<string, unknown>): Partial<StudentMockData> {
  const output: Partial<StudentMockData> = {};

  for (const key of Object.keys(studentMockData) as Array<keyof StudentMockData>) {
    const value = record[key];
    if (Array.isArray(studentMockData[key])) {
      if (Array.isArray(value) && value.length) {
        (output as Record<string, unknown>)[key] = value;
      }
    } else if (isRecord(studentMockData[key]) && isRecord(value)) {
      (output as Record<string, unknown>)[key] = {
        ...(studentMockData[key] as Record<string, unknown>),
        ...value,
      };
    }
  }

  return output;
}

function getCurrentStudentId() {
  const session = getAuthSession();
  const user: TokenRecord = isRecord(session?.user) ? session.user : {};

  return (
    session?.studentId ||
    readTokenString(user.studentId) ||
    readTokenString(user.id) ||
    readTokenString(user.userId) ||
    "me"
  );
}

function buildApiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const normalizedBase = studentApiBaseUrl.toString().replace(/\/$/, "");
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
  if (!isRecord(payload)) {
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
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((item) => flattenValidationErrors(item));

  if (isRecord(value)) {
    const message = typeof value.message === "string" ? value.message : "";
    const field = typeof value.field === "string" ? value.field : "";
    const nested = Object.entries(value)
      .filter(([key]) => key !== "message" && key !== "field")
      .flatMap(([key, nestedValue]) => flattenValidationErrors(nestedValue).map((nestedMessage) => `${key}: ${nestedMessage}`));

    if (message) {
      return [field ? `${field}: ${message}` : message, ...nested];
    }

    return nested;
  }

  return [];
}

function valueOrUndefined<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : undefined;
}

function unwrapData(payload: unknown) {
  const record = asRecord(payload);
  return record.data ?? record.result ?? payload;
}

function readRecords(payload: unknown, key: string) {
  const data = unwrapData(payload);
  if (Array.isArray(data)) return data.filter(isRecord);
  const record = asRecord(data);
  const value = record[key] ?? record.items ?? record.content;
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function normalizeOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [
      { isCorrect: false, optionText: "Option A" },
      { isCorrect: false, optionText: "Option B" },
      { isCorrect: false, optionText: "Option C" },
      { isCorrect: false, optionText: "Option D" },
    ];
  }

  return value.slice(0, 4).map((option, index) => {
    if (isRecord(option)) {
      return {
        isCorrect: Boolean(option.isCorrect),
        optionText: readString(option, ["optionText", "text", "label"]) || `Option ${String.fromCharCode(65 + index)}`,
      };
    }

    return {
      isCorrect: false,
      optionText: String(option),
    };
  });
}

function normalizeSectionType(value: string): StudentTestSection["sectionType"] | "" {
  const normalized = value.toUpperCase();
  if (normalized === "MCQ") return "MCQ";
  if (normalized === "QA" || normalized === "Q&A" || normalized === "QUESTION_AND_ANSWER" || normalized === "QUESTION & ANSWER") return "QA";
  if (normalized === "CODING" || normalized === "CODE") return "CODING";
  return "";
}

function normalizeStudentTestType(value: string): StudentTestDetails["testType"] {
  const normalized = value.toUpperCase();
  if (normalized.includes("FINAL")) return "FINAL";
  if (normalized.includes("MOCK")) return "MOCK";
  if (normalized.includes("MONTH")) return "MONTHLY";
  return "WEEKLY";
}

function normalizeTestCategory(value: string): TestCategory {
  const normalized = value.toUpperCase();
  if (normalized.includes("FINAL")) return "Final";
  if (normalized.includes("MOCK")) return "Mock";
  if (normalized.includes("MONTH")) return "Monthly";
  if (normalized.includes("CODING")) return "Coding Test";
  return "Weekly";
}

function normalizeTestStatus(value: string): TestStatus {
  const normalized = value.toUpperCase();
  if (normalized.includes("RETAKE")) return "Retake Available";
  if (normalized.includes("MISS")) return "Missed";
  if (normalized.includes("COMPLETE") || normalized.includes("SUBMIT")) return "Completed";
  return "Upcoming";
}

function sumQuestionMarks(questions: Array<{ marks: number }>) {
  return questions.reduce((total, question) => total + question.marks, 0);
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }

  return "";
}

function readTokenString(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function readStringArray(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const strings = value.map((item) => String(item).trim()).filter(Boolean);
    return strings.length ? strings : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    return value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  }

  return fallback;
}

function readNumber(record: Record<string, unknown>, keys: string[], fallback: number) {
  for (const key of keys) {
    const value = record[key];
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return fallback;
}

function readOptionalNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is TokenRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
