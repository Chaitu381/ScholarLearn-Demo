import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Code2,
  Coins,
  Flame,
  Medal,
  Minus,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { PageTitle } from "../../../shared/components/ui/PageTitle";
import { ProgressBar } from "../../../shared/components/ui/ProgressBar";
import { cn } from "../../../shared/utils/cn";
import {
  dummyBadges,
  dummyChallenges,
  dummyCoinActivity,
  dummyLeaderboardSummary,
  dummyLeaderboards,
  dummyLeaderboardTabs,
  dummyQuests,
  dummyStreakSummary,
  type DummyBadge,
  type DummyChallenge,
  type DummyCoinActivity,
  type DummyLeaderboardEntry,
  type DummyQuest,
  type DummyStreakSummary,
  type LeaderboardTabKey,
} from "../leaderboard/dummyLeaderboardData";
import { MetricCard, PageCard, StudentPage, ToneBadge } from "../components/StudentPagePrimitives";

const tabIcons: Record<LeaderboardTabKey, LucideIcon> = {
  attendance: CalendarCheck,
  coding: Code2,
  improvement: TrendingUp,
  monthly: Trophy,
  overall: UsersRound,
  weekly: Sparkles,
};

export function StudentLeaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardTabKey>("overall");
  const activeTabConfig = dummyLeaderboardTabs.find((tab) => tab.key === activeTab) ?? dummyLeaderboardTabs[0];
  const activeEntries = dummyLeaderboards[activeTab];
  const currentStudent = useMemo(
    () => dummyLeaderboards.overall.find((entry) => entry.isCurrentStudent) ?? dummyLeaderboards.overall[0],
    [],
  );
  const topThree = activeEntries.slice(0, 3);

  return (
    <StudentPage>
      <PageTitle
        title="Leaderboard"
        description="Gamification hub for rank, XP, coins, badges, streaks, challenges, quests, and leaderboard progress."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard icon={Medal} label="Current Rank" value={`#${dummyLeaderboardSummary.currentRank}`} helper="Overall batch rank" tone="yellow" />
        <MetricCard icon={Sparkles} label="Current XP" value={formatNumber(dummyLeaderboardSummary.currentXp)} helper="Total earned XP" tone="primary" />
        <MetricCard icon={Star} label="Current Level" value={dummyLeaderboardSummary.currentLevel} helper={`${currentStudent.progressPercentage}% to next reward`} tone="blue" />
        <MetricCard icon={Coins} label="Coins" value={formatNumber(dummyLeaderboardSummary.coins)} helper="Available balance" tone="orange" />
        <MetricCard icon={Flame} label="Streak" value={`${dummyLeaderboardSummary.currentStreak} days`} helper="Current learning streak" tone="red" />
        <MetricCard icon={BadgeCheck} label="Badges Earned" value={dummyLeaderboardSummary.badgesEarned} helper="Unlocked achievements" tone="primary" />
      </div>

      <PageCard title="Top 3 Podium" description={`Top performers for ${activeTabConfig.label.toLowerCase()} ranking.`} icon={Trophy}>
        <div className="grid gap-4 md:grid-cols-3">
          {topThree.map((entry) => (
            <PodiumCard entry={entry} key={`${activeTab}-${entry.rank}-${entry.studentName}`} />
          ))}
        </div>
      </PageCard>

      <PageCard
        title={`${activeTabConfig.label} Leaderboard`}
        description={activeTabConfig.description}
        icon={tabIcons[activeTabConfig.key]}
        action={<ToneBadge label={`${activeEntries.length} students`} tone="neutral" />}
      >
        <LeaderboardTabs activeTab={activeTab} onChange={setActiveTab} />
        <div className="mt-5">
          <LeaderboardRows entries={activeEntries} />
        </div>
      </PageCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,44fr)_minmax(0,56fr)]">
        <PageCard title="Badges Preview" description="Recently earned gamification badges." icon={Award}>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {dummyBadges.map((badge) => (
              <BadgePreviewCard badge={badge} key={badge.name} />
            ))}
          </div>
        </PageCard>

        <PageCard title="Active Challenges" description="Daily and weekly challenge progress." icon={Sparkles}>
          <div className="grid gap-3 md:grid-cols-3">
            {dummyChallenges.map((challenge) => (
              <ProgressItemCard
                key={challenge.title}
                icon={challenge.status === "Completed" ? CheckCircle2 : Target}
                label={challenge.reward}
                progress={challenge.progressPercentage}
                title={challenge.title}
                tone={challenge.status === "Completed" ? "primary" : "blue"}
              />
            ))}
          </div>
        </PageCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <PageCard title="Quest Progress" description="Current quests and reward paths." icon={Target}>
          <div className="space-y-3">
            {dummyQuests.map((quest) => (
              <QuestRow key={quest.title} quest={quest} />
            ))}
          </div>
        </PageCard>

        <PageCard title="Coin Activity" description="Recent earned and spent coin activity." icon={Coins}>
          <div className="space-y-3">
            {dummyCoinActivity.map((activity) => (
              <CoinActivityRow activity={activity} key={`${activity.time}-${activity.label}`} />
            ))}
          </div>
        </PageCard>

        <PageCard title="Streak Summary" description="Current and best streaks by learning area." icon={Flame}>
          <div className="space-y-3">
            {dummyStreakSummary.map((streak) => (
              <StreakRow key={streak.label} streak={streak} />
            ))}
          </div>
        </PageCard>
      </div>
    </StudentPage>
  );
}

