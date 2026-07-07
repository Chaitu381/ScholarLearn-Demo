import { useMemo, type ReactNode } from "react";
import {
  Award,
  CheckCircle2,
  Coins,
  Flame,
  Medal,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  BadgeCard,
  ChallengeCard,
  GamificationEmptyState,
  LeaderboardTable,
  calculateGamificationProgress,
  formatGamificationNumber,
  getGamificationTime,
  readGamificationProgress,
  type ChallengeCardItem,
} from "../gamification";

import type {
  CoinBalance,
  GamificationLeaderboardEntry,
  RankPosition,
  StudentBadge,
  StudentChallengeProgress,
  StudentLevel,
  StudentStreak,
  StudentXp,
} from "../../types/gamification.types";

type GamificationState = {
  badges: StudentBadge[];
  challengeProgress: StudentChallengeProgress[];
  coins: CoinBalance | null;
  error: string;
  leaderboard: GamificationLeaderboardEntry[];
  level: StudentLevel | null;
  rank: RankPosition | null;
  streaks: StudentStreak[];
  xp: StudentXp | null;
};

const dummyGamificationState: GamificationState = {
  xp: {
    studentXpId: 1,
    studentId: 101,
    totalXp: 2840,
    currentXp: 2840,
    currentLevelXp: 840,
    nextLevelXp: 1000,
    progressPercentage: 84,
    updatedAt: "2026-07-02T10:00:00",
  } as unknown as StudentXp,

  level: {
    studentLevelId: 1,
    studentId: 101,
    levelName: "Code Warrior",
    levelNumber: 7,
    currentXp: 2840,
    minXp: 2000,
    maxXp: 3000,
    progressPercentage: 84,
    updatedAt: "2026-07-02T10:00:00",
  } as unknown as StudentLevel,

  coins: {
    coinBalanceId: 1,
    studentId: 101,
    totalCoins: 1250,
    earnedCoins: 1700,
    spentCoins: 450,
    updatedAt: "2026-07-02T10:00:00",
  } as unknown as CoinBalance,

  streaks: [
    // {
    //   streakId: 1,
    //   studentId: 101,
    //   streakType: "Attendance",
    //   currentStreak: 6,
    //   longestStreak: 12,
    //   lastActivityDate: "2026-07-02",
    // },
    {
      streakId: 2,
      studentId: 101,
      streakType: "Test",
      currentStreak: 3,
      longestStreak: 5,
      lastActivityDate: "2026-07-01",
    },
    {
      streakId: 3,
      studentId: 101,
      streakType: "Coding",
      currentStreak: 9,
      longestStreak: 15,
      lastActivityDate: "2026-07-02",
    },
  ] as unknown as StudentStreak[],

  badges: [
    {
      studentBadgeId: 1,
      studentId: 101,
      badgeId: 1,
      awardedAt: "2026-07-01T09:30:00",
      badge: {
        badgeId: 1,
        name: "Attendance Hero",
        title: "Attendance Hero",
        description: "Maintained strong attendance this week.",
        icon: "🏆",
        xpReward: 100,
        coinReward: 50,
      },
    },
    {
      studentBadgeId: 2,
      studentId: 101,
      badgeId: 2,
      awardedAt: "2026-06-30T14:20:00",
      badge: {
        badgeId: 2,
        name: "Code Warrior",
        title: "Code Warrior",
        description: "Solved multiple coding problems.",
        icon: "⚡",
        xpReward: 150,
        coinReward: 75,
      },
    },
    {
      studentBadgeId: 3,
      studentId: 101,
      badgeId: 3,
      awardedAt: "2026-06-29T11:15:00",
      badge: {
        badgeId: 3,
        name: "MCQ Master",
        title: "MCQ Master",
        description: "Scored above 80% in MCQ tests.",
        icon: "🎯",
        xpReward: 120,
        coinReward: 60,
      },
    },
    {
      studentBadgeId: 4,
      studentId: 101,
      badgeId: 4,
      awardedAt: "2026-06-28T16:45:00",
      badge: {
        badgeId: 4,
        name: "Consistent Learner",
        title: "Consistent Learner",
        description: "Completed learning tasks consistently.",
        icon: "🔥",
        xpReward: 90,
        coinReward: 45,
      },
    },
  ] as unknown as StudentBadge[],

  challengeProgress: [
    {
      progressId: 1,
      studentId: 101,
      challengeId: 1,
      currentValue: 4,
      targetValue: 5,
      progressPercentage: 80,
      status: "ACTIVE",
      challenge: {
        challengeId: 1,
        title: "Attend 5 Classes",
        description: "Attend five classes this week.",
        targetValue: 5,
        xpReward: 75,
        coinReward: 30,
      },
    },
    {
      progressId: 2,
      studentId: 101,
      challengeId: 2,
      currentValue: 16,
      targetValue: 20,
      progressPercentage: 80,
      status: "ACTIVE",
      challenge: {
        challengeId: 2,
        title: "Solve 20 MCQs",
        description: "Complete twenty MCQ practice questions.",
        targetValue: 20,
        xpReward: 90,
        coinReward: 40,
      },
    },
    {
      progressId: 3,
      studentId: 101,
      challengeId: 3,
      currentValue: 2,
      targetValue: 3,
      progressPercentage: 67,
      status: "ACTIVE",
      challenge: {
        challengeId: 3,
        title: "Complete 3 Coding Problems",
        description: "Finish three coding problems today.",
        targetValue: 3,
        xpReward: 120,
        coinReward: 60,
      },
    },
    {
      progressId: 4,
      studentId: 101,
      challengeId: 4,
      currentValue: 1,
      targetValue: 1,
      progressPercentage: 100,
      status: "COMPLETED",
      challenge: {
        challengeId: 4,
        title: "Review Weak Topic",
        description: "Revise one weak topic from analytics.",
        targetValue: 1,
        xpReward: 60,
        coinReward: 25,
      },
    },
    {
      progressId: 5,
      studentId: 101,
      challengeId: 5,
      currentValue: 7,
      targetValue: 10,
      progressPercentage: 70,
      status: "ACTIVE",
      challenge: {
        challengeId: 5,
        title: "Maintain 10 Day Streak",
        description: "Stay active for ten days.",
        targetValue: 10,
        xpReward: 140,
        coinReward: 70,
      },
    },
  ] as unknown as StudentChallengeProgress[],

  leaderboard: [
    {
      studentId: 104,
      studentName: "Aarav Sharma",
      name: "Aarav Sharma",
      totalXp: 3520,
      xp: 3520,
      rank: 1,
    },
    {
      studentId: 102,
      studentName: "Meera Reddy",
      name: "Meera Reddy",
      totalXp: 3140,
      xp: 3140,
      rank: 2,
    },
    {
      studentId: 101,
      studentName: "Chaitanya",
      name: "Chaitanya",
      totalXp: 2840,
      xp: 2840,
      rank: 3,
    },
    {
      studentId: 108,
      studentName: "Rahul Varma",
      name: "Rahul Varma",
      totalXp: 2510,
      xp: 2510,
      rank: 4,
    },
    {
      studentId: 107,
      studentName: "Sneha Iyer",
      name: "Sneha Iyer",
      totalXp: 2290,
      xp: 2290,
      rank: 5,
    },
  ] as unknown as GamificationLeaderboardEntry[],

  rank: {
    studentId: 101,
    rank: 3,
    totalParticipants: 42,
    scope: "BATCH",
  } as unknown as RankPosition,

  error: "Showing dummy gamification data.",
};

