import {
  BookOpenText,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { cn } from "../../../../../shared/utils/cn";
import {
  formatDifficultyLabel,
  getCorrectAnswerValue,
  getQuestionPoints,
  getQuestionText,
  isAnswerCorrect,
  normalizeQuestionOptions,
  type MCQPracticeQuestion,
} from "./mcqPracticeTypes";

type MCQQuestionCardProps<TQuestion extends MCQPracticeQuestion> = {
  allowIndividualSubmit?: boolean;
  currentIndex: number;
  isBookmarked: boolean;
  isSubmitted: boolean;
  onNextQuestion: () => void;
  onSelectAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
  onToggleBookmark: () => void;
  question: TQuestion;
  selectedAnswer?: string;
  totalQuestions: number;
};

const difficultyClasses: Record<MCQPracticeQuestion["difficulty"], string> = {
  easy: "bg-primary-soft text-primary-dark",
  medium: "bg-orange-soft text-orange",
  hard: "bg-red-soft text-red",
};

export function MCQQuestionCard<TQuestion extends MCQPracticeQuestion>({
  allowIndividualSubmit = true,
  currentIndex,
  isBookmarked,
  isSubmitted,
  onNextQuestion,
  onSelectAnswer,
  onSubmitAnswer,
  onToggleBookmark,
  question,
  selectedAnswer,
  totalQuestions,
}: MCQQuestionCardProps<TQuestion>) {
  const options = normalizeQuestionOptions(question);
  const isCorrect = isSubmitted && isAnswerCorrect(question, selectedAnswer);
  const correctAnswer = getCorrectAnswerValue(question);

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-soft px-3 py-1 text-[12px] font-extrabold text-blue">
            <BookOpenText aria-hidden="true" size={14} strokeWidth={2.5} />
            Question {currentIndex + 1} of {totalQuestions}
          </span>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-extrabold",
              difficultyClasses[question.difficulty],
            )}
          >
            {formatDifficultyLabel(question.difficulty)}
          </span>

          <span className="rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-secondary">
            {question.topic}
          </span>

          <span className="rounded-full bg-yellow-soft px-3 py-1 text-[12px] font-extrabold text-text-primary">
            {getQuestionPoints(question)} XP
          </span>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex h-11 w-fit items-center gap-2 rounded-2xl px-4 text-[13px] font-extrabold transition",
            isBookmarked
              ? "bg-primary-soft text-primary-dark"
              : "bg-surface-soft text-text-primary hover:bg-primary-soft hover:text-primary-dark",
          )}
          onClick={onToggleBookmark}
        >
          {isBookmarked ? (
            <BookmarkCheck aria-hidden="true" size={16} strokeWidth={2.5} />
          ) : (
            <Bookmark aria-hidden="true" size={16} strokeWidth={2.5} />
          )}
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      {question.passage ? (
        <section className="mt-5 rounded-2xl border border-border bg-surface-soft p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue">
              <BookOpenText aria-hidden="true" size={20} strokeWidth={2.5} />
            </span>
            <div>
              <h3 className="text-[16px] font-extrabold text-text-primary">
                Reading passage
              </h3>
              <p className="mt-2 text-[14px] leading-7 text-text-secondary">
                {question.passage}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <h2 className="mt-5 text-[26px] font-extrabold leading-9 text-text-primary">
        {getQuestionText(question)}
      </h2>

      {question.vocabularyNote ? (
        <section className="mt-5 rounded-2xl border border-border bg-yellow-soft p-4 text-text-primary">
          <div className="flex items-start gap-3">
            <Lightbulb
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={20}
              strokeWidth={2.5}
            />
            <div>
              <p className="text-[14px] font-extrabold">Vocabulary note</p>
              <p className="mt-1 text-[13px] font-bold leading-6">
                {question.vocabularyNote}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-3">
        {options.map((option) => {
          const selected = selectedAnswer === option.value;
          const correctOption = isSubmitted && option.value === correctAnswer;
          const wrongSelection = isSubmitted && selected && !correctOption;

          return (
            <button
              key={option.key}
              type="button"
              className={optionClassName({ correctOption, selected, wrongSelection })}
              onClick={() => onSelectAnswer(option.value)}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-[13px] font-extrabold text-text-primary">
                {option.label}
              </span>
              <span className="min-w-0 flex-1 text-left text-[15px] font-extrabold leading-6">
                {option.value}
              </span>
            </button>
          );
        })}
      </div>

      {allowIndividualSubmit && isSubmitted ? (
        <section
          className={cn(
            "mt-5 rounded-2xl border p-4",
            isCorrect
              ? "border-primary bg-primary-soft text-primary-dark"
              : "border-orange bg-orange-soft text-orange",
          )}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={20}
              strokeWidth={2.5}
            />
            <div>
              <p className="text-[15px] font-extrabold">
                {isCorrect ? "Correct answer" : "Review the explanation"}
              </p>
              <p className="mt-2 text-[14px] font-bold leading-6">
                {question.explanation ?? "No explanation available."}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {allowIndividualSubmit ? (
          <button
            type="button"
            className="h-11 rounded-2xl border border-border bg-surface-soft px-5 text-[14px] font-extrabold text-text-primary transition hover:border-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onSubmitAnswer}
            disabled={!selectedAnswer || isSubmitted}
          >
            Submit answer
          </button>
        ) : null}

        {/* <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
          onClick={onNextQuestion}
        >
          Next question
          <ChevronRight aria-hidden="true" size={17} strokeWidth={2.5} />
        </button> */}
      </div>
    </section>
  );
}

function optionClassName({
  correctOption,
  selected,
  wrongSelection,
}: {
  correctOption: boolean;
  selected: boolean;
  wrongSelection: boolean;
}) {
  if (correctOption) {
    return "flex w-full items-center gap-3 rounded-2xl border border-primary bg-primary-soft p-4 text-primary-dark";
  }

  if (wrongSelection) {
    return "flex w-full items-center gap-3 rounded-2xl border border-red bg-red-soft p-4 text-red";
  }

  if (selected) {
    return "flex w-full items-center gap-3 rounded-2xl border border-blue bg-blue-soft p-4 text-blue";
  }

  return "flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-soft p-4 text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark";
}
