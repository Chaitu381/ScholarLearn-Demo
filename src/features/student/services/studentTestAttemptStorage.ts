import type { StudentTestAnswer, StudentTestAttemptState, StudentTestAttemptStatus, StudentTestDetails } from "../types/student.types";

const attemptStoragePrefix = "scholarlearn-student-test-attempt";
const activeAttemptStorageKey = `${attemptStoragePrefix}:active`;

type CreateAttemptOptions = {
  attemptId?: string;
  backendRemainingSeconds?: number;
  durationMinutes?: number;
  startedAt?: string;
  status?: StudentTestAttemptStatus;
};

type BackendAttemptTiming = {
  durationMinutes?: number;
  remainingSeconds?: number;
  startedAt?: string;
  status?: StudentTestAttemptStatus;
};

export function getStudentTestAttempt(testId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAttempt = window.localStorage.getItem(getAttemptStorageKey(testId));
  if (!storedAttempt) {
    return null;
  }

  try {
    return normalizeStoredAttempt(JSON.parse(storedAttempt));
  } catch {
    return null;
  }
}

export function getActiveStoredStudentTestAttempt() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAttempt = window.localStorage.getItem(activeAttemptStorageKey);
  if (!storedAttempt) {
    return null;
  }

  try {
    const attempt = normalizeStoredAttempt(JSON.parse(storedAttempt));
    if (!attempt || attempt.submitted) {
      clearActiveStudentTestAttempt();
      return null;
    }

    return attempt;
  } catch {
    clearActiveStudentTestAttempt();
    return null;
  }
}

export function createStudentTestAttempt(test: StudentTestDetails, options: CreateAttemptOptions = {}) {
  const existingAttempt = getStudentTestAttempt(test.testId);
  if (existingAttempt && !existingAttempt.submitted) {
    return existingAttempt;
  }

  const attempt: StudentTestAttemptState = {
    activeTestId: test.testId,
    answers: createInitialAnswers(test),
    attemptId: options.attemptId ?? `attempt-${test.testId}-${Date.now()}`,
    backendRemainingSeconds: options.backendRemainingSeconds,
    backendRemainingSyncedAt: options.backendRemainingSeconds === undefined ? undefined : new Date().toISOString(),
    codingAnswers: {},
    durationMinutes: options.durationMinutes ?? test.durationMinutes,
    remainingSeconds: options.backendRemainingSeconds ?? (options.durationMinutes ?? test.durationMinutes) * 60,
    startedAt: options.startedAt ?? new Date().toISOString(),
    status: options.status ?? "IN_PROGRESS",
    submitted: false,
    testId: test.testId,
  };

  saveStudentTestAttempt(attempt);
  return attempt;
}

export function saveStudentTestAttempt(attempt: StudentTestAttemptState) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedAttempt = normalizeAttemptForStorage(attempt);
  const serializedAttempt = JSON.stringify(normalizedAttempt);

  window.localStorage.setItem(getAttemptStorageKey(attempt.testId), serializedAttempt);
  window.sessionStorage.setItem(getAttemptStorageKey(attempt.testId), serializedAttempt);

  if (normalizedAttempt.submitted) {
    clearActiveStudentTestAttempt();
  } else {
    window.localStorage.setItem(activeAttemptStorageKey, serializedAttempt);
    window.sessionStorage.setItem(activeAttemptStorageKey, serializedAttempt);
  }
}

export function updateStudentTestAttemptAnswer(
  attempt: StudentTestAttemptState,
  questionId: string,
  answer: StudentTestAnswer,
) {
  const updatedAttempt: StudentTestAttemptState = {
    ...attempt,
    answers: {
      ...attempt.answers,
      [questionId]: answer,
    },
  };

  saveStudentTestAttempt(updatedAttempt);
  return updatedAttempt;
}

export function submitStudentTestAttempt(attempt: StudentTestAttemptState, autoSubmitted = false) {
  const submittedAttempt: StudentTestAttemptState = {
    ...attempt,
    status: autoSubmitted ? "AUTO_SUBMITTED" : "SUBMITTED",
    submitted: true,
    submittedAt: new Date().toISOString(),
  };

  saveStudentTestAttempt(submittedAttempt);
  return submittedAttempt;
}

export function getRemainingAttemptMs(attempt: StudentTestAttemptState) {
  if (attempt.backendRemainingSeconds !== undefined && attempt.backendRemainingSyncedAt) {
    const syncedAtMs = new Date(attempt.backendRemainingSyncedAt).getTime();
    const elapsedSinceBackendSyncMs = Date.now() - syncedAtMs;

    return Math.max(attempt.backendRemainingSeconds * 1000 - elapsedSinceBackendSyncMs, 0);
  }

  const startedAtMs = new Date(attempt.startedAt).getTime();
  const durationMs = attempt.durationMinutes * 60 * 1000;
  const elapsedMs = Date.now() - startedAtMs;

  return Math.max(durationMs - elapsedMs, 0);
}

