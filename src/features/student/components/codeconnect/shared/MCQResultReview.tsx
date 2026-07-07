import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { cn } from "../../../../../shared/utils/cn";
import {
  getCorrectAnswerValue,
  getQuestionPoints,
  getQuestionText,
  isAnswerCorrect,
  normalizeQuestionOptions,
  type MCQPracticeQuestion,
} from "./mcqPracticeTypes";

type MCQResultReviewProps<TQuestion extends MCQPracticeQuestion> = {
  onBackToList: () => void;
  onRetry: () => void;
  questions: TQuestion[];
  selectedAnswers: Record<string, string>;
};

const optionLetters = ["A", "B", "C", "D", "E", "F"];

export function MCQResultReview<TQuestion extends MCQPracticeQuestion>({
  onBackToList,
  onRetry,
  questions,
  selectedAnswers,
}: MCQResultReviewProps<TQuestion>) {
  const attemptedCount = questions.filter(
    (question) => Boolean(selectedAnswers[question.id]),
  ).length;

  const correctCount = questions.filter((question) =>
    isAnswerCorrect(question, selectedAnswers[question.id]),
  ).length;

  const wrongCount = attemptedCount - correctCount;
  const skippedCount = questions.length - attemptedCount;

  const percentageScore = Math.round(
    (correctCount / Math.max(questions.length, 1)) * 100,
  );

  const xpEarned = questions.reduce(
    (total, question) =>
      isAnswerCorrect(question, selectedAnswers[question.id])
        ? total + getQuestionPoints(question)
        : total,
    0,
  );

  return (
    <section className="min-h-screen bg-background text-text-primary">
      <div className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackToList}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-surface-soft px-4 text-[13px] font-extrabold text-text-primary transition hover:bg-primary-soft hover:text-primary-dark"
          >
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.5} />
            Back to Question List
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
          >
            <RotateCcw aria-hidden="true" size={17} strokeWidth={2.5} />
            Retry Practice
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-[1.5rem] border border-border bg-surface p-5 text-center shadow-card">
          <p className="text-[12px] font-extrabold uppercase tracking-wide text-text-muted">
            Test Complete
          </p>

          <h1 className="mt-2 text-[56px] font-extrabold leading-none text-text-primary">
            {percentageScore}%
          </h1>

          <p className="mt-3 text-[15px] font-bold text-text-secondary">
            {correctCount}/{questions.length} correct
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <ReviewStat label="Total" value={questions.length} />
            <ReviewStat label="Attempted" value={attemptedCount} />
            <ReviewStat label="Correct" value={correctCount} />
            <ReviewStat label="Wrong" value={wrongCount} />
            <ReviewStat label="Skipped" value={skippedCount} />
            <ReviewStat label="XP Earned" value={xpEarned} />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-[22px] font-extrabold text-text-primary">
            Review Answers
          </h2>

          <div className="mt-4 grid gap-5">
            {questions.map((question, index) => {
              const selectedAnswer = selectedAnswers[question.id];
              const correctAnswer = getCorrectAnswerValue(question);
              const isSkipped = !selectedAnswer;
              const isCorrect = isAnswerCorrect(question, selectedAnswer);
              const options = normalizeQuestionOptions(question);

              return (
                <article
                  key={question.id}
                  className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-secondary">
                          Q{index + 1}/{questions.length}
                        </span>

                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[12px] font-extrabold",
                            question.difficulty === "easy"
                              ? "bg-primary-soft text-primary-dark"
                              : question.difficulty === "medium"
                                ? "bg-yellow-soft text-orange"
                                : "bg-red-soft text-red",
                          )}
                        >
                          {question.difficulty}
                        </span>

                        <span className="rounded-full bg-surface-soft px-3 py-1 text-[12px] font-bold text-text-secondary">
                          {question.topic}
                        </span>

                        <span className="rounded-full bg-yellow-soft px-3 py-1 text-[12px] font-extrabold text-text-primary">
                          {getQuestionPoints(question)} XP
                        </span>

                        <ResultBadge
                          isCorrect={isCorrect}
                          isSkipped={isSkipped}
                        />
                      </div>

                      <h3 className="mt-4 text-[20px] font-extrabold leading-8 text-text-primary">
                        {getQuestionText(question)}
                      </h3>
                    </div>

                    <Bookmark
                      aria-hidden="true"
                      size={22}
                      strokeWidth={2.2}
                      className="mt-1 shrink-0 text-text-muted"
                    />
                  </div>

                  <div className="mt-5 grid gap-3">
                    {options.map((option, optionIndex) => {
                      const optionLetter =
                        option.label ?? optionLetters[optionIndex] ?? "";

                      const optionValue = String(option.value);
                      const selectedValue = selectedAnswer
                        ? String(selectedAnswer)
                        : "";
                      const correctValue = correctAnswer
                        ? String(correctAnswer)
                        : "";

                      const isSelectedOption =
                        selectedValue === optionValue ||
                        selectedValue === optionLetter;

                      const isCorrectOption =
                        correctValue === optionValue ||
                        correctValue === optionLetter;

                      return (
                        <OptionReviewRow
                          key={`${question.id}-${optionValue}-${optionIndex}`}
                          isCorrectOption={isCorrectOption}
                          isSelectedOption={isSelectedOption}
                          label={optionLetter}
                          value={optionValue}
                        />
                      );
                    })}
                  </div>

                  {isSkipped ? (
                    <div className="mt-4 rounded-2xl border border-border bg-surface-soft p-4">
                      <p className="text-[13px] font-extrabold text-text-primary">
                        You skipped this question.
                      </p>

                      <p className="mt-1 text-[13px] font-bold text-text-secondary">
                        Correct answer:{" "}
                        <span className="font-extrabold text-primary-dark">
                          {correctAnswer || "Not provided"}
                        </span>
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-2xl bg-surface-soft p-4">
                    <p className="text-[13px] font-extrabold text-text-primary">
                      Explanation:
                    </p>

                    <p className="mt-2 text-[14px] font-bold leading-6 text-text-secondary">
                      {question.explanation ?? "No explanation available."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </section>
  );
}

function ResultBadge({
  isCorrect,
  isSkipped,
}: {
  isCorrect: boolean;
  isSkipped: boolean;
}) {
  if (isSkipped) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-secondary">
        Skipped
      </span>
    );
  }

  if (isCorrect) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
        <CheckCircle2 aria-hidden="true" size={14} strokeWidth={2.5} />
        Correct
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-soft px-3 py-1 text-[12px] font-extrabold text-red">
      <XCircle aria-hidden="true" size={14} strokeWidth={2.5} />
      Wrong
    </span>
  );
}