export function StudentGamificationSection() {
  const state = dummyGamificationState;

  const latestBadges = useMemo(
    () => getLatestBadges(state.badges),
    [state.badges],
  );

  const challengePreview = useMemo(
    () => state.challengeProgress.map(toChallengeCardItem),
    [state.challengeProgress],
  );

  const totalStreakDays = getTotalStreakDays(state.streaks);

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
            <Trophy aria-hidden="true" size={24} strokeWidth={2.5} />
          </span>

          <div className="min-w-0">
            <p className="text-[13px] font-extrabold uppercase text-text-muted">
              Gamification
            </p>

            <h2 className="mt-1 text-[21px] font-extrabold leading-7 text-text-primary">
              XP, rewards, and friendly progress
            </h2>

            <p className="mt-1 text-[14px] leading-6 text-text-secondary">
              Live motivation snapshot from your ScholarLearn gamification
              profile.
            </p>
          </div>
        </div>

        {state.error ? (
          <span className="rounded-full bg-yellow-soft px-3 py-1.5 text-[12px] font-extrabold text-text-primary">
            {state.error}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Zap}
          label="XP"
          title={formatGamificationNumber(readNumber(state.xp, "totalXp"))}
          subtitle={`${formatGamificationNumber(
            Math.max(
              readNumber(state.xp, "nextLevelXp") -
                readNumber(state.xp, "currentLevelXp"),
              0,
            ),
          )} XP needed for next level`}
          progress={
            readNumber(state.xp, "progressPercentage") ||
            calculateGamificationProgress(
              readNumber(state.xp, "currentLevelXp"),
              readNumber(state.xp, "nextLevelXp"),
            )
          }
          tone="primary"
        />

        <SummaryCard
          icon={Star}
          label="Level"
          title={readString(state.level, "levelName") ?? "Code Warrior"}
          subtitle={`Level ${
            readNumber(state.level, "levelNumber") || "-"
          } · ${formatGamificationNumber(
            readNumber(state.level, "currentXp") ||
              readNumber(state.xp, "totalXp"),
          )} XP`}
          progress={
            readNumber(state.level, "progressPercentage") ||
            calculateGamificationProgress(
              readNumber(state.level, "currentXp") ||
                readNumber(state.xp, "totalXp"),
              readNumber(state.level, "maxXp") ||
                readNumber(state.xp, "nextLevelXp"),
            )
          }
          tone="blue"
        />

        <SummaryCard
          icon={Coins}
          label="Coins"
          title={formatGamificationNumber(readNumber(state.coins, "totalCoins"))}
          subtitle={`${formatGamificationNumber(
            readNumber(state.coins, "earnedCoins"),
          )} earned · ${formatGamificationNumber(
            readNumber(state.coins, "spentCoins"),
          )} spent`}
          progress={calculateGamificationProgress(
            readNumber(state.coins, "totalCoins"),
            Math.max(readNumber(state.coins, "earnedCoins"), 1),
          )}
          tone="yellow"
        />

        <StreakSummaryCard streaks={state.streaks} totalDays={totalStreakDays} />
      </div>

      <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,34fr)_minmax(0,33fr)_minmax(0,33fr)]">
        <PreviewPanel
          icon={Award}
          title="Latest Badges"
          description="Recently earned achievements"
          footer={
            <MiniInfoStrip
              icon={Award}
              label="Badge power"
              value={`${latestBadges.length} recent rewards`}
            />
          }
        >
          {latestBadges.length ? (
            <div className="space-y-3">
              {latestBadges.map((badge) => (
                <BadgeCard
                  key={String(
                    badge.studentBadgeId ??
                      `${badge.badgeId}-${badge.awardedAt ?? "badge"}`,
                  )}
                  studentBadge={badge}
                />
              ))}
            </div>
          ) : (
            <GamificationEmptyState
              title="No badges earned yet"
              description="Earned badges will appear here after the backend awards them."
            />
          )}
        </PreviewPanel>

        <PreviewPanel
          icon={Sparkles}
          title="Active Challenges"
          description="Daily and weekly goals"
          footer={
            <MiniInfoStrip
              icon={Target}
              label="Goal status"
              value={`${getCompletedChallengeCount(
                challengePreview,
              )}/${challengePreview.length} completed`}
            />
          }
        >
          {challengePreview.length ? (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="space-y-3">
                {challengePreview.map((challenge) => (
                  <ChallengeCard key={String(challenge.id)} item={challenge} />
                ))}
              </div>
            </div>
          ) : (
            <GamificationEmptyState
              title="No active challenges"
              description="Daily or weekly challenges will show here when assigned."
            />
          )}
        </PreviewPanel>

        <PreviewPanel
          icon={Medal}
          title="Leaderboard Preview"
          description="Batch rank and top students"
          footer={
            <MiniInfoStrip
              icon={Trophy}
              label="Current standing"
              value={`Rank #${state.rank?.rank ?? "-"} of ${
                state.rank?.totalParticipants ?? "-"
              }`}
            />
          }
        >
          <div className="mb-4 rounded-2xl bg-primary-soft p-4 text-primary-dark">
            <p className="text-[12px] font-extrabold uppercase">Your rank</p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-[28px] font-extrabold leading-none">
                #{state.rank?.rank ?? "-"}
              </p>

              {state.rank?.totalParticipants ? (
                <span className="text-[12px] font-extrabold">
                  of {state.rank.totalParticipants}
                </span>
              ) : null}
            </div>
          </div>

          {state.leaderboard.length ? (
            <>
              <LeaderboardTable
                entries={state.leaderboard.slice(0, 5)}
                currentStudentId={state.rank?.studentId}
                compact
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniMetric label="Top XP" value="3,520" />
                <MiniMetric label="Gap to #2" value="300 XP" />
              </div>
            </>
          ) : (
            <GamificationEmptyState
              title="No leaderboard data"
              description="Top batch students will appear when the API returns rankings."
            />
          )}
        </PreviewPanel>
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  progress,
  subtitle,
  title,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  progress: number;
  subtitle: string;
  title: string;
  tone: "primary" | "blue" | "yellow";
}) {
  const safeProgress = Math.max(0, Math.min(Math.round(progress), 100));

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase text-text-muted">
            {label}
          </p>

          <h3 className="mt-3 truncate text-[23px] font-extrabold leading-tight text-text-primary">
            {title}
          </h3>

          <p className="mt-1 line-clamp-1 text-[12px] leading-5 text-text-secondary">
            {subtitle}
          </p>
        </div>

        <span className={summaryIconClassName(tone)}>
          <Icon aria-hidden="true" size={20} strokeWidth={2.5} />
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold text-text-secondary">
          <span>Progress</span>
          <span>{safeProgress}%</span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-surface">
          <div
            className={summaryProgressClassName(tone)}
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniMetric label="Today" value="+120 XP" />
        <MiniMetric label="Weekly" value="+640 XP" />
      </div>
    </article>
  );
}

