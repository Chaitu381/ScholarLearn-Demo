import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileText, ListChecks } from "lucide-react";
import { PageTitle } from "../../../shared/components/ui/PageTitle";
import { MetricCard, PageCard, StudentPage, ToneBadge } from "../components/StudentPagePrimitives";
import { getStudentTestDetails } from "../services/studentApi";
import {
  getCodingSubmissionsByAttemptApi,
  getStudentTestAttemptApiErrorMessage,
  getTestAttemptResultApi,
} from "../services/studentTestAttemptApi";
import { getStudentTestAttempt, navigateToStudentTestPath } from "../services/studentTestAttemptStorage";
import type { StudentTestAnswer, StudentTestAttemptState, StudentTestDetails } from "../types/student.types";

export function StudentTestResult({ testId }: { testId: string }) {
  const [test, setTest] = useState<StudentTestDetails | null>(null);
  const [attempt, setAttempt] = useState<StudentTestAttemptState | null>(null);
  const [backendResult, setBackendResult] = useState<unknown>(null);
  const [codingSubmissions, setCodingSubmissions] = useState<unknown>(null);
  const [resultApiState, setResultApiState] = useState({ error: "", loading: false });

  useEffect(() => {
    let active = true;

    getStudentTestDetails(testId).then((testDetails) => {
      if (!active) return;
      const storedAttempt = getStudentTestAttempt(testDetails.testId);
      setTest(testDetails);
      setAttempt(storedAttempt);

      if (!storedAttempt?.attemptId) {
        return;
      }

      setResultApiState({ error: "", loading: true });
      Promise.all([
        getTestAttemptResultApi(storedAttempt.attemptId),
        getCodingSubmissionsByAttemptApi(storedAttempt.attemptId),
      ])
        .then(([attemptResult, codingSubmissionResult]) => {
          if (!active) return;
          setBackendResult(attemptResult);
          setCodingSubmissions(codingSubmissionResult);
          setResultApiState({ error: "", loading: false });
        })
        .catch((error) => {
          if (!active) return;
          setResultApiState({
            error: getStudentTestAttemptApiErrorMessage(error),
            loading: false,
          });
        });
    });

    return () => {
      active = false;
    };
  }, [testId]);

  const answerSummary = useMemo(() => {
    if (!attempt) {
      return { answered: 0, total: 0 };
    }

    const answers = Object.values(attempt.answers);
    return {
      answered: answers.filter(isAnswered).length,
      total: answers.length,
    };
  }, [attempt]);

  if (!test) {
    return (
      <StudentPage>
        <PageTitle title="Result Summary" description="Loading summary..." />
      </StudentPage>
    );
  }

  if (!attempt) {
    return (
      <StudentPage>
        <PageTitle title="No attempt found" description="Start the test before viewing a summary." />
        <button
          type="button"
          className="h-11 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white"
          onClick={() => navigateToStudentTestPath(`/student/tests/${test.testId}/start`)}
        >
          Go to Start Page
        </button>
      </StudentPage>
    );
  }

  return (
    <StudentPage>
      <PageTitle
        title="Test Summary"
        description={attempt.submitted ? "Your test attempt has been submitted." : "This attempt is not submitted yet."}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CheckCircle2} label="Status" value={attempt.submitted ? "Submitted" : "Active"} helper={test.title} tone="primary" />
        <MetricCard icon={ListChecks} label="Answered" value={`${answerSummary.answered}/${answerSummary.total}`} helper="Saved locally" tone="blue" />
        <MetricCard icon={Clock3} label="Duration" value={`${attempt.durationMinutes} min`} helper={`Started ${formatDateTime(attempt.startedAt)}`} tone="orange" />
        <MetricCard icon={FileText} label="Sections" value={test.sections.length} helper={`${test.totalMarks} total marks`} tone="yellow" />
      </div>

      <PageCard
        title="Backend Result"
        description="Live scoring and coding submission status from the test attempt APIs."
      >
        {resultApiState.loading ? (
          <p className="rounded-2xl bg-surface-soft p-4 text-[14px] font-bold text-text-secondary">Loading backend result...</p>
        ) : resultApiState.error ? (
          <p className="rounded-2xl border border-orange bg-orange-soft p-4 text-[14px] font-bold text-orange">
            {resultApiState.error}
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <BackendPayloadCard title="Attempt result" payload={backendResult} />
            <BackendPayloadCard title="Coding submissions" payload={codingSubmissions} />
          </div>
        )}
      </PageCard>

      <PageCard
        title="Section-wise Answers"
        description="This frontend summary confirms saved responses. Final scoring should be returned by backend evaluation."
      >
        <div className="space-y-5">
          {test.sections.map((section) => (
            <section key={section.id} className="rounded-3xl border border-border bg-surface-soft p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[18px] font-extrabold text-text-primary">{section.title}</h2>
                  <p className="mt-1 text-[13px] font-semibold text-text-secondary">{section.marks} marks</p>
                </div>
                <ToneBadge label={section.sectionType} tone="blue" />
              </div>
              <div className="space-y-3">
                {section.questions.map((question, index) => (
                  <AnswerSummaryRow
                    answer={attempt.answers[question.id]}
                    index={index}
                    key={question.id}
                    questionText={"questionText" in question ? question.questionText : question.title}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageCard>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="h-11 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
          onClick={() => navigateToStudentTestPath("/#tests")}
        >
          Back to Test & Exam
        </button>
      </div>
    </StudentPage>
  );
}

function BackendPayloadCard({ payload, title }: { payload: unknown; title: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <h3 className="text-[15px] font-extrabold text-text-primary">{title}</h3>
      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-surface p-3 text-[12px] font-semibold leading-5 text-text-secondary">
        {formatBackendPayload(payload)}
      </pre>
    </article>
  );
}

function formatBackendPayload(payload: unknown) {
  if (payload === null || payload === undefined) {
    return "No backend result returned yet.";
  }

  if (typeof payload === "string") {
    return payload;
  }

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return "Backend result could not be displayed.";
  }
}

function AnswerSummaryRow({
  answer,
  index,
  questionText,
}: {
  answer?: StudentTestAnswer;
  index: number;
  questionText: string;
}) {
  return (
    <article className="rounded-2xl bg-surface p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[14px] font-extrabold text-text-primary">Q{index + 1}. {questionText}</p>
          <p className="mt-2 text-[13px] leading-6 text-text-secondary">{summarizeAnswer(answer)}</p>
        </div>
        <ToneBadge label={answer && isAnswered(answer) ? "Answered" : "Not answered"} tone={answer && isAnswered(answer) ? "primary" : "orange"} />
      </div>
    </article>
  );
}

function summarizeAnswer(answer?: StudentTestAnswer) {
  if (!answer) {
    return "No answer saved.";
  }

  if (answer.sectionType === "MCQ") {
    return answer.selectedOptionIndex === null
      ? "No option selected."
      : `Selected option ${String.fromCharCode(65 + answer.selectedOptionIndex)}.`;
  }

  if (answer.sectionType === "QA") {
    return answer.text.trim() || "No written answer.";
  }

  return `${answer.language} solution saved (${answer.code.trim().length} characters).`;
}

function isAnswered(answer: StudentTestAnswer) {
  if (answer.sectionType === "MCQ") return answer.selectedOptionIndex !== null;
  if (answer.sectionType === "QA") return answer.text.trim().length > 0;
  return answer.code.trim().length > 0;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "short" });
}
