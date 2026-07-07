import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  AttemptResult,
  TopicPerformanceResult,
} from "../../../types/codeconnect.types";
import {
  formatCategoryLabel,
  getQuestionPoints,
  isAnswerCorrect,
  type MCQPracticeCategory,
  type MCQPracticeQuestion,
} from "./mcqPracticeTypes";

const attemptStorageKey = "codeconnect_mcq_attempts";

type MCQResultDashboardProps<TQuestion extends MCQPracticeQuestion> = {
  category: MCQPracticeCategory;
  durationSeconds: number;
  mode?: "practice" | "scheduled-test";
  onBackToList: () => void;
  onRetry: () => void;
  onReviewAnswers: () => void;
  questions: TQuestion[];
  selectedAnswers: Record<string, string>;
  startedAt: string;
  testId?: string;
  testTitle?: string;
};

export function MCQResultDashboard<TQuestion extends MCQPracticeQuestion>({
  category,
  durationSeconds,
  mode = "practice",
  onBackToList,
  onRetry,
  onReviewAnswers,
  questions,
  selectedAnswers,
  startedAt,
  testId,
  testTitle,
}: MCQResultDashboardProps<TQuestion>) {
  const categoryLabel = formatCategoryLabel(category);
  const resolvedTitle =
    testTitle ??
    `${categoryLabel} ${mode === "scheduled-test" ? "Scheduled Test" : "Practice"}`;
  const attempt = useMemo(
    () =>
      calculateAttemptResult({
        category,
        durationSeconds,
        questions,
        selectedAnswers,
        startedAt,
        testId,
        title: resolvedTitle,
      }),
    [
      category,
      durationSeconds,
      questions,
      resolvedTitle,
      selectedAnswers,
      startedAt,
      testId,
    ],
  );
  const [recentAttempts, setRecentAttempts] = useState<AttemptResult[]>([
    attempt,
  ]);

  useEffect(() => {
    setRecentAttempts(saveAttemptResult(attempt));
  }, [attempt]);

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
          <div className="min-w-0 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
              CodeConnect {categoryLabel}
            </p>
            <h1 className="truncate text-[24px] font-extrabold text-text-primary">
              Result Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
          >
            <RotateCcw aria-hidden="true" size={16} strokeWidth={2.5} />
            Retry
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-[1.5rem] bg-surface-soft p-4 sm:p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
            {resolvedTitle}
          </p>
          <h2 className="mt-1 text-[28px] font-extrabold text-text-primary">
            {attempt.percentageScore}% score
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStat
              icon={Target}
              label="Overall Accuracy"
              value={`${attempt.percentageScore}%`}
            />
            <DashboardStat
              icon={CheckCircle2}
              label="Correct"
              value={`${attempt.correctCount}/${attempt.totalQuestions}`}
            />
            <DashboardStat
              icon={Clock}
              label="Total Time"
              value={formatDuration(attempt.durationSeconds)}
            />
            <DashboardStat
              icon={BarChart3}
              label="XP Earned"
              value={attempt.xpEarned.toString()}
            />
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
          <article className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm sm:p-5">
            <h3 className="text-[20px] font-extrabold text-text-primary">
              Topic Performance
            </h3>
            <div className="mt-5 grid gap-4">
              {attempt.topicPerformance.map((topic) => (
                <TopicRow key={topic.topic} topic={topic} />
              ))}
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm sm:p-5">
            <h3 className="text-[20px] font-extrabold text-text-primary">
              Recent Attempts
            </h3>
            <div className="mt-5 grid gap-3">
              {recentAttempts.slice(0, 5).map((recentAttempt) => (
                <div
                  key={recentAttempt.id}
                  className="rounded-2xl bg-surface-soft p-4"
                >
                  <p className="truncate text-[14px] font-extrabold text-text-primary">
                    {recentAttempt.title}
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-text-secondary">
                    {formatDate(recentAttempt.submittedAt)} -{" "}
                    {formatDuration(recentAttempt.durationSeconds)}
                  </p>
                  <p className="mt-2 text-[12px] font-extrabold text-text-secondary">
                    {recentAttempt.correctCount}/{recentAttempt.totalQuestions}{" "}
                    correct, {recentAttempt.percentageScore}%
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-5 flex flex-col gap-3 rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[14px] font-extrabold text-text-primary">
              Result saved locally
            </p>
            <p className="mt-1 text-[13px] font-bold text-text-secondary">
              Review answers now or return to the question list.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onReviewAnswers}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-surface-soft px-5 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
            >
              <Eye aria-hidden="true" size={16} strokeWidth={2.5} />
              Review Answers
            </button>
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
            >
              Back to Question List
            </button>
          </div>
        </section>
      </main>
    </section>
  );
}

function DashboardStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl bg-surface p-4">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      </span>
      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-[24px] font-extrabold text-text-primary">
        {value}
      </p>
    </article>
  );
}

