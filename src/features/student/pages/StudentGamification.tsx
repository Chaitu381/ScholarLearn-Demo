import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, Coins, Flame, Medal, Sparkles, Star, Trophy, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageTitle } from "../../../shared/components/ui/PageTitle";
import {
  BadgeGrid,
  ChallengeCard,
  CoinsCard,
  GamificationEmptyState,
  GamificationErrorState,
  GamificationSkeleton,
  LeaderboardTable,
  LevelCard,
  QuestCard,
  XpProgressCard,
  calculateGamificationProgress,
  findGamificationStreak,
  formatBestGamificationStreak,
  formatGamificationDate,
  formatGamificationLevel,
  formatGamificationNumber,
  formatGamificationStreak,
  formatRecentXp,
  getGamificationTime,
  readGamificationProgress,
  type ChallengeCardItem,
  type QuestCardItem,
} from "../components/gamification";
import { PageCard, StudentPage, ToneBadge } from "../components/StudentPagePrimitives";
import {
  getStudentGamificationApiErrorMessage,
  studentGamificationApi,
} from "../services/studentGamificationApi";
import type {
  Badge,
  CoinBalance,
  CoinTransaction,
  GamificationChallenge,
  GamificationLeaderboardEntry,
  GamificationPeriod,
  GamificationQuest,
  RankPosition,
  StudentBadge,
  StudentChallengeProgress,
  StudentLevel,
  StudentQuestProgress,
  StudentStreak,
  StudentXp,
} from "../types/gamification.types";

type PageState = {
  allBadges: Badge[];
  allChallenges: GamificationChallenge[];
  allQuests: GamificationQuest[];
  batchLeaderboard: GamificationLeaderboardEntry[];
  challengeProgress: StudentChallengeProgress[];
  coins: CoinBalance | null;
  coinTransactions: CoinTransaction[];
  error: string;
  level: StudentLevel | null;
  loading: boolean;
  monthlyLeaderboard: GamificationLeaderboardEntry[];
  questProgress: StudentQuestProgress[];
  rank: RankPosition | null;
  studentBadges: StudentBadge[];
  streaks: StudentStreak[];
  weeklyLeaderboard: GamificationLeaderboardEntry[];
  xp: StudentXp | null;
};

const initialState: PageState = {
  allBadges: [],
  allChallenges: [],
  allQuests: [],
  batchLeaderboard: [],
  challengeProgress: [],
  coins: null,
  coinTransactions: [],
  error: "",
  level: null,
  loading: true,
  monthlyLeaderboard: [],
  questProgress: [],
  rank: null,
  studentBadges: [],
  streaks: [],
  weeklyLeaderboard: [],
  xp: null,
};

const challengePeriods: Array<Exclude<GamificationPeriod, "ALL_TIME">> = ["DAILY", "WEEKLY", "MONTHLY"];