function StreakSummaryCard({
  streaks,
  totalDays,
}: {
  streaks: StudentStreak[];
  totalDays: number;
}) {
  return (
    <article className="min-h-[270px] rounded-2xl border border-border bg-surface-soft p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">
            Streaks
          </p>

          <h3 className="mt-5 text-[28px] font-extrabold leading-tight text-text-primary">
            {totalDays} days
          </h3>
        </div>

        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-soft text-orange">
          <Flame aria-hidden="true" size={22} strokeWidth={2.5} />
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {streaks.map((streak) => (
          <StreakRow
            key={String(streak.streakId ?? streak.streakType)}
            streak={streak}
          />
        ))}
      </div>
    </article>
  );
}

function StreakRow({ streak }: { streak: StudentStreak }) {
  const currentStreak = readNumber(streak, "currentStreak");
  const longestStreak = readNumber(streak, "longestStreak");
  const streakType = readString(streak, "streakType") ?? "Streak";

  return (
    <div className="rounded-2xl bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-extrabold text-text-primary">
          {streakType}
        </span>

        <span className="text-[13px] font-extrabold text-text-primary">
          {currentStreak} days
        </span>
      </div>

      <p className="mt-1 text-[11px] font-bold text-text-muted">
        Best streak: {longestStreak} days
      </p>
    </div>
  );
}

