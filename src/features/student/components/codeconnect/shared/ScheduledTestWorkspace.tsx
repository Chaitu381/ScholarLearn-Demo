import {
  aptitudeQuestions,
  reasoningQuestions,
  verbalQuestions,
} from "../../../data/codeconnectMockData";
import { codeconnectScheduledTests } from "../../../data/codeconnectScheduledTests";
import type {
  CodeConnectScheduledTest,
  PracticeQuestion,
} from "../../../types/codeconnect.types";
import { MCQPracticeWorkspace } from "./MCQPracticeWorkspace";

type ScheduledTestWorkspaceProps = {
  onBackToList: () => void;
  scheduledTestId?: string;
};

export function ScheduledTestWorkspace({
  onBackToList,
  scheduledTestId,
}: ScheduledTestWorkspaceProps) {
  const scheduledTest =
    codeconnectScheduledTests.find((test) => test.id === scheduledTestId) ??
    codeconnectScheduledTests.find((test) => test.status === "available") ??
    codeconnectScheduledTests[0];

  if (!scheduledTest) {
    return (
      <section className="min-h-screen bg-background p-4 text-text-primary sm:p-6">
        <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center shadow-card">
          <h2 className="text-[22px] font-extrabold text-text-primary">
            No scheduled test found
          </h2>
          <p className="mt-2 text-[14px] font-bold leading-6 text-text-secondary">
            Go back to the scheduled test list and choose another test.
          </p>
          <button
            type="button"
            onClick={onBackToList}
            className="mt-5 h-11 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
          >
            Back to Scheduled Tests
          </button>
        </div>
      </section>
    );
  }

  return (
    <MCQPracticeWorkspace
      category={scheduledTest.category}
      durationMinutes={scheduledTest.durationMinutes}
      mode="scheduled-test"
      onBackToHub={onBackToList}
      questions={buildScheduledQuestions(scheduledTest)}
      testId={scheduledTest.id}
      testTitle={scheduledTest.title}
    />
  );
}

function buildScheduledQuestions(test: CodeConnectScheduledTest) {
  const bank = getQuestionBank(test.category);
  const questionById = new Map(bank.map((question) => [question.id, question]));

  return test.questionIds
    .map((questionId) => questionById.get(questionId))
    .filter(isPracticeQuestion);
}

function getQuestionBank(category: CodeConnectScheduledTest["category"]) {
  if (category === "aptitude") {
    return aptitudeQuestions;
  }

  if (category === "reasoning") {
    return reasoningQuestions;
  }

  return verbalQuestions;
}

function isPracticeQuestion(
  question: PracticeQuestion | undefined,
): question is PracticeQuestion {
  return question !== undefined;
}