export function StudentGamification() {
  const [state, setState] = useState<PageState>(initialState);

  useEffect(() => {
    let active = true;

    async function loadGamificationPage() {
      setState((current) => ({ ...current, error: "", loading: true }));

      const [
        xpResult,
        levelResult,
        coinsResult,
        coinTransactionsResult,
        streaksResult,
        allBadgesResult,
        studentBadgesResult,
        dailyChallengesResult,
        weeklyChallengesResult,
        monthlyChallengesResult,
        challengeProgressResult,
        allQuestsResult,
        questProgressResult,
        rankResult,
        batchLeaderboardResult,
        weeklyLeaderboardResult,
        monthlyLeaderboardResult,
      ] = await Promise.allSettled([
        studentGamificationApi.getStudentXp(),
        studentGamificationApi.getStudentLevel(),
        studentGamificationApi.getStudentCoins(),
        studentGamificationApi.getStudentCoinTransactions(),
        studentGamificationApi.getStudentStreaks(),
        studentGamificationApi.getBadges(),
        studentGamificationApi.getStudentBadges(),
        studentGamificationApi.getChallenges("DAILY"),
        studentGamificationApi.getChallenges("WEEKLY"),
        studentGamificationApi.getChallenges("MONTHLY"),
        studentGamificationApi.getStudentChallengeProgress(),
        studentGamificationApi.getQuests(),
        studentGamificationApi.getStudentQuestProgress(),
        studentGamificationApi.getRankPosition(undefined, { scope: "BATCH" }),
        studentGamificationApi.getLeaderboards({ limit: 5, scope: "BATCH" }),
        studentGamificationApi.getLeaderboards({ limit: 5, period: "WEEKLY", scope: "BATCH" }),
        studentGamificationApi.getLeaderboards({ limit: 5, period: "MONTHLY", scope: "BATCH" }),
      ]);

      if (!active) {
        return;
      }

      const results = [
        xpResult,
        levelResult,
        coinsResult,
        coinTransactionsResult,
        streaksResult,
        allBadgesResult,
        studentBadgesResult,
        dailyChallengesResult,
        weeklyChallengesResult,
        monthlyChallengesResult,
        challengeProgressResult,
        allQuestsResult,
        questProgressResult,
        rankResult,
        batchLeaderboardResult,
        weeklyLeaderboardResult,
        monthlyLeaderboardResult,
      ];
      const rejectedResults = results.filter((result) => result.status === "rejected");
      const firstRejected = rejectedResults[0] as PromiseRejectedResult | undefined;

      setState({
        allBadges: getFulfilledValue(allBadgesResult) ?? [],
        allChallenges: [
          ...(getFulfilledValue(dailyChallengesResult) ?? []),
          ...(getFulfilledValue(weeklyChallengesResult) ?? []),
          ...(getFulfilledValue(monthlyChallengesResult) ?? []),
        ],
        allQuests: getFulfilledValue(allQuestsResult) ?? [],
        batchLeaderboard: getFulfilledValue(batchLeaderboardResult) ?? [],
        challengeProgress: getFulfilledValue(challengeProgressResult) ?? [],
        coins: getFulfilledValue(coinsResult),
        coinTransactions: getFulfilledValue(coinTransactionsResult) ?? [],
        error:
          rejectedResults.length === results.length
            ? getStudentGamificationApiErrorMessage(firstRejected?.reason)
            : rejectedResults.length
              ? "Some gamification data could not be loaded."
              : "",
        level: getFulfilledValue(levelResult),
        loading: false,
        monthlyLeaderboard: getFulfilledValue(monthlyLeaderboardResult) ?? [],
        questProgress: getFulfilledValue(questProgressResult) ?? [],
        rank: getFulfilledValue(rankResult),
        studentBadges: getFulfilledValue(studentBadgesResult) ?? [],
        streaks: getFulfilledValue(streaksResult) ?? [],
        weeklyLeaderboard: getFulfilledValue(weeklyLeaderboardResult) ?? [],
        xp: getFulfilledValue(xpResult),
      });
    }

    void loadGamificationPage();

    return () => {
      active = false;
    };
  }, []);

  const earnedBadges = useMemo(() => sortBadgesByDate(state.studentBadges), [state.studentBadges]);
  const lockedBadges = useMemo(() => getLockedBadges(state.allBadges, state.studentBadges), [state.allBadges, state.studentBadges]);
  const challengesByPeriod = useMemo(
    () => createChallengeGroups(state.allChallenges, state.challengeProgress),
    [state.allChallenges, state.challengeProgress],
  );
  const questGroups = useMemo(() => createQuestGroups(state.allQuests, state.questProgress), [state.allQuests, state.questProgress]);
  const currentStudentId = state.rank?.studentId;

  if (state.loading) {
    return <GamificationSkeleton cardCount={5} fullPage />;
  }

  return (
    <StudentPage>
      <PageTitle
        title="Gamification"
        description="Track XP, levels, coins, streaks, badges, challenges, quests, and leaderboard progress from live gamification data."
      />

      <GamificationErrorState message={state.error} />

      <PageCard title="Gamification Overview" description="Your current progress snapshot across rewards, rank, and streaks." icon={Trophy}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <OverviewTile icon={Star} label="Current Level" value={formatGamificationLevel(state.level)} helper={state.level?.levelName ?? "Level name not reported"} />
          <OverviewTile icon={Zap} label="XP" value={formatGamificationNumber(state.xp?.totalXp ?? state.xp?.lifetimeXp)} helper={formatRecentXp(state.xp)} />
          <OverviewTile icon={Coins} label="Coins" value={formatGamificationNumber(state.coins?.availableCoins ?? state.coins?.totalCoins)} helper="Current balance" />
          <OverviewTile icon={Medal} label="Rank" value={state.rank ? `#${state.rank.rank}` : "-"} helper={state.rank?.totalParticipants ? `of ${state.rank.totalParticipants}` : "Batch rank"} />
          <OverviewTile icon={Flame} label="Best Streak" value={formatBestGamificationStreak(state.streaks)} helper="Attendance, test, or coding" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <StreakSummary label="Attendance streak" streak={findGamificationStreak(state.streaks, "ATTENDANCE")} />
          <StreakSummary label="Test streak" streak={findGamificationStreak(state.streaks, "TEST")} />
          <StreakSummary label="Coding streak" streak={findGamificationStreak(state.streaks, "CODING")} />
        </div>
      </PageCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
        <PageCard title="XP and Level" description="Progress toward the next learning level." icon={Zap}>
          <div className="grid gap-4 md:grid-cols-2">
            <XpProgressCard xp={state.xp} level={state.level} />
            <LevelCard level={state.level} />
          </div>
        </PageCard>

        <PageCard title="Coins" description="Balance and recent coin activity." icon={Coins}>
          <CoinsCard coins={state.coins} />
          <div className="mt-5 space-y-3">
            {state.coinTransactions.length ? (
              state.coinTransactions.slice(0, 6).map((transaction) => (
                <CoinTransactionRow key={String(transaction.transactionId)} transaction={transaction} />
              ))
            ) : (
              <GamificationEmptyState title="No coin transactions" description="Coin earning and spending history will appear here when returned by the API." />
            )}
          </div>
        </PageCard>
      </div>

      <PageCard title="Badges" description="Earned badges and locked badges returned by the backend." icon={Award}>
        <SectionSubheading title="Earned badges" count={earnedBadges.length} />
        <BadgeGrid
          badges={earnedBadges}
          emptyTitle="No earned badges"
          emptyDescription="Earned badges will appear here after the backend awards them."
        />

        <div className="mt-6">
          <SectionSubheading title="Locked badges" count={lockedBadges.length} />
          <BadgeGrid
            badges={lockedBadges}
            locked
            emptyTitle="No locked badge catalog"
            emptyDescription="Locked badges require the backend to return the full badge catalog."
          />
        </div>
      </PageCard>

      <PageCard title="Challenges" description="Daily, weekly, and monthly challenge progress with rewards." icon={Sparkles}>
        <div className="grid gap-5 xl:grid-cols-3">
          {challengePeriods.map((period) => (
            <ChallengeColumn key={period} period={period} items={challengesByPeriod[period]} />
          ))}
        </div>
      </PageCard>

      <PageCard title="Quests" description="Active, completed, and weak-topic quests when supported by the backend." icon={CheckCircle2}>
        <div className="grid gap-5 xl:grid-cols-3">
          <QuestColumn title="Active quests" items={questGroups.active} />
          <QuestColumn title="Completed quests" items={questGroups.completed} />
          <QuestColumn title="Weak-topic quests" items={questGroups.weakTopic} />
        </div>
      </PageCard>

      <PageCard title="Leaderboard" description="Batch, weekly, and monthly standings from the gamification leaderboard API." icon={Medal}>
        <div className="grid gap-5 xl:grid-cols-3">
          <LeaderboardPanel title="Batch leaderboard" entries={state.batchLeaderboard} currentStudentId={currentStudentId} />
          <LeaderboardPanel title="Weekly leaderboard" entries={state.weeklyLeaderboard} currentStudentId={currentStudentId} />
          <LeaderboardPanel title="Monthly leaderboard" entries={state.monthlyLeaderboard} currentStudentId={currentStudentId} />
        </div>
      </PageCard>
    </StudentPage>
  );
}

