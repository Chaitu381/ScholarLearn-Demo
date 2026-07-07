import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { Award, Flame, Medal, Sparkles, Star, Target, Trophy, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ChallengeCard,
  GamificationEmptyState,
  GamificationErrorState,
  GamificationSkeleton,
  LeaderboardTable,
  LevelCard,
  QuestCard,
  StreakCard,
  XpProgressCard,
  calculateGamificationProgress,
  formatGamificationLevel,
  formatGamificationNumber,
  readGamificationProgress,
  type ChallengeCardItem,
  type QuestCardItem,
} from "../gamification";
import {
  ChartShell,
  MetricCard,
  MiniProgress,
  PageCard,
  ToneBadge,
  chartTooltipStyle,
} from "../StudentPagePrimitives";
import {
  getStudentGamificationApiErrorMessage,
  studentGamificationApi,
} from "../../services/studentGamificationApi";
import type {
  Badge,
  CoinBalance,
  GamificationChallenge,
  GamificationLeaderboardEntry,
  GamificationQuest,
  RankPosition,
  StudentBadge,
  StudentChallengeProgress,
  StudentLevel,
  StudentQuestProgress,
  StudentStreak,
  StudentXp,
} from "../../types/gamification.types";

type GamificationAnalyticsState = {
  allBadges: Badge[];
  allChallenges: GamificationChallenge[];
  allQuests: GamificationQuest[];
  challengeProgress: StudentChallengeProgress[];
  coins: CoinBalance | null;
  error: string;
  leaderboard: GamificationLeaderboardEntry[];
  level: StudentLevel | null;
  loading: boolean;
  questProgress: StudentQuestProgress[];
  rank: RankPosition | null;
  studentBadges: StudentBadge[];
  streaks: StudentStreak[];
  xp: StudentXp | null;
};

const initialState: GamificationAnalyticsState = {
  allBadges: [],
  allChallenges: [],
  allQuests: [],
  challengeProgress: [],
  coins: null,
  error: "",
  leaderboard: [],
  level: null,
  loading: true,
  questProgress: [],
  rank: null,
  studentBadges: [],
  streaks: [],
  xp: null,
};

