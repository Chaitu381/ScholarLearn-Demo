import { ChevronLeft, ChevronRight, Clock, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../../../../shared/utils/cn";
import { MCQQuestionCard } from "./MCQQuestionCard";
import { MCQResultDashboard } from "./MCQResultDashboard";
import { MCQResultReview } from "./MCQResultReview";
import {
  formatCategoryLabel,
  formatDifficultyLabel,
  getQuestionNumber,
  type MCQPracticeCategory,
  type MCQPracticeQuestion,
} from "./mcqPracticeTypes";

type MCQPracticeWorkspaceProps<TQuestion extends MCQPracticeQuestion> = {
  category: MCQPracticeCategory;
  durationMinutes?: number;
  initialQuestionId?: string;
  mode?: "practice" | "scheduled-test";
  onBackToHub: () => void;
  questions: TQuestion[];
  subtitle?: string;
  testId?: string;
  testTitle?: string;
  title?: string;
};

type WorkspaceView = "practice" | "dashboard" | "review";

export function MCQPracticeWorkspace<TQuestion extends MCQPracticeQuestion>({
  category,
  durationMinutes,
  initialQuestionId,
  mode = "practice",
  onBackToHub,
  questions,
  subtitle,
  testId,
  testTitle,
  title,
}: MCQPracticeWorkspaceProps<TQuestion>) {
  const initialQuestion = useMemo(
    () =>
      questions.find((question) => question.id === initialQuestionId) ??
      questions[0],
    [initialQuestionId, questions],
  );

  const sessionQuestions = useMemo(() => {
    if (mode === "scheduled-test") {
      return questions;
    }

    if (!initialQuestion) {
      return questions;
    }

    const sameTopicQuestions = questions.filter(
      (question) => question.topic === initialQuestion.topic,
    );

    return sameTopicQuestions.length > 0 ? sameTopicQuestions : questions;
  }, [initialQuestion, mode, questions]);

  const initialSessionIndex = Math.max(
    sessionQuestions.findIndex(
      (question) => question.id === initialQuestion?.id,
    ),
    0,
  );

  const totalScheduledSeconds = Math.max((durationMinutes ?? 0) * 60, 0);
  const submittedRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(initialSessionIndex);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {},
  );
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<string[]>(
    [],
  );
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<string[]>(
    [],
  );
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("practice");
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [startedAtMs, setStartedAtMs] = useState(() => Date.now());
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(totalScheduledSeconds);

  useEffect(() => {
    submittedRef.current = false;
    setCurrentIndex(initialSessionIndex);
    setSelectedAnswers({});
    setSubmittedQuestionIds([]);
    setBookmarkedQuestionIds([]);
    setWorkspaceView("practice");
    setStartedAt(new Date().toISOString());
    setStartedAtMs(Date.now());
    setDurationSeconds(0);
    setRemainingSeconds(totalScheduledSeconds);
  }, [initialQuestionId, initialSessionIndex, questions, totalScheduledSeconds]);

  useEffect(() => {
    if (
      mode !== "scheduled-test" ||
      workspaceView !== "practice" ||
      totalScheduledSeconds <= 0
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId);
          finishWorkspace(totalScheduledSeconds);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [mode, totalScheduledSeconds, workspaceView]);

  const selectedQuestion = sessionQuestions[currentIndex];
  const categoryLabel = formatCategoryLabel(category);
  const answeredCount = Object.keys(selectedAnswers).length;
  const resolvedTitle = testTitle ?? title ?? `${categoryLabel} MCQ Workspace`;

  const finishWorkspace = (forcedDurationSeconds?: number) => {
    if (submittedRef.current) {
      return;
    }

    submittedRef.current = true;

    const elapsedSeconds =
      forcedDurationSeconds ??
      (mode === "scheduled-test" && totalScheduledSeconds > 0
        ? totalScheduledSeconds - remainingSeconds
        : Math.round((Date.now() - startedAtMs) / 1000));

    setDurationSeconds(Math.max(elapsedSeconds, 0));
    setWorkspaceView("dashboard");
  };

  const handlePreviousQuestion = () => {
    if (sessionQuestions.length === 0) {
      return;
    }

    setCurrentIndex((index) =>
      index === 0 ? sessionQuestions.length - 1 : index - 1,
    );
  };

  const handleNextQuestion = () => {
    if (sessionQuestions.length === 0) {
      return;
    }

    setCurrentIndex((index) =>
      index === sessionQuestions.length - 1 ? 0 : index + 1,
    );
  };

  const handleSubmitCurrentAnswer = () => {
    if (!selectedQuestion || !selectedAnswers[selectedQuestion.id]) {
      return;
    }

    setSubmittedQuestionIds((currentIds) =>
      currentIds.includes(selectedQuestion.id)
        ? currentIds
        : [...currentIds, selectedQuestion.id],
    );
  };

  const handleToggleBookmark = () => {
    if (!selectedQuestion) {
      return;
    }

    setBookmarkedQuestionIds((currentIds) =>
      currentIds.includes(selectedQuestion.id)
        ? currentIds.filter((questionId) => questionId !== selectedQuestion.id)
        : [...currentIds, selectedQuestion.id],
    );
  };

  const handleRetryPractice = () => {
    submittedRef.current = false;
    setCurrentIndex(initialSessionIndex);
    setSelectedAnswers({});
    setSubmittedQuestionIds([]);
    setBookmarkedQuestionIds([]);
    setWorkspaceView("practice");
    setStartedAt(new Date().toISOString());
    setStartedAtMs(Date.now());
    setDurationSeconds(0);
    setRemainingSeconds(totalScheduledSeconds);
  };

  if (workspaceView === "dashboard") {
    return (
      <MCQResultDashboard
        category={category}
        durationSeconds={durationSeconds}
        mode={mode}
        onBackToList={onBackToHub}
        onRetry={handleRetryPractice}
        onReviewAnswers={() => setWorkspaceView("review")}
        questions={sessionQuestions}
        selectedAnswers={selectedAnswers}
        startedAt={startedAt}
        testId={testId}
        testTitle={resolvedTitle}
      />
    );
  }

  if (workspaceView === "review") {
    return (
      <MCQResultReview
        onBackToList={onBackToHub}
        onRetry={handleRetryPractice}
        questions={sessionQuestions}
        selectedAnswers={selectedAnswers}
      />
    );
  }

  if (!selectedQuestion) {
    return (
      <section className="min-h-screen bg-background p-4 text-text-primary sm:p-6">
        <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center shadow-card">
          <h2 className="text-[22px] font-extrabold text-text-primary">
            No questions found
          </h2>

          <p className="mt-2 text-[14px] font-bold leading-6 text-text-secondary">
            Go back to the list and choose another question.
          </p>

          <button
            type="button"
            onClick={onBackToHub}
            className="mt-5 h-11 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
          >
            Back to list
          </button>
        </div>
      </section>
    );
  }

  if (mode === "scheduled-test") {
    return (
      <section className="min-h-screen bg-background text-text-primary">
        <div className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
          <div className="mx-auto grid min-h-[86px] max-w-[1440px] gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:px-8">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
                Scheduled Mock Test
              </p>

              <h1 className="truncate text-[20px] font-extrabold text-text-primary">
                {resolvedTitle}
              </h1>
            </div>

            <div
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[18px] font-extrabold",
                remainingSeconds <= 60
                  ? "bg-red-soft text-red"
                  : "bg-orange-soft text-orange",
              )}
            >
              <Clock aria-hidden="true" size={20} strokeWidth={2.5} />
              {formatCountdown(remainingSeconds)}
            </div>

            <div className="flex justify-start lg:justify-end">
              <button
                type="button"
                onClick={() => finishWorkspace()}
                disabled={submittedRef.current}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[14px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send aria-hidden="true" size={17} strokeWidth={2.5} />
                Submit
              </button>
            </div>
          </div>
        </div>

        <main className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-8">
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-surface-soft p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-9 items-center rounded-2xl bg-surface px-4 text-[12px] font-extrabold text-text-secondary">
                  {categoryLabel}
                </span>

                <span className="inline-flex h-9 items-center rounded-2xl bg-surface px-4 text-[12px] font-extrabold text-text-secondary">
                  {selectedQuestion.topic}
                </span>

                <span className="inline-flex h-9 items-center rounded-2xl bg-primary-soft px-4 text-[12px] font-extrabold text-primary-dark">
                  {formatDifficultyLabel(selectedQuestion.difficulty)}
                </span>

                <span className="inline-flex h-9 items-center rounded-2xl bg-blue-soft px-4 text-[12px] font-extrabold text-blue">
                  Question {currentIndex + 1}/{sessionQuestions.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousQuestion}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-[12px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                >
                  <ChevronLeft aria-hidden="true" size={16} strokeWidth={2.5} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[12px] font-extrabold text-white transition hover:bg-primary-dark"
                >
                  Next
                  <ChevronRight aria-hidden="true" size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <MCQQuestionCard
              allowIndividualSubmit={false}
              currentIndex={currentIndex}
              isBookmarked={bookmarkedQuestionIds.includes(selectedQuestion.id)}
              isSubmitted={false}
              onNextQuestion={handleNextQuestion}
              onSelectAnswer={(answer) =>
                setSelectedAnswers((currentAnswers) => ({
                  ...currentAnswers,
                  [selectedQuestion.id]: answer,
                }))
              }
              onSubmitAnswer={handleSubmitCurrentAnswer}
              onToggleBookmark={handleToggleBookmark}
              question={selectedQuestion}
              selectedAnswer={selectedAnswers[selectedQuestion.id]}
              totalQuestions={sessionQuestions.length}
            />
          </section>

          <aside className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
                  Navigator
                </p>

                <h2 className="mt-1 text-[18px] font-extrabold text-text-primary">
                  Questions
                </h2>
              </div>

              <span className="rounded-2xl bg-blue-soft px-3 py-2 text-[12px] font-extrabold text-blue">
                {answeredCount}/{sessionQuestions.length}
              </span>
            </div>

            <div className="mt-4 grid max-h-[calc(100vh-230px)] grid-cols-5 gap-2 overflow-y-auto pr-1">
              {sessionQuestions.map((question, index) => {
                const isCurrent = index === currentIndex;
                const isAnswered = Boolean(selectedAnswers[question.id]);

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "grid h-10 place-items-center rounded-2xl text-[12px] font-extrabold transition",
                      isCurrent
                        ? "bg-primary text-white"
                        : isAnswered
                          ? "bg-blue-soft text-blue"
                          : "bg-surface-soft text-text-secondary hover:bg-primary-soft hover:text-primary-dark",
                    )}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </aside>
        </main>
      </section>
    );
  }

  return (
    <section className="grid gap-5 text-text-primary">
      <section className="rounded-[1.5rem] border border-border bg-surface p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-9 items-center rounded-2xl bg-surface-soft px-4 text-[12px] font-extrabold text-text-secondary">
              {selectedQuestion.topic}
            </span>

            <span className="inline-flex h-9 items-center rounded-2xl bg-primary-soft px-4 text-[12px] font-extrabold text-primary-dark">
              {formatDifficultyLabel(selectedQuestion.difficulty)}
            </span>

            <span className="inline-flex h-9 items-center rounded-2xl bg-blue-soft px-4 text-[12px] font-extrabold text-blue">
              Question {currentIndex + 1}/{sessionQuestions.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={handlePreviousQuestion}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-surface-soft px-4 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
            >
              <ChevronLeft aria-hidden="true" size={17} />
              Previous
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-surface-soft px-4 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
            >
              Next
              <ChevronRight aria-hidden="true" size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-[1.5rem] bg-surface-soft p-4 sm:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
          CodeConnect {categoryLabel}
        </p>

        <h1 className="mt-1 text-[24px] font-extrabold leading-tight text-text-primary">
          {resolvedTitle}
        </h1>

        <p className="mt-1 text-[13px] font-bold leading-6 text-text-secondary">
          {subtitle ??
            `Started from question ${getQuestionNumber(
              selectedQuestion,
            )}. This session includes questions from ${selectedQuestion.topic}.`}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {sessionQuestions.map((question, index) => {
            const isCurrent = index === currentIndex;
            const isAnswered = Boolean(selectedAnswers[question.id]);
            const isSubmitted = submittedQuestionIds.includes(question.id);

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-2xl text-[12px] font-extrabold transition",
                  isCurrent
                    ? "bg-primary text-white"
                    : isSubmitted
                      ? "bg-primary-soft text-primary-dark"
                      : isAnswered
                        ? "bg-blue-soft text-blue"
                        : "bg-surface text-text-secondary hover:bg-primary-soft hover:text-primary-dark",
                )}
                aria-label={`Go to question ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </section>

      <MCQQuestionCard
        currentIndex={currentIndex}
        isBookmarked={bookmarkedQuestionIds.includes(selectedQuestion.id)}
        isSubmitted={submittedQuestionIds.includes(selectedQuestion.id)}
        onNextQuestion={handleNextQuestion}
        onSelectAnswer={(answer) =>
          setSelectedAnswers((currentAnswers) => ({
            ...currentAnswers,
            [selectedQuestion.id]: answer,
          }))
        }
        onSubmitAnswer={handleSubmitCurrentAnswer}
        onToggleBookmark={handleToggleBookmark}
        question={selectedQuestion}
        selectedAnswer={selectedAnswers[selectedQuestion.id]}
        totalQuestions={sessionQuestions.length}
      />

      <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] font-bold text-text-secondary">
          Answered {answeredCount} of {sessionQuestions.length}. You can change
          answers before finishing.
        </p>

        <button
          type="button"
          onClick={() => finishWorkspace()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
        >
          <Send aria-hidden="true" size={17} />
          Submit All / Finish Practice
        </button>
      </div>
    </section>
  );
}

function formatCountdown(totalSeconds: number) {
  const normalizedSeconds = Math.max(Math.round(totalSeconds), 0);
  const minutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}