export function syncStudentTestAttemptWithBackendTime(attempt: StudentTestAttemptState, timing: BackendAttemptTiming) {
  const syncedAttempt: StudentTestAttemptState = {
    ...attempt,
    backendRemainingSeconds: timing.remainingSeconds ?? attempt.backendRemainingSeconds,
    backendRemainingSyncedAt: timing.remainingSeconds === undefined ? attempt.backendRemainingSyncedAt : new Date().toISOString(),
    durationMinutes: timing.durationMinutes ?? attempt.durationMinutes,
    startedAt: timing.startedAt ?? attempt.startedAt,
    status: timing.status ?? attempt.status,
    submitted:
      attempt.submitted ||
      timing.status === "AUTO_SUBMITTED" ||
      timing.status === "SUBMITTED",
  };

  saveStudentTestAttempt(syncedAttempt);
  return syncedAttempt;
}

export function clearActiveStudentTestAttempt() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(activeAttemptStorageKey);
  window.sessionStorage.removeItem(activeAttemptStorageKey);
}

export function navigateToStudentTestPath(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function createInitialAnswers(test: StudentTestDetails) {
  return test.sections.reduce<StudentTestAttemptState["answers"]>((answers, section) => {
    if (section.sectionType === "MCQ") {
      section.questions.forEach((question) => {
        answers[question.id] = {
          questionId: question.id,
          sectionType: "MCQ",
          selectedOptionIndex: null,
        };
      });

      return answers;
    }

    if (section.sectionType === "QA") {
      section.questions.forEach((question) => {
        answers[question.id] = {
          questionId: question.id,
          sectionType: "QA",
          text: "",
        };
      });

      return answers;
    }

    section.questions.forEach((question) => {
      answers[question.id] = {
        code: question.starterCode,
        language: question.allowedLanguages[0] ?? "Java",
        questionId: question.id,
        sectionType: "CODING",
      };
    });

    return answers;
  }, {});
}

function getAttemptStorageKey(testId: string) {
  return `${attemptStoragePrefix}:${testId}`;
}

function normalizeStoredAttempt(value: unknown): StudentTestAttemptState | null {
  if (!isRecord(value)) {
    return null;
  }

  const answers = isRecord(value.answers) ? (value.answers as Record<string, StudentTestAnswer>) : {};
  const testId = readString(value.testId);
  const durationMinutes = readNumber(value.durationMinutes, 0);
  const startedAt = readString(value.startedAt);
  const attemptId = readString(value.attemptId);

  if (!testId || !durationMinutes || !startedAt || !attemptId) {
    return null;
  }

  return normalizeAttemptForStorage({
    activeTestId: readString(value.activeTestId) || testId,
    answers,
    attemptId,
    backendRemainingSeconds: readOptionalNumber(value.backendRemainingSeconds),
    backendRemainingSyncedAt: readString(value.backendRemainingSyncedAt) || undefined,
    codingAnswers: isRecord(value.codingAnswers)
      ? (value.codingAnswers as Record<string, Extract<StudentTestAnswer, { sectionType: "CODING" }>>)
      : extractCodingAnswers(answers),
    durationMinutes,
    remainingSeconds: readNumber(value.remainingSeconds, 0),
    startedAt,
    status: normalizeAttemptStatus(value.status),
    submitted: Boolean(value.submitted),
    submittedAt: readString(value.submittedAt) || undefined,
    testId,
  });
}

function normalizeAttemptForStorage(attempt: StudentTestAttemptState): StudentTestAttemptState {
  const remainingSeconds = Math.max(0, Math.ceil(computeRemainingAttemptMs(attempt) / 1000));

  return {
    ...attempt,
    activeTestId: attempt.testId,
    codingAnswers: extractCodingAnswers(attempt.answers),
    remainingSeconds,
  };
}

function computeRemainingAttemptMs(attempt: StudentTestAttemptState) {
  if (attempt.backendRemainingSeconds !== undefined && attempt.backendRemainingSyncedAt) {
    const syncedAtMs = new Date(attempt.backendRemainingSyncedAt).getTime();
    const elapsedSinceBackendSyncMs = Date.now() - syncedAtMs;

    return Math.max(attempt.backendRemainingSeconds * 1000 - elapsedSinceBackendSyncMs, 0);
  }

  const startedAtMs = new Date(attempt.startedAt).getTime();
  const durationMs = attempt.durationMinutes * 60 * 1000;
  const elapsedMs = Date.now() - startedAtMs;

  return Math.max(durationMs - elapsedMs, 0);
}

function extractCodingAnswers(answers: Record<string, StudentTestAnswer>) {
  return Object.values(answers).reduce<Record<string, Extract<StudentTestAnswer, { sectionType: "CODING" }>>>(
    (codingAnswers, answer) => {
      if (answer.sectionType === "CODING") {
        codingAnswers[answer.questionId] = answer;
      }

      return codingAnswers;
    },
    {},
  );
}

function normalizeAttemptStatus(value: unknown): StudentTestAttemptStatus | undefined {
  if (value === "AUTO_SUBMITTED" || value === "EXPIRED" || value === "IN_PROGRESS" || value === "SUBMITTED") {
    return value;
  }

  return undefined;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function readOptionalNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
