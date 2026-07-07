import type { ReactElement } from "react";
import { Brain, CalendarClock, Calculator, Code2, MessageCircle, Target, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageTitle } from "../../../../shared/components/ui/PageTitle";
import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import {
  codeconnectCategoryAccuracy,
  codeconnectCategoryStats,
  codeconnectCurrentChallenge,
  codeconnectDailyPracticeHours,
  codeconnectDifficultyProgress,
  codeconnectHubStats,
  codeconnectProblemSolvingTrend,
  codeconnectRecentSubmissions,
  codeconnectRecommendedProblems,
  codeconnectWeeklyProgress,
} from "../../data/codeconnectMockData";
import type {
  Difficulty,
  PracticeCategory,
  PracticeCategoryStats,
  RecentSubmissionStatus,
} from "../../types/codeconnect.types";
import { CategoryCard } from "./CategoryCard";
import { StatsGrid } from "./StatsGrid";

type CodeConnectHubProps = {
  onOpenScheduledTests?: () => void;
  onSelectMode: (category: PracticeCategory) => void;
};

const categoryMeta: Record<
  PracticeCategory,
  {
    buttonLabel: string;
    icon: LucideIcon;
    subtitle: string;
  }
> = {
  coding: {
    buttonLabel: "Start Coding",
    icon: Code2,
    subtitle: "Solve data structures, algorithms, and coding interview problems.",
  },
  aptitude: {
    buttonLabel: "Start Aptitude",
    icon: Calculator,
    subtitle: "Practice quantitative topics with timed MCQ-style questions.",
  },
  reasoning: {
    buttonLabel: "Start Reasoning",
    icon: Brain,
    subtitle: "Improve logical reasoning, arrangements, puzzles, and series.",
  },
  verbal: {
    buttonLabel: "Start Verbal",
    icon: MessageCircle,
    subtitle: "Build grammar, vocabulary, comprehension, and sentence skills.",
  },
};

const categoryLabels: Record<PracticeCategory, string> = {
  coding: "Coding",
  aptitude: "Aptitude",
  reasoning: "Reasoning",
  verbal: "Verbal",
};

const difficultyStyles: Record<
  Difficulty,
  {
    label: string;
    tone: "primary" | "orange" | "red";
    badgeClass: string;
    textClass: string;
  }
> = {
  easy: {
    label: "Easy",
    tone: "primary",
    badgeClass: "bg-primary-soft text-primary-dark",
    textClass: "text-primary-dark",
  },
  medium: {
    label: "Medium",
    tone: "orange",
    badgeClass: "bg-orange-soft text-orange",
    textClass: "text-orange",
  },
  hard: {
    label: "Hard",
    tone: "red",
    badgeClass: "bg-red-soft text-red",
    textClass: "text-red",
  },
};

const submissionStyles: Record<RecentSubmissionStatus, { label: string; className: string }> = {
  accepted: {
    label: "Accepted",
    className: "bg-primary-soft text-primary-dark",
  },
  review: {
    label: "Review",
    className: "bg-blue-soft text-blue",
  },
  improved: {
    label: "Improved",
    className: "bg-yellow-soft text-text-primary",
  },
  retry: {
    label: "Retry",
    className: "bg-orange-soft text-orange",
  },
};

const chartTooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  color: "var(--text-primary)",
};