function TopicRow({ topic }: { topic: TopicPerformanceResult }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-[14px] font-extrabold text-text-primary">
          {topic.topic}
        </p>
        <span className="text-[14px] font-extrabold text-text-primary">
          {topic.percentage}%
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-soft">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${topic.percentage}%` }}
        />
      </div>
      <p className="mt-1 text-[12px] font-bold text-text-secondary">
        {topic.correct}/{topic.total} correct, {topic.attempted} attempted
      </p>
    </div>
  );
}

function calculateAttemptResult<TQuestion extends MCQPracticeQuestion>({
  category,
  durationSeconds,
  questions,
  selectedAnswers,
  startedAt,
  testId,
  title,
}: {
  category: MCQPracticeCategory;
  durationSeconds: number;
  questions: TQuestion[];
  selectedAnswers: Record<string, string>;
  startedAt: string;
  testId?: string;
  title: string;
}): AttemptResult {
  const totalQuestions = questions.length;
  const attemptedCount = questions.filter(
    (question) => selectedAnswers[question.id],
  ).length;
  const correctCount = questions.filter((question) =>
    isAnswerCorrect(question, selectedAnswers[question.id]),
  ).length;
  const wrongCount = attemptedCount - correctCount;
  const skippedCount = totalQuestions - attemptedCount;
  const percentageScore = Math.round(
    (correctCount / Math.max(totalQuestions, 1)) * 100,
  );
  const xpEarned = questions.reduce(
    (total, question) =>
      isAnswerCorrect(question, selectedAnswers[question.id])
        ? total + getQuestionPoints(question)
        : total,
    0,
  );
  const submittedAt = new Date().toISOString();

  return {
    id: `${testId ?? category}-${Date.now().toString(36)}`,
    testId,
    title,
    category,
    startedAt,
    submittedAt,
    durationSeconds,
    totalQuestions,
    attemptedCount,
    correctCount,
    wrongCount,
    skippedCount,
    percentageScore,
    xpEarned,
    answers: selectedAnswers,
    topicPerformance: calculateTopicPerformance(questions, selectedAnswers),
  };
}

function calculateTopicPerformance<TQuestion extends MCQPracticeQuestion>(
  questions: TQuestion[],
  selectedAnswers: Record<string, string>,
) {
  const topicMap = new Map<
    string,
    { attempted: number; correct: number; total: number }
  >();

  questions.forEach((question) => {
    const current = topicMap.get(question.topic) ?? {
      attempted: 0,
      correct: 0,
      total: 0,
    };
    const selectedAnswer = selectedAnswers[question.id];

    current.total += 1;
    current.attempted += selectedAnswer ? 1 : 0;
    current.correct += isAnswerCorrect(question, selectedAnswer) ? 1 : 0;
    topicMap.set(question.topic, current);
  });

  return Array.from(topicMap.entries()).map<TopicPerformanceResult>(
    ([topic, stats]) => ({
      ...stats,
      percentage: Math.round(
        (stats.correct / Math.max(stats.total, 1)) * 100,
      ),
      topic,
    }),
  );
}

function saveAttemptResult(attempt: AttemptResult) {
  const attempts = readAttemptResults();
  const nextAttempts = [attempt, ...attempts].slice(0, 10);

  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(attemptStorageKey, JSON.stringify(nextAttempts));
    }
  } catch {
    return nextAttempts;
  }

  return nextAttempts;
}

function readAttemptResults() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(attemptStorageKey);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter(isAttemptResult)
      : [];
  } catch {
    return [];
  }
}

function isAttemptResult(value: unknown): value is AttemptResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const attempt = value as Partial<AttemptResult>;

  return (
    typeof attempt.id === "string" &&
    typeof attempt.title === "string" &&
    typeof attempt.category === "string" &&
    typeof attempt.startedAt === "string" &&
    typeof attempt.submittedAt === "string" &&
    typeof attempt.durationSeconds === "number" &&
    typeof attempt.totalQuestions === "number" &&
    typeof attempt.correctCount === "number" &&
    typeof attempt.percentageScore === "number"
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(Math.max(totalSeconds, 0) / 60);
  const seconds = Math.max(totalSeconds, 0) % 60;

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}
