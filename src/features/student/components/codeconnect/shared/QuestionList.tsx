import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  Bookmark,
  CheckCircle2,
  CircleDot,
  Search,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { codeconnectCategoryStats } from "../../../data/codeconnectMockData";
import type { PracticeCategory } from "../../../types/codeconnect.types";
import { cn } from "../../../../../shared/utils/cn";

type QuestionDifficulty = "easy" | "medium" | "hard";

type QuestionStatus =
  | "solved"
  | "attempted"
  | "not-started"
  | "in-progress"
  | "review";

type QuestionListItem = {
  id: string;
  topic: string;
  difficulty: QuestionDifficulty;
  title?: string;
  question?: string;
  prompt?: string;
  description?: string;
  explanation?: string;
  type?: string;
  accuracy?: number;
  questionNumber?: string | number;
  problemNumber?: string | number;
  status?: QuestionStatus;
  bookmarked?: boolean;
};

type QuestionListProps<TQuestion extends QuestionListItem = QuestionListItem> = {
  activeQuestionId?: string;
  selectedQuestionId?: string;
  category?: Exclude<PracticeCategory, "coding">;
  description?: string;
  onBack?: () => void;
  onSelectQuestion?: (questionId: string) => void;
  questions: TQuestion[];
  title?: string;
  variant?: "default" | "compact";
};

type DifficultyFilterValue = "all" | QuestionDifficulty;

type StatusFilterValue =
  | "all"
  | "solved"
  | "attempted"
  | "not-started"
  | "bookmarked";