export function StudentGamificationAnalyticsSection() {
  const [state, setState] = useState<GamificationAnalyticsState>(initialState);

  useEffect(() => {
    let active = true;

    async function loadGamificationAnalytics() {
      setState((current) => ({ ...current, error: "", loading: true }));

      const [
        xpResult,
        levelResult,
        coinsResult,
        streaksResult,
        allBadgesResult,
        studentBadgesResult,
        challengesResult,
        challengeProgressResult,
        questsResult,
        questProgressResult,
        rankResult,
        leaderboardResult,
      ] = await Promise.allSettled([
        studentGamificationApi.getStudentXp(),
        studentGamificationApi.getStudentLevel(),
        studentGamificationApi.getStudentCoins(),
        studentGamificationApi.getStudentStreaks(),
        studentGamificationApi.getBadges(),
        studentGamificationApi.getStudentBadges(),
        studentGamificationApi.getChallenges(),
        studentGamificationApi.getStudentChallengeProgress(),
        studentGamificationApi.getQuests(),
        studentGamificationApi.getStudentQuestProgress(),
        studentGamificationApi.getRankPosition(undefined, { scope: "BATCH" }),
        studentGamificationApi.getLeaderboards({ limit: 5, scope: "BATCH" }),
      ]);

      if (!active) {
        return;
      }

      const results = [
        xpResult,
        levelResult,
        coinsResult,
        streaksResult,
        allBadgesResult,
        studentBadgesResult,
        challengesResult,
        challengeProgressResult,
        questsResult,
        questProgressResult,
        rankResult,
        leaderboardResult,
      ];
      const rejectedResults = results.filter((result) => result.status === "rejected");
      const firstRejected = rejectedResults[0] as PromiseRejectedResult | undefined;

      setState({
        allBadges: getFulfilledValue(allBadgesResult) ?? [],
        allChallenges: getFulfilledValue(challengesResult) ?? [],
        allQuests: getFulfilledValue(questsResult) ?? [],
        challengeProgress: getFulfilledValue(challengeProgressResult) ?? [],
        coins: getFulfilledValue(coinsResult),
        error:
          rejectedResults.length === results.length
            ? getStudentGamificationApiErrorMessage(firstRejected?.reason)
            : rejectedResults.length
              ? "Some gamification analytics could not be loaded."
              : "",
        leaderboard: getFulfilledValue(leaderboardResult) ?? [],
        level: getFulfilledValue(levelResult),
        loading: false,
        questProgress: getFulfilledValue(questProgressResult) ?? [],
        rank: getFulfilledValue(rankResult),
        studentBadges: getFulfilledValue(studentBadgesResult) ?? [],
        streaks: getFulfilledValue(streaksResult) ?? [],
        xp: getFulfilledValue(xpResult),
      });
    }

    void loadGamificationAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const xpTrend = useMemo(() => createXpTrend(state.xp), [state.xp]);
  const challengeItems = useMemo(
    () => createChallengeItems(state.allChallenges, state.challengeProgress),
    [state.allChallenges, state.challengeProgress],
  );
  const questItems = useMemo(() => createQuestItems(state.allQuests, state.questProgress), [state.allQuests, state.questProgress]);
  const weakTopicQuests = useMemo(
    () => questItems.filter((quest) => quest.type?.toUpperCase().includes("WEAK") || quest.title.toUpperCase().includes("WEAK")),
    [questItems],
  );

  const completedChallenges = state.challengeProgress.filter(isCompletedProgress).length;
  const completedQuests = state.questProgress.filter(isCompletedProgress).length;
  const badgeProgress = state.allBadges.length ? Math.round((state.studentBadges.length / state.allBadges.length) * 100) : 0;
  const challengeProgress = state.challengeProgress.length ? Math.round((completedChallenges / state.challengeProgress.length) * 100) : 0;
  const questProgress = state.questProgress.length ? Math.round((completedQuests / state.questProgress.length) * 100) : 0;

  if (state.loading) {
    return <GamificationSkeleton cardCount={4} />;
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        title="Gamification Analytics"
        description="XP, level, badges, challenges, quests, streaks, and rank from the live gamification API."
      />

      <GamificationErrorState message={state.error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Zap} label="Current XP" value={formatGamificationNumber(state.xp?.totalXp ?? state.xp?.lifetimeXp)} helper="Live XP balance" tone="primary" />
        <MetricCard icon={Star} label="Current Level" value={formatGamificationLevel(state.level)} helper={state.level?.level ? `Level ${state.level.level}` : "Level not reported"} tone="blue" />
        <MetricCard icon={Award} label="Badges Earned" value={state.studentBadges.length} helper={state.allBadges.length ? `Out of ${state.allBadges.length}` : "Catalog not returned"} tone="yellow" />
        <MetricCard icon={Medal} label="Batch Rank" value={state.rank ? `#${state.rank.rank}` : "-"} helper={state.rank?.totalParticipants ? `Out of ${state.rank.totalParticipants}` : "Rank not reported"} tone="orange" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,58fr)_minmax(320px,42fr)]">
        <ChartShell title="XP Trend" description="XP history when returned by the backend" height={300}>
          {xpTrend.length ? (
            <LineChart data={xpTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line dataKey="xp" stroke="var(--primary)" strokeWidth={3} name="XP" />
            </LineChart>
          ) : (
            <GamificationEmptyState
              title="XP history unavailable"
              description="Current XP is available, but the backend did not return XP history points for a trend chart."
            />
          )}
        </ChartShell>

        <PageCard title="Level Progress" description="Progress toward the next gamified level." icon={Trophy}>
          <div className="grid gap-4">
            <XpProgressCard xp={state.xp} level={state.level} />
            <LevelCard level={state.level} />
          </div>
        </PageCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ProgressPanel
          icon={Award}
          title="Badge Progress"
          value={badgeProgress}
          meta={`${state.studentBadges.length}/${state.allBadges.length || "-"} badges`}
        />
        <ProgressPanel
          icon={Sparkles}
          title="Challenge Completion"
          value={challengeProgress}
          meta={`${completedChallenges}/${state.challengeProgress.length || "-"} challenges`}
        />
        <ProgressPanel
          icon={Target}
          title="Quest Progress"
          value={questProgress}
          meta={`${completedQuests}/${state.questProgress.length || "-"} quests`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
        <PageCard title="Streak Analytics" description="Attendance, test, and coding streaks from the backend." icon={Flame}>
          <StreakCard streaks={state.streaks} />
        </PageCard>

        <PageCard title="Leaderboard / Rank Analytics" description="Current student rank and batch preview." icon={Medal}>
          <div className="mb-4 flex flex-wrap gap-2">
            <ToneBadge label={state.rank ? `Rank #${state.rank.rank}` : "Rank unavailable"} tone="yellow" />
            {state.coins ? <ToneBadge label={`${formatGamificationNumber(state.coins.availableCoins ?? state.coins.totalCoins)} coins`} tone="primary" /> : null}
          </div>
          {state.leaderboard.length ? (
            <LeaderboardTable entries={state.leaderboard} currentStudentId={state.rank?.studentId} compact />
          ) : (
            <GamificationEmptyState title="No leaderboard data" description="Leaderboard analytics will appear when rankings are returned." />
          )}
        </PageCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <PreviewList title="Active Challenges" emptyTitle="No active challenge data" items={challengeItems.slice(0, 3)} type="challenge" />
        <PreviewList title="Quest Progress" emptyTitle="No quest progress data" items={questItems.slice(0, 3)} type="quest" />
        <PreviewList title="Weak-topic Quests" emptyTitle="No weak-topic quests" items={weakTopicQuests.slice(0, 3)} type="quest" />
      </div>
    </section>
  );
}

function ProgressPanel({
  icon: Icon,
  meta,
  title,
  value,
}: {
  icon: LucideIcon;
  meta: string;
  title: string;
  value: number;
}) {
  return (
    <PageCard title={title} description={meta} icon={Icon}>
      <MiniProgress label={title} value={value} tone={value >= 80 ? "primary" : value >= 50 ? "yellow" : "orange"} />
    </PageCard>
  );
}

function PreviewList({
  emptyTitle,
  items,
  title,
  type,
}: {
  emptyTitle: string;
  items: Array<ChallengeCardItem | QuestCardItem>;
  title: string;
  type: "challenge" | "quest";
}) {
  return (
    <PageCard title={title} description="Live progress items from gamification APIs." icon={type === "challenge" ? Sparkles : Target}>
      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (type === "challenge" ? <ChallengeCard item={item} key={String(item.id)} /> : <QuestCard item={item} key={String(item.id)} />))
        ) : (
          <GamificationEmptyState title={emptyTitle} description="The backend returned no items for this area." />
        )}
      </div>
    </PageCard>
  );
}