function OverviewTile({ helper, icon: Icon, label, value }: { helper: string; icon: LucideIcon; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <Icon aria-hidden="true" className="text-primary-dark" size={20} strokeWidth={2.5} />
      <p className="mt-3 text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-2 truncate text-[24px] font-extrabold leading-none text-text-primary">{value}</p>
      <p className="mt-2 text-[13px] font-bold leading-5 text-text-secondary">{helper}</p>
    </article>
  );
}

function StreakSummary({ label, streak }: { label: string; streak: StudentStreak | undefined }) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl bg-surface-soft p-4">
      <div>
        <p className="text-[13px] font-extrabold text-text-primary">{label}</p>
        <p className="mt-1 text-[12px] font-semibold text-text-secondary">
          {streak?.lastActivityDate ? `Last active ${formatGamificationDate(streak.lastActivityDate)}` : "Not reported"}
        </p>
      </div>
      <span className="rounded-full bg-primary-soft px-3 py-1.5 text-[13px] font-extrabold text-primary-dark">
        {formatGamificationStreak(streak)}
      </span>
    </article>
  );
}

function SectionSubheading({ count, title }: { count: number; title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-[16px] font-extrabold text-text-primary">{title}</h3>
      <ToneBadge label={`${count} item${count === 1 ? "" : "s"}`} tone="neutral" />
    </div>
  );
}