function OptionReviewRow({
  isCorrectOption,
  isSelectedOption,
  label,
  value,
}: {
  isCorrectOption: boolean;
  isSelectedOption: boolean;
  label: string;
  value: string;
}) {
  const isWrongSelected = isSelectedOption && !isCorrectOption;

  return (
    <div
      className={cn(
        "flex min-h-[68px] items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition",
        isCorrectOption
          ? "border-primary bg-primary-soft"
          : isWrongSelected
            ? "border-red bg-red-soft"
            : "border-border bg-surface-soft",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-[13px] font-extrabold",
            isCorrectOption
              ? "bg-primary text-white"
              : isWrongSelected
                ? "bg-red text-white"
                : "bg-surface text-text-primary",
          )}
        >
          {label}
        </span>

        <p
          className={cn(
            "min-w-0 text-[15px] font-extrabold leading-6",
            isCorrectOption
              ? "text-primary-dark"
              : isWrongSelected
                ? "text-red"
                : "text-text-primary",
          )}
        >
          {value}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isSelectedOption ? (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-extrabold",
              isCorrectOption
                ? "bg-primary text-white"
                : "bg-red text-white",
            )}
          >
            Selected
          </span>
        ) : null}

        {isCorrectOption ? (
          <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold text-white">
            Correct
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ReviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface-soft p-4 shadow-card">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-[24px] font-extrabold text-text-primary">
        {value}
      </p>
    </div>
  );
}