function SectionHeading({ description, title }: { description: string; title: string }) {
  return (
    <div>
      <h2 className="text-[24px] font-extrabold leading-8 text-text-primary">{title}</h2>
      <p className="mt-1 max-w-3xl text-[14px] leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

function createXpTrend(xp: StudentXp | null) {
  return (xp?.history ?? [])
    .map((point, index) => ({
      label: point.label || point.date || `Point ${index + 1}`,
      xp: point.xp ?? point.value,
    }))
    .filter((point): point is { label: string; xp: number } => typeof point.xp === "number" && Number.isFinite(point.xp));
}

function createChallengeItems(challenges: GamificationChallenge[], progressItems: StudentChallengeProgress[]) {
  const challengeById = new Map(challenges.map((challenge) => [String(challenge.challengeId), challenge]));
  return progressItems.map((progress) => {
    const challenge = progress.challenge ?? challengeById.get(String(progress.challengeId));
    const target = progress.targetValue ?? challenge?.targetValue;
    return {
      coinReward: challenge?.coinReward,
      description: challenge?.description,
      id: progress.progressId ?? progress.challengeId,
      progress: readGamificationProgress(progress.progressPercentage) || calculateGamificationProgress(progress.currentValue, target),
      status: progress.status,
      subtitle: `${formatGamificationNumber(progress.currentValue)}/${target ? formatGamificationNumber(target) : "-"} progress`,
      title: challenge?.title ?? `Challenge ${progress.challengeId}`,
      xpReward: challenge?.xpReward,
    };
  });
}

function createQuestItems(quests: GamificationQuest[], progressItems: StudentQuestProgress[]) {
  const questById = new Map(quests.map((quest) => [String(quest.questId), quest]));
  return progressItems.map((progress) => {
    const quest = progress.quest ?? questById.get(String(progress.questId));
    const target = progress.targetValue ?? quest?.targetValue;
    const currentValue = progress.currentValue ?? 0;
    return {
      coinReward: quest?.coinReward,
      description: quest?.description,
      id: progress.progressId ?? progress.questId,
      progress: readGamificationProgress(progress.progressPercentage) || calculateGamificationProgress(currentValue, target),
      status: progress.status,
      subtitle: `${formatGamificationNumber(currentValue)}/${target ? formatGamificationNumber(target) : "-"} progress`,
      title: quest?.title ?? `Quest ${progress.questId}`,
      type: quest?.questType,
      xpReward: quest?.xpReward,
    };
  });
}

function isCompletedProgress(progress: { status: string }) {
  return progress.status === "COMPLETED" || progress.status === "CLAIMED";
}

function getFulfilledValue<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : null;
}