function ChallengeColumn({ items, period }: { items: ChallengeCardItem[]; period: Exclude<GamificationPeriod, "ALL_TIME"> }) {
  return (
    <section className="rounded-2xl bg-surface-soft p-4">
      <SectionColumnTitle title={`${formatPeriod(period)} challenges`} count={items.length} />
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => <ChallengeCard key={String(item.id)} item={item} />)
        ) : (
          <GamificationEmptyState title="No challenges" description={`${formatPeriod(period)} challenge data is empty.`} compact />
        )}
      </div>
    </section>
  );
}

function QuestColumn({ items, title }: { items: QuestCardItem[]; title: string }) {
  return (
    <section className="rounded-2xl bg-surface-soft p-4">
      <SectionColumnTitle title={title} count={items.length} />
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => <QuestCard key={String(item.id)} item={item} />)
        ) : (
          <GamificationEmptyState title="No quests" description={`${title} are empty.`} compact />
        )}
      </div>
    </section>
  );
}

function CoinTransactionRow({ transaction }: { transaction: CoinTransaction }) {
  const earned = transaction.amount >= 0 && transaction.type !== "SPENT";

  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl bg-surface-soft p-4">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-extrabold text-text-primary">{transaction.description || formatTransactionType(transaction.type)}</p>
        <p className="mt-1 text-[12px] font-semibold text-text-secondary">{transaction.createdAt ? formatGamificationDate(transaction.createdAt) : "Date not reported"}</p>
      </div>
      <span className={earned ? "rounded-full bg-primary-soft px-3 py-1.5 text-[13px] font-extrabold text-primary-dark" : "rounded-full bg-red-soft px-3 py-1.5 text-[13px] font-extrabold text-red"}>
        {earned ? "+" : "-"}{formatGamificationNumber(Math.abs(transaction.amount))}
      </span>
    </article>
  );
}

function LeaderboardPanel({
  currentStudentId,
  entries,
  title,
}: {
  currentStudentId?: string | number;
  entries: GamificationLeaderboardEntry[];
  title: string;
}) {
  return (
    <section className="rounded-2xl bg-surface-soft p-4">
      <SectionColumnTitle title={title} count={entries.length} />
      <div className="mt-4">
        {entries.length ? (
          <LeaderboardTable entries={entries} currentStudentId={currentStudentId} compact />
        ) : (
          <GamificationEmptyState title="No ranking data" description={`${title} is empty.`} compact />
        )}
      </div>
    </section>
  );
}

function SectionColumnTitle({ count, title }: { count: number; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[15px] font-extrabold text-text-primary">{title}</h3>
      <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-secondary shadow-card">
        {count}
      </span>
    </div>
  );
}