function LeaderboardTabs({
  activeTab,
  onChange,
}: {
  activeTab: LeaderboardTabKey;
  onChange: (tab: LeaderboardTabKey) => void;
}) {
  return (
    <div className="scrollbar-none flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-border bg-surface-soft p-1">
      {dummyLeaderboardTabs.map((tab) => {
        const Icon = tabIcons[tab.key];
        const active = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-[13px] font-extrabold transition",
              active ? "bg-surface text-text-primary shadow-card" : "text-text-secondary hover:text-text-primary",
            )}
            onClick={() => onChange(tab.key)}
          >
            <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function PodiumCard({ entry }: { entry: DummyLeaderboardEntry }) {
  const podiumTone = entry.rank === 1 ? "bg-yellow-soft text-text-primary" : entry.rank === 2 ? "bg-blue-soft text-blue" : "bg-primary-soft text-primary-dark";

  return (
    <article className={cn("rounded-3xl border border-border p-5 text-center transition hover:-translate-y-0.5 hover:shadow-card", entry.isCurrentStudent ? "bg-primary-soft text-primary-dark" : "bg-surface-soft text-text-primary")}>
      <span className={cn("mx-auto grid h-14 w-14 place-items-center rounded-2xl", podiumTone)}>
        <Medal aria-hidden="true" size={26} strokeWidth={2.5} />
      </span>
      <p className="mt-4 text-[13px] font-extrabold uppercase text-text-muted">Rank #{entry.rank}</p>
      <h3 className="mt-1 truncate text-[20px] font-extrabold">{entry.studentName}</h3>
      <p className="mt-1 text-[14px] font-bold opacity-80">{formatNumber(entry.xp)} XP</p>
      <div className="mt-4">
        <ProgressBar value={entry.progressPercentage} tone="primary" showValue />
      </div>
      {entry.isCurrentStudent ? <div className="mt-3"><ToneBadge label="You" tone="primary" /></div> : null}
    </article>
  );
}

function LeaderboardRows({ entries }: { entries: DummyLeaderboardEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[980px] overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[80px_1.8fr_1fr_0.9fr_0.9fr_0.9fr_1fr_1.2fr_1fr] bg-surface-soft px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
          <span>Rank</span>
          <span>Student</span>
          <span>XP</span>
          <span>Level</span>
          <span>Coins</span>
          <span>Badges</span>
          <span>Streak</span>
          <span>Progress</span>
          <span>Movement</span>
        </div>
        {entries.map((entry) => (
          <article
            key={`${entry.rank}-${entry.studentName}`}
            className={cn(
              "grid grid-cols-[80px_1.8fr_1fr_0.9fr_0.9fr_0.9fr_1fr_1.2fr_1fr] items-center gap-3 border-t border-border px-4 py-4 text-[14px]",
              entry.isCurrentStudent ? "bg-primary-soft text-primary-dark" : "bg-surface text-text-primary",
            )}
          >
            <span className="font-extrabold">#{entry.rank}</span>
            <div className="flex min-w-0 items-center gap-3">
              <StudentAvatar entry={entry} />
              <div className="min-w-0">
                <p className="truncate font-extrabold">{entry.studentName}</p>
                {entry.isCurrentStudent ? <p className="text-[12px] font-bold opacity-75">Current student</p> : null}
              </div>
            </div>
            <span className="font-extrabold">{formatNumber(entry.xp)}</span>
            <span className="font-bold">{entry.level}</span>
            <span className="font-bold">{formatNumber(entry.coins)}</span>
            <span className="font-bold">{entry.badgesCount}</span>
            <span className="font-bold">{entry.streakDays} days</span>
            <ProgressBar value={entry.progressPercentage} tone="primary" showValue />
            <MovementBadge entry={entry} />
          </article>
        ))}
      </div>
    </div>
  );
}

function StudentAvatar({ entry }: { entry: DummyLeaderboardEntry }) {
  if (entry.avatarUrl) {
    return <img alt="" className="h-11 w-11 rounded-2xl object-cover" src={entry.avatarUrl} />;
  }

  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface-soft text-[13px] font-extrabold text-text-primary">
      {entry.initials}
    </span>
  );
}

function MovementBadge({ entry }: { entry: DummyLeaderboardEntry }) {
  const movementConfig = {
    down: { icon: ArrowDownRight, label: `-${entry.movementValue}`, tone: "red" as const },
    same: { icon: Minus, label: "Same", tone: "neutral" as const },
    up: { icon: ArrowUpRight, label: `+${entry.movementValue}`, tone: "primary" as const },
  }[entry.movement];
  const Icon = movementConfig.icon;

  return (
    <span className="inline-flex items-center gap-2">
      <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
      <ToneBadge label={movementConfig.label} tone={movementConfig.tone} />
    </span>
  );
}

function BadgePreviewCard({ badge }: { badge: DummyBadge }) {
  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Award aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>
        <div>
          <h3 className="text-[15px] font-extrabold text-text-primary">{badge.name}</h3>
          <p className="mt-1 text-[13px] leading-5 text-text-secondary">{badge.description}</p>
          <p className="mt-2 text-[12px] font-bold text-text-muted">Earned {formatDate(badge.earnedDate)}</p>
        </div>
      </div>
    </article>
  );
}

function ProgressItemCard({
  icon: Icon,
  label,
  progress,
  title,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  progress: number;
  title: string;
  tone: "blue" | "primary";
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-extrabold text-text-primary">{title}</h3>
          <p className="mt-1 text-[12px] font-bold text-text-secondary">{label}</p>
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", tone === "primary" ? "bg-primary-soft text-primary-dark" : "bg-blue-soft text-blue")}>
          <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={progress} tone={tone} showValue />
      </div>
    </article>
  );
}

function QuestRow({ quest }: { quest: DummyQuest }) {
  return (
    <article className="rounded-2xl bg-surface-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-extrabold text-text-primary">{quest.title}</h3>
          <p className="mt-1 text-[12px] font-bold text-text-secondary">Reward: {quest.reward}</p>
        </div>
        <ToneBadge label={`${quest.progressPercentage}%`} tone="blue" />
      </div>
      <div className="mt-3">
        <ProgressBar value={quest.progressPercentage} tone="blue" showValue={false} />
      </div>
    </article>
  );
}

function CoinActivityRow({ activity }: { activity: DummyCoinActivity }) {
  const earned = activity.type === "earned";

  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl bg-surface-soft p-4">
      <div>
        <h3 className="text-[14px] font-extrabold text-text-primary">{activity.label}</h3>
        <p className="mt-1 text-[12px] font-bold text-text-secondary">{activity.time}</p>
      </div>
      <ToneBadge label={`${earned ? "+" : "-"}${formatNumber(activity.amount)}`} tone={earned ? "primary" : "orange"} />
    </article>
  );
}

function StreakRow({ streak }: { streak: DummyStreakSummary }) {
  return (
    <article className="rounded-2xl bg-surface-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-extrabold text-text-primary">{streak.label}</h3>
        <ToneBadge label={`${streak.current} days`} tone="red" />
      </div>
      <ProgressBar value={(streak.current / streak.best) * 100} tone="red" showValue={false} />
      <p className="mt-2 text-[12px] font-bold text-text-secondary">Best streak: {streak.best} days</p>
    </article>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