function PreviewPanel({
  children,
  description,
  footer,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  footer?: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className="flex min-h-[560px] flex-col rounded-2xl border border-border bg-surface-soft p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-surface text-primary-dark shadow-card">
          <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>

        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-extrabold text-text-primary">
            {title}
          </h3>

          <p className="mt-1 line-clamp-1 text-[12px] leading-5 text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1">{children}</div>

      {footer ? <div className="mt-3">{footer}</div> : null}
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2">
      <p className="text-[10px] font-extrabold uppercase text-text-muted">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[12px] font-extrabold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function MiniInfoStrip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase text-text-muted">
          {label}
        </p>

        <p className="truncate text-[12px] font-extrabold text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

function summaryIconClassName(tone: "primary" | "blue" | "yellow") {
  if (tone === "blue") {
    return "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue";
  }

  if (tone === "yellow") {
    return "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-soft text-text-primary";
  }

  return "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark";
}

function summaryProgressClassName(tone: "primary" | "blue" | "yellow") {
  const base = "h-full rounded-full";

  if (tone === "blue") {
    return `${base} bg-blue`;
  }

  if (tone === "yellow") {
    return `${base} bg-yellow`;
  }

  return `${base} bg-primary`;
}

function toChallengeCardItem(
  challenge: StudentChallengeProgress,
): ChallengeCardItem {
  const target = challenge.targetValue ?? challenge.challenge?.targetValue;

  return {
    coinReward: challenge.challenge?.coinReward,
    description: challenge.challenge?.description,
    id: challenge.progressId ?? challenge.challengeId,
    progress:
      readGamificationProgress(challenge.progressPercentage) ||
      calculateGamificationProgress(challenge.currentValue, target),
    status: challenge.status,
    subtitle: `${formatGamificationNumber(
      challenge.currentValue,
    )}/${target ? formatGamificationNumber(target) : "-"} progress`,
    title: challenge.challenge?.title ?? `Challenge ${challenge.challengeId}`,
    xpReward: challenge.challenge?.xpReward,
  };
}

function getLatestBadges(badges: StudentBadge[]) {
  return [...badges]
    .sort(
      (first, second) =>
        getGamificationTime(second.awardedAt) -
        getGamificationTime(first.awardedAt),
    )
    .slice(0, 4);
}

function getCompletedChallengeCount(challenges: ChallengeCardItem[]) {
  return challenges.filter(
    (challenge) => String(challenge.status).toUpperCase() === "COMPLETED",
  ).length;
}

function getTotalStreakDays(streaks: StudentStreak[]) {
  return streaks.reduce(
    (total, streak) => total + readNumber(streak, "currentStreak"),
    0,
  );
}

function readNumber(source: unknown, key: string) {
  if (!source || typeof source !== "object") {
    return 0;
  }

  const value = (source as Record<string, unknown>)[key];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readString(source: unknown, key: string) {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const value = (source as Record<string, unknown>)[key];

  return typeof value === "string" ? value : undefined;
}