export function CodeConnectHub({ onOpenScheduledTests, onSelectMode }: CodeConnectHubProps) {
  return (
    <div className="space-y-6">
      <PageTitle
        title="CodeConnect Dashboard"
        description="Practice Coding, Aptitude, Reasoning, and Verbal skills in one place."
      />

      <StatsGrid stats={codeconnectHubStats} />

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-5">
          <h2 className="text-[22px] font-extrabold text-text-primary">Choose a practice category</h2>
          <p className="mt-1 text-[14px] leading-6 text-text-secondary">
            Pick the next practice mode based on today&apos;s target and your weakest areas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {codeconnectCategoryStats.map((stats) => (
            <CategoryCard
              key={stats.category}
              buttonLabel={categoryMeta[stats.category].buttonLabel}
              icon={categoryMeta[stats.category].icon}
              onSelect={onSelectMode}
              stats={stats as PracticeCategoryStats}
              subtitle={categoryMeta[stats.category].subtitle}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-soft text-orange">
            <CalendarClock aria-hidden="true" size={23} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[22px] font-extrabold text-text-primary">
              Scheduled Tests / Mock Tests
            </h2>
            <p className="mt-1 max-w-3xl text-[14px] leading-6 text-text-secondary">
              Open teacher-scheduled aptitude, reasoning, and verbal exams with
              countdown entry and timed auto-submit.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!onOpenScheduledTests}
            onClick={onOpenScheduledTests}
          >
            <CalendarClock aria-hidden="true" size={17} strokeWidth={2.5} />
            View Tests
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
              <Target aria-hidden="true" size={22} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[21px] font-extrabold leading-7 text-text-primary">Difficulty Progress</h2>
              <p className="mt-1 text-[14px] leading-6 text-text-secondary">Coding practice split by problem level.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {codeconnectDifficultyProgress.map((difficulty) => {
              const style = difficultyStyles[difficulty.difficulty];
              const percentage = (difficulty.solved / difficulty.total) * 100;

              return (
                <article key={difficulty.difficulty} className="rounded-2xl border border-border bg-surface-soft p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-[13px] font-extrabold uppercase ${style.textClass}`}>{difficulty.label}</p>
                      <p className="mt-4 text-[30px] font-extrabold leading-none text-text-primary">
                        {difficulty.solved}
                        <span className="ml-2 text-[14px] font-semibold text-text-secondary">solved</span>
                      </p>
                    </div>
                    <span className="text-[13px] font-bold text-text-muted">/{difficulty.total}</span>
                  </div>
                  <div className="mt-4">
                    <ProgressBar value={percentage} tone={style.tone} showValue={false} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[21px] font-extrabold leading-7 text-text-primary">Current Challenge</h2>
              <p className="mt-1 text-[14px] leading-6 text-text-secondary">A focused problem to keep the streak moving.</p>
            </div>
            <span className="inline-flex h-8 w-fit items-center rounded-full bg-primary-soft px-3 text-[12px] font-extrabold text-primary-dark">
              {codeconnectCurrentChallenge.dueLabel}
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-surface-soft p-5">
            <h3 className="text-[18px] font-extrabold leading-7 text-text-primary">{codeconnectCurrentChallenge.title}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-soft px-3 py-1 text-[12px] font-extrabold text-blue">
                {codeconnectCurrentChallenge.topic}
              </span>
              <DifficultyBadge difficulty={codeconnectCurrentChallenge.difficulty} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <PracticeInfo label="Recent solved problem" value={codeconnectCurrentChallenge.recentSolvedProblem} />
            <PracticeInfo label="Next problem" value={codeconnectCurrentChallenge.nextProblem} />
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Problem-solving Trend" description="Problems completed over the last six months.">
          <LineChart data={codeconnectProblemSolvingTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="solved" stroke="var(--blue)" strokeWidth={3} dot={{ r: 3 }} name="Solved" />
          </LineChart>
        </ChartCard>

        <ChartCard title="Daily Practice Hours" description="Time spent across practice modes this week.">
          <AreaChart data={codeconnectDailyPracticeHours} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Area type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={3} fill="var(--primary-soft)" name="Hours" />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Weekly Progress" description="Solved items by category in the current month.">
          <BarChart data={codeconnectWeeklyProgress} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="coding" stackId="practice" fill="var(--primary)" radius={[0, 0, 8, 8]} name="Coding" />
            <Bar dataKey="aptitude" stackId="practice" fill="var(--blue)" name="Aptitude" />
            <Bar dataKey="reasoning" stackId="practice" fill="var(--orange)" name="Reasoning" />
            <Bar dataKey="verbal" stackId="practice" fill="var(--yellow)" radius={[8, 8, 0, 0]} name="Verbal" />
          </BarChart>
        </ChartCard>

        <ChartCard title="Category-wise Accuracy" description="Accuracy comparison across CodeConnect areas.">
          <BarChart data={codeconnectCategoryAccuracy} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} domain={[0, 100]} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="accuracy" fill="var(--primary)" radius={[8, 8, 0, 0]} name="Accuracy" />
          </BarChart>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue">
              <TrendingUp aria-hidden="true" size={22} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[21px] font-extrabold leading-7 text-text-primary">Recommended Problems</h2>
              <p className="mt-1 text-[14px] leading-6 text-text-secondary">Next best items based on practice gaps.</p>
            </div>
          </div>

          <div className="space-y-3">
            {codeconnectRecommendedProblems.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="break-words text-[15px] font-extrabold leading-6 text-text-primary">{item.title}</h3>
                    <p className="mt-1 text-[13px] font-bold text-text-secondary">
                      {categoryLabels[item.category]} - {item.topic}
                    </p>
                  </div>
                  <DifficultyBadge difficulty={item.difficulty} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
              <Code2 aria-hidden="true" size={22} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[21px] font-extrabold leading-7 text-text-primary">Recent Submissions</h2>
              <p className="mt-1 text-[14px] leading-6 text-text-secondary">Latest attempts across practice categories.</p>
            </div>
          </div>

          <div className="space-y-3">
            {codeconnectRecentSubmissions.map((submission) => {
              const status = submissionStyles[submission.status];

              return (
                <article key={submission.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-[15px] font-extrabold leading-6 text-text-primary">{submission.title}</h3>
                      <p className="mt-1 text-[13px] font-bold text-text-secondary">
                        {categoryLabels[submission.category]} - {submission.submittedAt}
                      </p>
                    </div>
                    <span className={`inline-flex h-7 w-fit shrink-0 items-center rounded-full px-3 text-[12px] font-extrabold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </div>
  );
}

function ChartCard({
  children,
  description,
  title,
}: {
  children: ReactElement;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="text-[21px] font-extrabold leading-7 text-text-primary">{title}</h2>
      <p className="mt-1 text-[14px] leading-6 text-text-secondary">{description}</p>
      <div className="mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const style = difficultyStyles[difficulty];

  return (
    <span className={`inline-flex h-7 w-fit shrink-0 items-center rounded-full px-3 text-[12px] font-extrabold ${style.badgeClass}`}>
      {style.label}
    </span>
  );
}

function PracticeInfo({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-surface-soft p-4">
      <p className="text-[12px] font-bold uppercase text-text-muted">{label}</p>
      <p className="mt-1 break-words text-[14px] font-extrabold leading-5 text-text-primary">{value}</p>
    </article>
  );
}