function createChallengeGroups(challenges: GamificationChallenge[], progressItems: StudentChallengeProgress[]) {
  const progressByChallengeId = new Map(progressItems.map((item) => [String(item.challengeId), item]));
  const mergedItems = challenges.map((challenge) => {
    const progress = progressByChallengeId.get(String(challenge.challengeId));
    return toChallengeCardItem(challenge, progress);
  });
  const progressOnlyItems = progressItems
    .filter((progress) => !challenges.some((challenge) => String(challenge.challengeId) === String(progress.challengeId)))
    .map((progress) => toChallengeCardItem(progress.challenge, progress));
  const allItems = [...mergedItems, ...progressOnlyItems];

  return {
    DAILY: allItems.filter((item) => item.period === "DAILY"),
    MONTHLY: allItems.filter((item) => item.period === "MONTHLY"),
    WEEKLY: allItems.filter((item) => item.period === "WEEKLY"),
  };
}

function toChallengeCardItem(challenge: GamificationChallenge | undefined, progress: StudentChallengeProgress | undefined): ChallengeCardItem & { period: Exclude<GamificationPeriod, "ALL_TIME"> } {
  const targetValue = progress?.targetValue ?? challenge?.targetValue;
  const currentValue = progress?.currentValue ?? 0;

  return {
    coinReward: challenge?.coinReward,
    description: challenge?.description,
    id: progress?.progressId ?? progress?.challengeId ?? challenge?.challengeId ?? "unknown-challenge",
    period: challenge?.period ?? "DAILY",
    progress: readGamificationProgress(progress?.progressPercentage) || calculateGamificationProgress(currentValue, targetValue),
    status: progress?.status ?? "NOT_STARTED",
    title: challenge?.title ?? `Challenge ${progress?.challengeId ?? ""}`.trim(),
    xpReward: challenge?.xpReward,
  };
}

function createQuestGroups(quests: GamificationQuest[], progressItems: StudentQuestProgress[]) {
  const progressByQuestId = new Map(progressItems.map((item) => [String(item.questId), item]));
  const mergedItems = quests.map((quest) => {
    const progress = progressByQuestId.get(String(quest.questId));
    return toQuestCardItem(quest, progress);
  });
  const progressOnlyItems = progressItems
    .filter((progress) => !quests.some((quest) => String(quest.questId) === String(progress.questId)))
    .map((progress) => toQuestCardItem(progress.quest, progress));
  const allItems = [...mergedItems, ...progressOnlyItems];

  return {
    active: allItems.filter((item) => item.status !== "COMPLETED" && item.status !== "CLAIMED"),
    completed: allItems.filter((item) => item.status === "COMPLETED" || item.status === "CLAIMED"),
    weakTopic: allItems.filter((item) => item.type?.toUpperCase().includes("WEAK")),
  };
}

function toQuestCardItem(quest: GamificationQuest | undefined, progress: StudentQuestProgress | undefined): QuestCardItem {
  const targetValue = progress?.targetValue ?? quest?.targetValue;
  const currentValue = progress?.currentValue ?? 0;

  return {
    coinReward: quest?.coinReward,
    description: quest?.description,
    id: progress?.progressId ?? progress?.questId ?? quest?.questId ?? "unknown-quest",
    progress: readGamificationProgress(progress?.progressPercentage) || calculateGamificationProgress(currentValue, targetValue),
    status: progress?.status ?? "NOT_STARTED",
    title: quest?.title ?? `Quest ${progress?.questId ?? ""}`.trim(),
    type: quest?.questType,
    xpReward: quest?.xpReward,
  };
}

function getLockedBadges(allBadges: Badge[], studentBadges: StudentBadge[]) {
  const earnedBadgeIds = new Set(studentBadges.map((badge) => String(badge.badgeId)));
  return allBadges.filter((badge) => !earnedBadgeIds.has(String(badge.badgeId)));
}

function sortBadgesByDate(badges: StudentBadge[]) {
  return [...badges].sort((first, second) => getGamificationTime(second.awardedAt) - getGamificationTime(first.awardedAt));
}

function formatPeriod(period: Exclude<GamificationPeriod, "ALL_TIME">) {
  return period.charAt(0) + period.slice(1).toLowerCase();
}

function formatTransactionType(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFulfilledValue<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : null;
}