const difficultyOptions: Array<{
  label: string;
  value: DifficultyFilterValue;
}> = [
  { label: "All", value: "all" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const statusOptions: Array<{
  label: string;
  value: StatusFilterValue;
}> = [
  { label: "All", value: "all" },
  { label: "Solved", value: "solved" },
  { label: "Attempted", value: "attempted" },
  { label: "Not Started", value: "not-started" },
  { label: "Bookmarked", value: "bookmarked" },
];

export function QuestionList<TQuestion extends QuestionListItem>({
  activeQuestionId,
  selectedQuestionId,
  category = "aptitude",
  description,
  onBack,
  onSelectQuestion,
  questions,
  title,
  variant = "default",
}: QuestionListProps<TQuestion>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeDifficulty, setActiveDifficulty] =
    useState<DifficultyFilterValue>("all");
  const [activeStatus, setActiveStatus] = useState<StatusFilterValue>("all");

  const resolvedActiveQuestionId = activeQuestionId ?? selectedQuestionId;

  const categoryStats = codeconnectCategoryStats.find(
    (stats) => stats.category === category,
  );

  const topics = useMemo(
    () =>
      Array.from(
        new Set(["All", ...questions.map((question) => question.topic)]),
      ),
    [questions],
  );

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return questions.filter((question) => {
      const questionTitle = getQuestionTitle(question).toLowerCase();
      const questionDescription =
        getQuestionDescription(question).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        questionTitle.includes(normalizedSearch) ||
        questionDescription.includes(normalizedSearch) ||
        question.topic.toLowerCase().includes(normalizedSearch);

      const matchesTopic =
        activeTopic === "All" || question.topic === activeTopic;

      const matchesDifficulty =
        activeDifficulty === "all" || question.difficulty === activeDifficulty;

      const matchesStatus = matchesStatusFilter(question, activeStatus);

      return (
        matchesSearch &&
        matchesTopic &&
        matchesDifficulty &&
        matchesStatus
      );
    });
  }, [activeDifficulty, activeStatus, activeTopic, questions, searchTerm]);

  const averageAccuracy = Math.round(
    questions.reduce(
      (total, question) => total + getQuestionAccuracy(question),
      0,
    ) / Math.max(questions.length, 1),
  );

  const solvedCount =
    categoryStats?.solved ??
    questions.filter((question) => getQuestionStatus(question) === "solved")
      .length;

  const accuracy = categoryStats?.accuracy ?? averageAccuracy;
  const streakDays = categoryStats?.streakDays ?? 0;

  const totalAvailablePoints = filteredQuestions.reduce(
    (total, question) => total + getQuestionPoints(question),
    0,
  );

  const handleQuestionOpen = (questionId: string) => {
    onSelectQuestion?.(questionId);
  };

  const handleQuestionKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    questionId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleQuestionOpen(questionId);
    }
  };

  if (variant === "compact") {
    return (
      <div className="grid gap-2">
        {filteredQuestions.map((question) => {
          const active = resolvedActiveQuestionId === question.id;
          const status = getQuestionStatus(question);
          const statusTone = getStatusTone(status);
          const difficultyTone = getDifficultyTone(question.difficulty);

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => handleQuestionOpen(question.id)}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left transition",
                active
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-surface-soft hover:border-primary hover:bg-surface",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-extrabold text-text-secondary">
                  #{getQuestionNumber(question)}
                </span>

                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                    difficultyTone,
                  )}
                >
                  {formatDifficulty(question.difficulty)}
                </span>

                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                    statusTone,
                  )}
                >
                  {getStatusLabel(status)}
                </span>
              </div>

              <p className="mt-2 line-clamp-2 text-[13px] font-extrabold text-text-primary">
                {getQuestionTitle(question)}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] bg-surface-soft p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="min-w-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="mb-3 h-9 rounded-2xl bg-surface px-4 text-[12px] font-extrabold text-text-primary shadow-card transition hover:bg-primary-soft hover:text-primary-dark"
              >
                Back
              </button>
            ) : null}

            <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
              CodeConnect {formatCategory(category)}
            </p>

            <h2 className="mt-1 text-[25px] font-extrabold leading-tight text-text-primary">
              {title ?? `${formatCategory(category)} Questions`}
            </h2>

            <p className="mt-1 max-w-2xl text-[13px] font-bold leading-5 text-text-secondary">
              {description ??
                "Pick a question, filter by topic or difficulty, and start solving in the CodeConnect workspace."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 xl:min-w-[390px]">
            <StatTile
              icon={<CheckCircle2 aria-hidden="true" size={16} />}
              label="Solved"
              value={solvedCount.toString()}
            />

            <StatTile
              icon={<Target aria-hidden="true" size={16} />}
              label="Accuracy"
              value={`${accuracy}%`}
            />

            <StatTile
              icon={<Zap aria-hidden="true" size={16} />}
              label="Streak"
              value={`${streakDays}d`}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border bg-surface p-3 shadow-sm">
        <div className="grid gap-2 xl:grid-cols-[minmax(260px,1fr)_auto_auto] xl:items-center">
          <label className="flex h-11 items-center gap-3 rounded-2xl border border-border bg-surface-soft px-4 transition focus-within:border-primary focus-within:bg-surface">
            <Search
              aria-hidden="true"
              className="shrink-0 text-text-muted"
              size={17}
            />

            <span className="sr-only">Search questions</span>

            <input
              className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-bold text-text-primary outline-none placeholder:text-text-muted"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title, topic, or keyword"
              value={searchTerm}
            />
          </label>

          <CompactFilterGroup<DifficultyFilterValue>
            label="Difficulty"
            options={difficultyOptions}
            value={activeDifficulty}
            onChange={setActiveDifficulty}
          />

          <CompactFilterGroup<StatusFilterValue>
            label="Status"
            options={statusOptions}
            value={activeStatus}
            onChange={setActiveStatus}
          />
        </div>

        <div className="mt-3 border-t border-border pt-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
            <CircleDot aria-hidden="true" size={14} />
            Topic
          </div>

          <div className="scrollbar-none flex max-w-full gap-2 overflow-x-auto pb-1">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                className={cn(
                  "h-9 shrink-0 rounded-2xl px-3 text-[12px] font-extrabold transition",
                  activeTopic === topic
                    ? "bg-primary text-white shadow-card"
                    : "bg-surface-soft text-text-secondary hover:bg-primary-soft hover:text-primary-dark",
                )}
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-extrabold leading-none text-text-primary">
              Question list
            </h3>

            <p className="mt-2 text-[13px] font-bold text-text-secondary">
              Showing {filteredQuestions.length} of {questions.length} questions
            </p>
          </div>

          <span className="inline-flex h-9 items-center gap-2 rounded-2xl bg-primary-soft px-4 text-[12px] font-extrabold text-primary-dark">
            <Trophy aria-hidden="true" size={14} />
            {totalAvailablePoints} XP available
          </span>
        </div>

        {filteredQuestions.length > 0 ? (
          <div className="grid gap-2.5">
            {filteredQuestions.map((question) => {
              const active = resolvedActiveQuestionId === question.id;
              const status = getQuestionStatus(question);
              const statusTone = getStatusTone(status);
              const difficultyTone = getDifficultyTone(question.difficulty);

              return (
                <article
                  key={question.id}
                  aria-label={`Open ${getQuestionTitle(question)}`}
                  className={cn(
                    "group cursor-pointer rounded-2xl border px-4 py-3 transition",
                    active
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface-soft hover:border-primary hover:bg-surface",
                  )}
                  onClick={() => handleQuestionOpen(question.id)}
                  onKeyDown={(event) =>
                    handleQuestionKeyDown(event, question.id)
                  }
                  role="button"
                  tabIndex={0}
                >
                  <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px_170px] xl:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-extrabold text-text-secondary">
                          #{getQuestionNumber(question)}
                        </span>

                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                            difficultyTone,
                          )}
                        >
                          {formatDifficulty(question.difficulty)}
                        </span>

                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                            statusTone,
                          )}
                        >
                          {getStatusLabel(status)}
                        </span>

                        {question.bookmarked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-soft px-2.5 py-1 text-[11px] font-extrabold text-text-primary">
                            <Bookmark
                              aria-hidden="true"
                              size={12}
                              fill="currentColor"
                            />
                            Bookmarked
                          </span>
                        ) : null}
                      </div>

                      <h4 className="mt-2 truncate text-[16px] font-extrabold leading-5 text-text-primary">
                        {getQuestionTitle(question)}
                      </h4>

                      <p className="mt-1 truncate text-[13px] font-bold leading-5 text-text-secondary">
                        {getQuestionDescription(question)}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <InlineMetric label="Topic" value={question.topic} />

                      <InlineMetric
                        label="Acceptance"
                        value={`${getQuestionAccuracy(question)}%`}
                      />

                      <InlineMetric
                        label="Points"
                        value={`${getQuestionPoints(question)} XP`}
                      />
                    </div>

                    <div className="flex items-center justify-start gap-2 xl:justify-end">
                      <span
                        className={cn(
                          "inline-flex h-9 min-w-[82px] items-center justify-center rounded-2xl px-3 text-[11px] font-extrabold",
                          statusTone,
                        )}
                      >
                        {getAttemptBadgeLabel(status)}
                      </span>

                      <button
                        type="button"
                        className="h-9 min-w-[76px] rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleQuestionOpen(question.id);
                        }}
                      >
                        Start
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-7 text-center">
            <p className="text-[16px] font-extrabold text-text-primary">
              No questions found
            </p>

            <p className="mt-2 text-[13px] font-bold text-text-secondary">
              Try changing the search term, topic, difficulty, or status filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary-dark">
        {icon}
      </span>

      <p className="mt-2 text-[10px] font-extrabold uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-0.5 text-[18px] font-extrabold leading-none text-text-primary">
        {value}
      </p>
    </div>
  );
}

