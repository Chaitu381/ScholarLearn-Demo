import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Code2, FileText, ListChecks } from "lucide-react";
import { CodeEditor } from "../components/codeconnect/coding/CodeEditor";
import { ProblemStatement } from "../components/codeconnect/coding/ProblemStatement";
import { getStudentTestDetails } from "../services/studentApi";
import {
  getActiveStudentTestAttemptApi,
  getStudentTestAttemptApiErrorMessage,
  runCodingSubmissionApi,
  submitCodingSubmissionApi,
  submitCompleteStudentTestAttemptApi,
} from "../services/studentTestAttemptApi";
import {
  createStudentTestAttempt,
  getRemainingAttemptMs,
  getStudentTestAttempt,
  navigateToStudentTestPath,
  submitStudentTestAttempt,
  syncStudentTestAttemptWithBackendTime,
  updateStudentTestAttemptAnswer,
} from "../services/studentTestAttemptStorage";
import type { CodingExecutionResult, CodingLanguage, CodingProblem } from "../types/codeconnect.types";
import type {
  StudentTestAnswer,
  StudentTestAttemptState,
  StudentTestCodingQuestion,
  StudentTestDetails,
  StudentTestMcqQuestion,
  StudentTestQaQuestion,
} from "../types/student.types";

export function StudentTestAttempt({ testId }: { testId: string }) {
  const [test, setTest] = useState<StudentTestDetails | null>(null);
  const [attempt, setAttempt] = useState<StudentTestAttemptState | null>(null);
  const [codingApiState, setCodingApiState] = useState<Record<string, { error: string; loading: boolean; message: string }>>({});
  const [codingResults, setCodingResults] = useState<Record<string, CodingExecutionResult>>({});
  const [remainingMs, setRemainingMs] = useState(0);
  const [submitReason, setSubmitReason] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const autoSubmitRequestedRef = useRef(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    let active = true;

    getStudentTestDetails(testId).then(async (testDetails) => {
      if (!active) return;
      let storedAttempt = getStudentTestAttempt(testDetails.testId);

      if (storedAttempt?.submitted) {
        navigateToStudentTestPath(`/student/tests/${testDetails.testId}/result`);
        return;
      }

      try {
        const activeBackendAttempt = await getActiveStudentTestAttemptApi();
        if (activeBackendAttempt?.testId === testDetails.testId) {
          if (activeBackendAttempt.status === "SUBMITTED" || activeBackendAttempt.status === "AUTO_SUBMITTED") {
            navigateToStudentTestPath(`/student/tests/${testDetails.testId}/result`);
            return;
          }

          storedAttempt = storedAttempt
            ? syncStudentTestAttemptWithBackendTime(storedAttempt, activeBackendAttempt)
            : createStudentTestAttempt(activeBackendAttempt.test ?? testDetails, {
                attemptId: activeBackendAttempt.attemptId,
                backendRemainingSeconds: activeBackendAttempt.remainingSeconds,
                durationMinutes: activeBackendAttempt.durationMinutes,
                startedAt: activeBackendAttempt.startedAt,
                status: activeBackendAttempt.status,
              });
        }
      } catch {
        // If active lookup fails, keep any local in-progress attempt so answers are not lost.
      }

      if (!storedAttempt) {
        navigateToStudentTestPath(`/student/tests/${testDetails.testId}/start`);
        return;
      }

      const activeAttempt = storedAttempt;
      setTest(testDetails);
      setAttempt(activeAttempt);
      setRemainingMs(getRemainingAttemptMs(activeAttempt));
    });

    return () => {
      active = false;
    };
  }, [testId]);

  useEffect(() => {
    if (!attempt || attempt.submitted) {
      return;
    }

    const tick = () => {
      const nextRemainingMs = getRemainingAttemptMs(attempt);
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0 && !autoSubmitRequestedRef.current) {
        autoSubmitRequestedRef.current = true;
        handleSubmit("Time is up. Your test was auto-submitted.", true);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [attempt]);

  useEffect(() => {
    if (!attempt || attempt.submitted) {
      return;
    }

    let cancelled = false;

    const syncBackendTime = async () => {
      try {
        const activeBackendAttempt = await getActiveStudentTestAttemptApi();
        if (!activeBackendAttempt || activeBackendAttempt.attemptId !== attempt.attemptId || cancelled) {
          return;
        }

        const currentAttempt = getStudentTestAttempt(attempt.testId) ?? attempt;
        const syncedAttempt = syncStudentTestAttemptWithBackendTime(currentAttempt, activeBackendAttempt);
        const nextRemainingMs = getRemainingAttemptMs(syncedAttempt);

        setAttempt(syncedAttempt);
        setRemainingMs(nextRemainingMs);

        if (syncedAttempt.submitted) {
          navigateToStudentTestPath(`/student/tests/${syncedAttempt.testId}/result`);
          return;
        }

        if ((activeBackendAttempt.status === "EXPIRED" || nextRemainingMs <= 0) && !autoSubmitRequestedRef.current) {
          autoSubmitRequestedRef.current = true;
          handleSubmit("Time is up. Your test was auto-submitted.", true);
        }
      } catch {
        // Keep the local countdown running if the server-time sync is temporarily unavailable.
      }
    };

    syncBackendTime();
    const intervalId = window.setInterval(syncBackendTime, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [attempt?.attemptId, attempt?.submitted, attempt?.testId]);

  useEffect(() => {
    if (!attempt || attempt.submitted) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "Your timed test is active. Leaving may interrupt your attempt.";
    };

    const handlePopState = () => {
      const currentAttempt = getStudentTestAttempt(attempt.testId);
      if (currentAttempt && !currentAttempt.submitted) {
        window.history.pushState({ lockedTest: true }, "", `/student/tests/${attempt.testId}/attempt`);
        window.alert("Your timed test is active. Submit the test before leaving this page.");
      }
    };

    window.history.pushState({ lockedTest: true }, "", `/student/tests/${attempt.testId}/attempt`);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [attempt]);

  const answeredCount = useMemo(() => {
    if (!attempt) return 0;
    return Object.values(attempt.answers).filter(isAnswered).length;
  }, [attempt]);

  const questionCount = useMemo(() => test?.sections.reduce((total, section) => total + section.questions.length, 0) ?? 0, [test]);

  const updateAnswer = (questionId: string, answer: StudentTestAnswer) => {
    if (!attempt || attempt.submitted) return;

    const updatedAttempt = updateStudentTestAttemptAnswer(attempt, questionId, answer);
    setSubmitError("");
    setAttempt(updatedAttempt);
  };

  const handleSubmit = async (reason = "Test submitted successfully.", autoSubmitted = false) => {
    if (!attempt || !test || attempt.submitted || submittingRef.current) {
      return;
    }

    const latestAttempt = getStudentTestAttempt(attempt.testId) ?? attempt;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    setSubmitReason(autoSubmitted ? "Time is up. Submitting your saved answers..." : "Submitting your test...");

    try {
      await submitCompleteStudentTestAttemptApi(test, latestAttempt, { autoSubmitted });
      const submittedAttempt = submitStudentTestAttempt(latestAttempt, autoSubmitted);

      setAttempt(submittedAttempt);
      setSubmitReason(reason);
      window.setTimeout(() => navigateToStudentTestPath(`/student/tests/${latestAttempt.testId}/result`), 250);
    } catch (error) {
      submittingRef.current = false;
      setSubmitting(false);
      setSubmitReason("");
      setSubmitError(`${getStudentTestAttemptApiErrorMessage(error)} Your answers are still saved locally. Please retry submit.`);
    }
  };

  const handleCodingRun = async (question: StudentTestCodingQuestion, answer?: StudentTestAnswer) => {
    if (!attempt || attempt.submitted || submitting) return;

    const codingAnswer = resolveCodingAnswer(question, answer);
    setCodingApiState((current) => ({
      ...current,
      [question.id]: { error: "", loading: true, message: "Running code..." },
    }));

    try {
      const result = await runCodingSubmissionApi({
        attemptId: attempt.attemptId,
        codingQuestionId: getCodingQuestionId(question),
        code: codingAnswer.code,
        customInput: question.sampleInput,
        language: codingAnswer.language,
        questionId: question.id,
        testId: attempt.testId,
      });

      setCodingResults((current) => ({ ...current, [question.id]: result }));
      setCodingApiState((current) => ({
        ...current,
        [question.id]: { error: "", loading: false, message: "Run completed." },
      }));
    } catch (error) {
      setCodingApiState((current) => ({
        ...current,
        [question.id]: {
          error: getStudentTestAttemptApiErrorMessage(error),
          loading: false,
          message: "",
        },
      }));
    }
  };

  const handleCodingSubmit = async (question: StudentTestCodingQuestion, answer?: StudentTestAnswer) => {
    if (!attempt || attempt.submitted || submitting) return;

    const codingAnswer = resolveCodingAnswer(question, answer);
    setCodingApiState((current) => ({
      ...current,
      [question.id]: { error: "", loading: true, message: "Submitting code..." },
    }));

    try {
      const result = await submitCodingSubmissionApi({
        attemptId: attempt.attemptId,
        codingQuestionId: getCodingQuestionId(question),
        code: codingAnswer.code,
        language: codingAnswer.language,
        questionId: question.id,
        testId: attempt.testId,
      });

      setCodingResults((current) => ({ ...current, [question.id]: result }));
      setCodingApiState((current) => ({
        ...current,
        [question.id]: { error: "", loading: false, message: "Coding submission saved." },
      }));
    } catch (error) {
      setCodingApiState((current) => ({
        ...current,
        [question.id]: {
          error: getStudentTestAttemptApiErrorMessage(error),
          loading: false,
          message: "",
        },
      }));
    }
  };

  if (!test || !attempt) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-text-primary">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
          <p className="text-[16px] font-extrabold">Loading timed test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 px-4 py-4 shadow-header backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-extrabold uppercase text-red">Timed test active</p>
            <h1 className="truncate text-[22px] font-extrabold text-text-primary sm:text-[28px]">{test.title}</h1>
            <p className="mt-1 text-[13px] font-semibold text-text-secondary">
              {test.subject} - {test.batch} - Frontend lock is UX protection only
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-red bg-red-soft px-4 py-3">
              <div className="flex items-center gap-2 text-red">
                <Clock3 aria-hidden="true" size={19} strokeWidth={2.5} />
                <span className="text-[24px] font-extrabold tabular-nums">{formatRemainingTime(remainingMs)}</span>
              </div>
            </div>
            <button
              type="button"
              className="h-12 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting || attempt.submitted}
              onClick={() => handleSubmit("Test submitted successfully.")}
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <AttemptMetric icon={ListChecks} label="Answered" value={`${answeredCount}/${questionCount}`} />
          <AttemptMetric icon={FileText} label="Sections" value={test.sections.length} />
          <AttemptMetric icon={CheckCircle2} label="Total marks" value={test.totalMarks} />
        </section>

        {submitReason ? (
          <section className="rounded-3xl border border-primary bg-primary-soft p-4 text-[14px] font-bold text-primary-dark">
            {submitReason}
          </section>
        ) : null}

        {submitError ? (
          <section className="flex flex-col gap-3 rounded-3xl border border-red bg-red-soft p-4 text-[14px] font-bold text-red sm:flex-row sm:items-center sm:justify-between">
            <span>{submitError}</span>
            <button
              type="button"
              className="h-10 rounded-2xl bg-red px-4 text-[13px] font-extrabold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting}
              onClick={() => handleSubmit("Test submitted successfully.")}
            >
              Retry Submit
            </button>
          </section>
        ) : null}

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-orange" size={19} strokeWidth={2.5} />
            <p className="text-[14px] leading-6 text-text-secondary">
              Do not use browser back or refresh during the active test. Refresh restores this attempt from the original start time; it does not reset the timer.
            </p>
          </div>
        </section>

        {test.sections.map((section) => (
          <section key={section.id} className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[22px] font-extrabold text-text-primary">{section.title}</h2>
                <p className="mt-1 text-[13px] font-semibold text-text-secondary">
                  {section.questions.length} question(s) - {section.marks} marks
                </p>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
                {section.sectionType}
              </span>
            </div>

            <div className="space-y-4">
              {section.sectionType === "MCQ"
                ? section.questions.map((question, index) => (
                    <McqAttemptQuestion
                      answer={attempt.answers[question.id]}
                      index={index}
                      key={question.id}
                      onChange={updateAnswer}
                      question={question}
                    />
                  ))
                : null}

              {section.sectionType === "QA"
                ? section.questions.map((question, index) => (
                    <QaAttemptQuestion
                      answer={attempt.answers[question.id]}
                      index={index}
                      key={question.id}
                      onChange={updateAnswer}
                      question={question}
                    />
                  ))
                : null}

              {section.sectionType === "CODING"
                ? section.questions.map((question, index) => (
                    <CodingAttemptQuestion
                      answer={attempt.answers[question.id]}
                      apiState={codingApiState[question.id]}
                      executionResult={codingResults[question.id]}
                      index={index}
                      key={question.id}
                      onChange={updateAnswer}
                      onRun={handleCodingRun}
                      onSubmit={handleCodingSubmit}
                      question={question}
                    />
                  ))
                : null}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function AttemptMetric({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string | number }) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
          <p className="mt-3 text-[26px] font-extrabold text-text-primary">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
        </span>
      </div>
    </article>
  );
}

function McqAttemptQuestion({
  answer,
  index,
  onChange,
  question,
}: {
  answer?: StudentTestAnswer;
  index: number;
  onChange: (questionId: string, answer: StudentTestAnswer) => void;
  question: StudentTestMcqQuestion;
}) {
  const selectedOptionIndex = answer?.sectionType === "MCQ" ? answer.selectedOptionIndex : null;

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <h3 className="text-[16px] font-extrabold leading-6 text-text-primary">Q{index + 1}. {question.questionText}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {question.options.map((option, optionIndex) => (
          <label
            key={`${question.id}-${optionIndex}`}
            className={selectedOptionIndex === optionIndex ? "rounded-2xl border border-primary bg-primary-soft p-4" : "rounded-2xl border border-border bg-surface p-4"}
          >
            <input
              checked={selectedOptionIndex === optionIndex}
              className="sr-only"
              name={question.id}
              onChange={() =>
                onChange(question.id, {
                  questionId: question.id,
                  sectionType: "MCQ",
                  selectedOptionIndex: optionIndex,
                })
              }
              type="radio"
            />
            <span className="text-[14px] font-bold text-text-primary">{String.fromCharCode(65 + optionIndex)}. {option}</span>
          </label>
        ))}
      </div>
    </article>
  );
}

function QaAttemptQuestion({
  answer,
  index,
  onChange,
  question,
}: {
  answer?: StudentTestAnswer;
  index: number;
  onChange: (questionId: string, answer: StudentTestAnswer) => void;
  question: StudentTestQaQuestion;
}) {
  const value = answer?.sectionType === "QA" ? answer.text : "";

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <h3 className="text-[16px] font-extrabold leading-6 text-text-primary">Q{index + 1}. {question.questionText}</h3>
      <textarea
        className="mt-4 min-h-36 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] font-semibold leading-6 text-text-primary outline-none transition focus:border-primary"
        onChange={(event) =>
          onChange(question.id, {
            questionId: question.id,
            sectionType: "QA",
            text: event.target.value,
          })
        }
        placeholder="Write your answer here"
        value={value}
      />
    </article>
  );
}

function CodingAttemptQuestion({
  answer,
  apiState,
  executionResult,
  index,
  onChange,
  onRun,
  onSubmit,
  question,
}: {
  answer?: StudentTestAnswer;
  apiState?: { error: string; loading: boolean; message: string };
  executionResult?: CodingExecutionResult;
  index: number;
  onChange: (questionId: string, answer: StudentTestAnswer) => void;
  onRun: (question: StudentTestCodingQuestion, answer?: StudentTestAnswer) => void;
  onSubmit: (question: StudentTestCodingQuestion, answer?: StudentTestAnswer) => void;
  question: StudentTestCodingQuestion;
}) {
  const currentAnswer = resolveCodingAnswer(question, answer);
  const language = normalizeCodingLanguage(currentAnswer.language);
  const problem = toCodeConnectProblem(question, index);
  const result = executionResult ?? makeReadyCodingResult();

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Code2 aria-hidden="true" className="text-blue" size={18} strokeWidth={2.5} />
            <h3 className="text-[17px] font-extrabold leading-6 text-text-primary">Problem {index + 1}. {question.title}</h3>
          </div>
          <p className="mt-3 text-[14px] leading-6 text-text-secondary">{question.problemStatement}</p>
        </div>
        <span className="w-fit rounded-full bg-blue-soft px-3 py-1 text-[12px] font-extrabold text-blue">
          {question.marks} marks
        </span>
      </div>

      <section className="grid gap-4 xl:grid-cols-[45fr_55fr]">
        <section className="max-h-[760px] overflow-y-auto rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-5">
          <ProblemStatement problem={problem} />
        </section>

        <div className="space-y-4">
          <CodeEditor
            code={currentAnswer.code}
            language={language}
            onCodeChange={(code) =>
              onChange(question.id, {
                ...currentAnswer,
                code,
                language,
              })
            }
            onLanguageChange={(nextLanguage) =>
              onChange(question.id, {
                ...currentAnswer,
                language: nextLanguage,
              })
            }
            onResetCode={() =>
              onChange(question.id, {
                ...currentAnswer,
                code: question.starterCode,
                language,
              })
            }
            onRun={() => onRun(question, currentAnswer)}
            onSubmit={() => onSubmit(question, currentAnswer)}
            problem={problem}
            submitLabel="Submit Code"
          />
          <CodingTestResultPanel apiState={apiState} problem={problem} result={result} />
        </div>
      </section>
    </article>
  );
}

function resolveCodingAnswer(question: StudentTestCodingQuestion, answer?: StudentTestAnswer): Extract<StudentTestAnswer, { sectionType: "CODING" }> {
  if (answer?.sectionType === "CODING") {
    return answer;
  }

  return {
    code: question.starterCode,
    language: normalizeCodingLanguage(question.allowedLanguages[0] ?? "javascript"),
    questionId: question.id,
    sectionType: "CODING",
  };
}

function getCodingQuestionId(question: StudentTestCodingQuestion) {
  return question.codingQuestionId ?? question.id;
}

function normalizeCodingLanguage(value: string): CodingLanguage {
  const normalized = value.toLowerCase();

  if (normalized.includes("python")) return "python";
  if (normalized.includes("javascript") || normalized.includes("typescript") || normalized.includes("js") || normalized.includes("ts")) return "javascript";
  if (normalized.includes("c++") || normalized.includes("cpp")) return "cpp";
  if (normalized.includes("java")) return "java";

  return "javascript";
}

function toCodeConnectProblem(question: StudentTestCodingQuestion, index: number): CodingProblem {
  return {
    accuracy: 0,
    constraints: question.constraints.split(/\r?\n/).filter(Boolean),
    description: question.problemStatement,
    difficulty: "medium",
    examples: [
      {
        input: question.sampleInput,
        output: question.sampleOutput,
      },
    ],
    id: question.id,
    inputFormat: question.inputFormat,
    outputFormat: question.outputFormat,
    problemNumber: index + 1,
    sampleInput: question.sampleInput,
    sampleOutput: question.sampleOutput,
    solvedCount: 0,
    starterCode: {
      cpp: question.starterCode,
      java: question.starterCode,
      javascript: question.starterCode,
      python: question.starterCode,
    },
    statement: question.problemStatement,
    status: "in-progress",
    testCases: [
      {
        description: "Sample case",
        expectedOutput: question.sampleOutput,
        id: `${question.id}-sample`,
        input: question.sampleInput,
      },
    ],
    title: question.title,
    topic: "Test Coding",
  };
}

function makeReadyCodingResult(): CodingExecutionResult {
  return {
    memory: "-",
    output: "Run code to see backend output here.",
    passed: 0,
    runtime: "-",
    status: "Ready",
    total: 1,
  };
}

function CodingTestResultPanel({
  apiState,
  problem,
  result,
}: {
  apiState?: { error: string; loading: boolean; message: string };
  problem: CodingProblem;
  result: CodingExecutionResult;
}) {
  const rows = buildCodingResultRows(problem, result);

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">Test cases result</p>
          <h3 className="mt-1 text-[20px] font-extrabold text-text-primary">
            {apiState?.loading ? apiState.message : apiState?.message || result.status}
          </h3>
          <p className="mt-1 text-[13px] font-bold text-text-secondary">
            Runtime {result.runtime} - Memory {result.memory}
          </p>
        </div>
        <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
          {result.passed}/{result.total} passed
        </span>
      </div>

      {apiState?.error ? (
        <p className="mt-4 rounded-2xl border border-red bg-red-soft p-3 text-[13px] font-bold leading-5 text-red">
          {apiState.error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-border bg-surface-soft p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold text-text-primary">{row.label}</p>
                <p className="mt-1 truncate text-[12px] font-bold text-text-secondary">{row.detail}</p>
              </div>
              <span
                className={
                  row.status === "Passed"
                    ? "shrink-0 rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark"
                    : row.status === "Failed"
                      ? "shrink-0 rounded-full bg-red-soft px-3 py-1 text-[12px] font-extrabold text-red"
                      : "shrink-0 rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-muted"
                }
              >
                {row.status}
              </span>
            </div>
          </article>
        ))}
      </div>

      <pre className="mt-4 max-h-44 overflow-auto rounded-2xl bg-[#101827] p-3 text-[12px] leading-5 text-white">
        {result.output}
      </pre>
    </section>
  );
}

function buildCodingResultRows(problem: CodingProblem, result: CodingExecutionResult) {
  const testCases = problem.testCases?.length
    ? problem.testCases
    : [
        {
          description: "Sample case",
          expectedOutput: problem.sampleOutput,
          id: `${problem.id}-sample`,
          input: problem.sampleInput,
        },
      ];
  const rowCount = Math.max(result.total, testCases.length);

  return Array.from({ length: rowCount }, (_, index) => {
    const testCase = testCases[index % testCases.length];

    return {
      detail: index < testCases.length ? testCase.input : "Hidden backend validation case",
      id: `${testCase.id}-${index}`,
      label: index < testCases.length ? testCase.description : `Hidden Case ${index + 1}`,
      status: result.status === "Ready" ? "Pending" : index < result.passed ? "Passed" : "Failed",
    };
  });
}

function isAnswered(answer: StudentTestAnswer) {
  if (answer.sectionType === "MCQ") {
    return answer.selectedOptionIndex !== null;
  }

  if (answer.sectionType === "QA") {
    return answer.text.trim().length > 0;
  }

  return answer.code.trim().length > 0;
}

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