function CompactFilterGroup<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ label: string; value: TValue }>;
  value: TValue;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface-soft p-2 xl:min-w-[310px]">
      <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              "h-8 rounded-2xl px-3 text-[11px] font-extrabold transition",
              value === option.value
                ? "bg-surface text-text-primary shadow-card"
                : "text-text-secondary hover:bg-primary-soft hover:text-primary-dark",
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InlineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface px-3 py-2">
      <p className="truncate text-[10px] font-extrabold uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[12px] font-extrabold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function matchesStatusFilter(
  question: QuestionListItem,
  activeStatus: StatusFilterValue,
) {
  if (activeStatus === "all") {
    return true;
  }

  if (activeStatus === "bookmarked") {
    return Boolean(question.bookmarked);
  }

  const status = getQuestionStatus(question);

  if (activeStatus === "attempted") {
    return status === "attempted";
  }

  return status === activeStatus;
}

function getQuestionStatus(
  question: QuestionListItem,
): Exclude<StatusFilterValue, "all" | "bookmarked"> {
  if (question.status === "solved") {
    return "solved";
  }

  if (question.status === "attempted" || question.status === "in-progress" || question.status === "review") {
    return "attempted";
  }

  return "not-started";
}

function getQuestionPoints(question: QuestionListItem) {
  if (question.difficulty === "hard") {
    return 50;
  }

  if (question.difficulty === "medium") {
    return 35;
  }

  return 20;
}

function getQuestionAccuracy(question: QuestionListItem) {
  if (typeof question.accuracy === "number") {
    return question.accuracy;
  }

  if (question.difficulty === "hard") {
    return 68;
  }

  if (question.difficulty === "medium") {
    return 76;
  }

  return 88;
}

function getDifficultyTone(difficulty: QuestionDifficulty) {
  if (difficulty === "hard") {
    return "bg-red-soft text-red";
  }

  if (difficulty === "medium") {
    return "bg-yellow-soft text-text-primary";
  }

  return "bg-primary-soft text-primary-dark";
}

function getStatusTone(
  status: Exclude<StatusFilterValue, "all" | "bookmarked">,
) {
  if (status === "solved") {
    return "bg-primary-soft text-primary-dark";
  }

  if (status === "not-started") {
    return "bg-surface text-text-secondary";
  }

  return "bg-orange-soft text-orange";
}

function getStatusLabel(
  status: Exclude<StatusFilterValue, "all" | "bookmarked">,
) {
  if (status === "solved") {
    return "Solved";
  }

  if (status === "not-started") {
    return "Not Started";
  }

  return "Attempted";
}

function getAttemptBadgeLabel(
  status: Exclude<StatusFilterValue, "all" | "bookmarked">,
) {
  if (status === "solved") {
    return "Solved";
  }

  if (status === "not-started") {
    return "Not started";
  }

  return "Attempted";
}

function formatDifficulty(difficulty: QuestionDifficulty) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function formatCategory(category: Exclude<PracticeCategory, "coding">) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getQuestionTitle(question: QuestionListItem) {
  return question.title ?? question.question ?? question.prompt ?? question.id;
}

function getQuestionDescription(question: QuestionListItem) {
  return (
    question.description ??
    question.prompt ??
    question.question ??
    question.explanation ??
    "Solve this question and check your answer."
  );
}

function getQuestionNumber(question: QuestionListItem) {
  return question.questionNumber ?? question.problemNumber ?? question.id;
}