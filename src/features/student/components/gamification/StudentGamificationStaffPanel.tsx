import { useEffect, useMemo, useState } from "react";
import { Award, Coins, Flame, Medal, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import { cn } from "../../../../shared/utils/cn";
import { getStudentGamificationStaffFallback } from "../../data/studentGamificationFallbackData";
import {
  getStudentGamificationApiErrorMessage,
  studentGamificationApi,
} from "../../services/studentGamificationApi";
import type {
  CoinBalance,
  CoinTransaction,
  RankPosition,
  StudentBadge,
  StudentChallengeProgress,
  StudentLevel,
  StudentQuestProgress,
  StudentStreak,
  StudentXp,
} from "../../types/gamification.types";
import {
  calculateGamificationProgress,
  findGamificationStreak,
  formatGamificationDate,
  formatGamificationLevel,
  formatGamificationNumber,
  formatGamificationStreak,
  getGamificationStatusStyle,
  getGamificationTime,
  readGamificationProgress,
} from "./gamificationUtils";

type StaffPanelVariant = "dark" | "light";

type StaffGamificationState = {
  badges: StudentBadge[];
  challengeProgress: StudentChallengeProgress[];
  coins: CoinBalance | null;
  coinTransactions: CoinTransaction[];
  error: string;
  level: StudentLevel | null;
  loading: boolean;
  monthlyRank: RankPosition | null;
  questProgress: StudentQuestProgress[];
  rank: RankPosition | null;
  streaks: StudentStreak[];
  weeklyRank: RankPosition | null;
  xp: StudentXp | null;
};

const initialState: StaffGamificationState = {
  badges: [],
  challengeProgress: [],
  coins: null,
  coinTransactions: [],
  error: "",
  level: null,
  loading: true,
  monthlyRank: null,
  questProgress: [],
  rank: null,
  streaks: [],
  weeklyRank: null,
  xp: null,
};

export function StudentGamificationStaffPanel({
  studentId,
  variant = "light",
}: {
  studentId?: string;
  variant?: StaffPanelVariant;
}) {
  const [state, setState] = useState<StaffGamificationState>(initialState);
  const styles = getVariantStyles(variant);

  useEffect(() => {
    let active = true;

    if (!studentId) {
      setState({
        ...initialState,
        error: "Student id is unavailable for gamification lookup.",
        loading: false,
      });
      return () => {
        active = false;
      };
    }

    async function loadGamification() {
      setState((current) => ({ ...current, error: "", loading: true }));

      const [
        xpResult,
        levelResult,
        coinsResult,
        coinTransactionsResult,
        streaksResult,
        badgesResult,
        challengeProgressResult,
        questProgressResult,
        rankResult,
        weeklyRankResult,
        monthlyRankResult,
      ] = await Promise.allSettled([
        studentGamificationApi.getStudentXp(studentId),
        studentGamificationApi.getStudentLevel(studentId),
        studentGamificationApi.getStudentCoins(studentId),
        studentGamificationApi.getStudentCoinTransactions(studentId),
        studentGamificationApi.getStudentStreaks(studentId),
        studentGamificationApi.getStudentBadges(studentId),
        studentGamificationApi.getStudentChallengeProgress(studentId),
        studentGamificationApi.getStudentQuestProgress(studentId),
        studentGamificationApi.getRankPosition(studentId, { scope: "BATCH" }),
        studentGamificationApi.getRankPosition(studentId, { period: "WEEKLY", scope: "BATCH" }),
        studentGamificationApi.getRankPosition(studentId, { period: "MONTHLY", scope: "BATCH" }),
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
        badgesResult,
        challengeProgressResult,
        questProgressResult,
        rankResult,
        weeklyRankResult,
        monthlyRankResult,
      ];
      const rejectedResults = results.filter((result) => result.status === "rejected");
      const firstRejected = rejectedResults[0] as PromiseRejectedResult | undefined;

      setState({
        badges: getFulfilledValue(badgesResult) ?? [],
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
        monthlyRank: getFulfilledValue(monthlyRankResult),
        questProgress: getFulfilledValue(questProgressResult) ?? [],
        rank: getFulfilledValue(rankResult),
        streaks: getFulfilledValue(streaksResult) ?? [],
        weeklyRank: getFulfilledValue(weeklyRankResult),
        xp: getFulfilledValue(xpResult),
      });
    }

    void loadGamification();

    return () => {
      active = false;
    };
  }, [studentId]);

  const displayState = useMemo(() => mergeGamificationFallback(state, studentId), [state, studentId]);
  const latestBadges = useMemo(() => getLatestBadges(displayState.badges), [displayState.badges]);
  const challengeItems = useMemo(() => displayState.challengeProgress.slice(0, 4), [displayState.challengeProgress]);
  const questItems = useMemo(() => displayState.questProgress.slice(0, 4), [displayState.questProgress]);
  const challengeSummary = useMemo(
    () => getChallengeSummary(displayState.challengeProgress, displayState.questProgress),
    [displayState.challengeProgress, displayState.questProgress],
  );

  if (state.loading) {
    return <StaffGamificationSkeleton styles={styles} />;
  }

  return (
    <section className={styles.panel}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={styles.title}>Gamification</h3>
          <p className={styles.subtitle}>XP, level, ranks, badges, streaks, challenges, quests, and coins. Missing API data is filled with demo progress.</p>
        </div>
        {state.error ? <span className={styles.warning}>{state.error}</span> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StaffMetric icon={Zap} label="XP" value={formatGamificationNumber(displayState.xp?.totalXp ?? displayState.xp?.lifetimeXp)} helper="Total XP points" styles={styles} />
        <StaffMetric icon={Star} label="Level" value={formatGamificationLevel(displayState.level)} helper={displayState.level?.level ? `Level ${displayState.level.level}` : "Current level"} styles={styles} />
        <StaffMetric icon={Coins} label="Coins" value={formatGamificationNumber(displayState.coins?.availableCoins ?? displayState.coins?.totalCoins)} helper="Available balance" styles={styles} />
        <StaffMetric icon={Flame} label="Current streak" value={formatCurrentStreak(displayState.streaks)} helper="Best active streak" styles={styles} />
        <StaffMetric icon={Award} label="Badges" value={formatGamificationNumber(displayState.badges.length)} helper="Badges earned" styles={styles} />
        <StaffMetric icon={Medal} label="Weekly rank" value={displayState.weeklyRank ? `#${displayState.weeklyRank.rank}` : "-"} helper={formatRankHelper(displayState.weeklyRank)} styles={styles} />
        <StaffMetric icon={Trophy} label="Monthly rank" value={displayState.monthlyRank ? `#${displayState.monthlyRank.rank}` : "-"} helper={formatRankHelper(displayState.monthlyRank)} styles={styles} />
        <StaffMetric icon={Sparkles} label="Challenges" value={`${challengeSummary.completed} done / ${challengeSummary.pending} open`} helper="Completed / pending" styles={styles} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={styles.innerPanel}>
          <SectionTitle icon={Flame} title="Streaks" styles={styles} />
          <div className="mt-3 grid gap-2">
            <MiniRow label="Attendance" value={formatGamificationStreak(findGamificationStreak(displayState.streaks, "ATTENDANCE"))} styles={styles} />
            <MiniRow label="Coding" value={formatGamificationStreak(findGamificationStreak(displayState.streaks, "CODING"))} styles={styles} />
            <MiniRow label="Test" value={formatGamificationStreak(findGamificationStreak(displayState.streaks, "TEST"))} styles={styles} />
          </div>
        </section>

        <section className={styles.innerPanel}>
          <SectionTitle icon={Award} title="Badges earned" styles={styles} />
          <div className="mt-3 space-y-2">
            {latestBadges.length ? (
              latestBadges.map((badge) => (
                <MiniRow
                  key={String(badge.studentBadgeId ?? `${badge.badgeId}-${badge.awardedAt ?? "badge"}`)}
                  label={badge.badge?.name ?? `Badge ${badge.badgeId}`}
                  value={badge.awardedAt ? formatGamificationDate(badge.awardedAt) : "Earned"}
                  styles={styles}
                />
              ))
            ) : (
              <EmptyLine text="No badges returned." styles={styles} />
            )}
          </div>
        </section>

        <section className={styles.innerPanel}>
          <SectionTitle icon={Sparkles} title="Challenge progress" styles={styles} />
          <div className="mt-3 space-y-3">
            {challengeItems.length ? (
              challengeItems.map((challenge) => (
                <ProgressItem
                  key={String(challenge.progressId ?? challenge.challengeId)}
                  progress={readGamificationProgress(challenge.progressPercentage) || calculateGamificationProgress(challenge.currentValue, challenge.targetValue ?? challenge.challenge?.targetValue)}
                  status={challenge.status}
                  title={challenge.challenge?.title ?? `Challenge ${challenge.challengeId}`}
                  styles={styles}
                />
              ))
            ) : (
              <EmptyLine text="No challenge progress returned." styles={styles} />
            )}
          </div>
        </section>

        <section className={styles.innerPanel}>
          <SectionTitle icon={Trophy} title="Quest progress" styles={styles} />
          <div className="mt-3 space-y-3">
            {questItems.length ? (
              questItems.map((quest) => (
                <ProgressItem
                  key={String(quest.progressId ?? quest.questId)}
                  progress={readGamificationProgress(quest.progressPercentage) || calculateGamificationProgress(quest.currentValue, quest.targetValue ?? quest.quest?.targetValue)}
                  status={quest.status}
                  title={quest.quest?.title ?? `Quest ${quest.questId}`}
                  styles={styles}
                />
              ))
            ) : (
              <EmptyLine text="No quest progress returned." styles={styles} />
            )}
          </div>
        </section>
      </div>

      <section className={cn(styles.innerPanel, "mt-4")}>
        <SectionTitle icon={Coins} title="Recent gamification activity" styles={styles} />
        <RecentActivityTable transactions={displayState.coinTransactions.slice(0, 5)} styles={styles} />
      </section>
    </section>
  );
}

function StaffMetric({
  helper,
  icon: Icon,
  label,
  styles,
  value,
}: {
  helper: string;
  icon: typeof Zap;
  label: string;
  styles: VariantStyles;
  value: string;
}) {
  return (
    <article className={styles.metric}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={styles.metricLabel}>{label}</p>
          <p className={styles.metricValue}>{value}</p>
          <p className={styles.metricHelper}>{helper}</p>
        </div>
        <span className={styles.iconWrap}>
          <Icon aria-hidden="true" size={20} strokeWidth={2.5} />
        </span>
      </div>
    </article>
  );
}

function ProgressItem({
  progress,
  status,
  styles,
  title,
}: {
  progress: number;
  status: StudentChallengeProgress["status"];
  styles: VariantStyles;
  title: string;
}) {
  const statusStyle = getGamificationStatusStyle(status);

  return (
    <article className={styles.progressItem}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className={styles.rowLabel}>{title}</p>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold", statusStyle.className)}>
          {statusStyle.label}
        </span>
      </div>
      <ProgressBar value={progress} tone={statusStyle.tone} showValue />
    </article>
  );
}

function MiniRow({ label, styles, value }: { label: string; styles: VariantStyles; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}

function RecentActivityTable({
  styles,
  transactions,
}: {
  styles: VariantStyles;
  transactions: CoinTransaction[];
}) {
  if (!transactions.length) {
    return <EmptyLine text="No recent gamification activity returned." styles={styles} />;
  }

  return (
    <div className={styles.activityTable}>
      <div className={styles.activityHeader}>
        <span>Activity</span>
        <span>Reward</span>
        <span>Date</span>
      </div>
      {transactions.map((transaction) => (
        <div key={String(transaction.transactionId)} className={styles.activityRow}>
          <span className={styles.rowLabel}>{transaction.description || transaction.type}</span>
          <span className={styles.rowValue}>
            {transaction.amount >= 0 ? "+" : "-"}
            {formatGamificationNumber(Math.abs(transaction.amount))} coins
          </span>
          <span className={styles.activityDate}>
            {transaction.createdAt ? formatGamificationDate(transaction.createdAt, false) : "Recent"}
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ icon: Icon, styles, title }: { icon: typeof Award; styles: VariantStyles; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon aria-hidden="true" className={styles.sectionIcon} size={18} strokeWidth={2.5} />
      <h4 className={styles.sectionTitle}>{title}</h4>
    </div>
  );
}

function EmptyLine({ styles, text }: { styles: VariantStyles; text: string }) {
  return <p className={styles.emptyText}>{text}</p>;
}

function StaffGamificationSkeleton({ styles }: { styles: VariantStyles }) {
  return (
    <section className={styles.panel}>
      <div className="h-5 w-40 animate-pulse rounded-full bg-current opacity-10" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.metric}>
            <div className="h-4 w-20 animate-pulse rounded-full bg-current opacity-10" />
            <div className="mt-4 h-7 w-24 animate-pulse rounded-full bg-current opacity-10" />
            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-current opacity-10" />
          </div>
        ))}
      </div>
    </section>
  );
}

function getLatestBadges(badges: StudentBadge[]) {
  return [...badges]
    .sort((first, second) => getGamificationTime(second.awardedAt) - getGamificationTime(first.awardedAt))
    .slice(0, 4);
}

function mergeGamificationFallback(state: StaffGamificationState, studentId?: string): StaffGamificationState {
  const fallback = getStudentGamificationStaffFallback(studentId);

  return {
    ...state,
    badges: state.badges.length ? state.badges : fallback.badges,
    challengeProgress: state.challengeProgress.length ? state.challengeProgress : fallback.challengeProgress,
    coins: state.coins ?? fallback.coins,
    coinTransactions: state.coinTransactions.length ? state.coinTransactions : fallback.coinTransactions,
    level: state.level ?? fallback.level,
    monthlyRank: state.monthlyRank ?? fallback.monthlyRank,
    questProgress: state.questProgress.length ? state.questProgress : fallback.questProgress,
    rank: state.rank ?? fallback.rank,
    streaks: state.streaks.length ? state.streaks : fallback.streaks,
    weeklyRank: state.weeklyRank ?? fallback.weeklyRank,
    xp: state.xp ?? fallback.xp,
  };
}

function formatCurrentStreak(streaks: StudentStreak[]) {
  const currentStreak = streaks.reduce((longest, streak) => Math.max(longest, streak.currentCount), 0);
  return currentStreak ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}` : "-";
}

function formatRankHelper(rank: RankPosition | null) {
  return rank?.totalParticipants ? `of ${rank.totalParticipants}` : "Batch rank";
}

function getChallengeSummary(challenges: StudentChallengeProgress[], quests: StudentQuestProgress[]) {
  const items = [...challenges, ...quests];
  const completed = items.filter((item) => item.status === "COMPLETED" || item.status === "CLAIMED").length;
  const pending = items.filter((item) => item.status !== "COMPLETED" && item.status !== "CLAIMED" && item.status !== "EXPIRED" && item.status !== "FAILED").length;

  return { completed, pending };
}

function getFulfilledValue<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : null;
}

type VariantStyles = ReturnType<typeof getVariantStyles>;

function getVariantStyles(variant: StaffPanelVariant) {
  if (variant === "dark") {
    return {
      activityDate: "text-left text-[12px] font-bold text-slate-400 sm:text-right",
      activityHeader: "hidden grid-cols-[minmax(0,1fr)_110px_100px] gap-3 border-b border-white/10 px-3 py-2 text-[11px] font-extrabold uppercase text-slate-500 sm:grid",
      activityRow: "grid gap-1.5 border-b border-white/10 px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_110px_100px] sm:items-center sm:gap-3",
      activityTable: "mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055]",
      emptyText: "text-[13px] font-semibold text-slate-400",
      iconWrap: "grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200",
      innerPanel: "rounded-2xl border border-white/10 bg-white/[0.055] p-4",
      metric: "rounded-2xl border border-white/10 bg-white/[0.055] p-4",
      metricHelper: "mt-2 text-[12px] font-semibold text-slate-400",
      metricLabel: "text-[11px] font-extrabold uppercase text-slate-500",
      metricValue: "mt-2 text-[24px] font-extrabold text-white",
      panel: "rounded-[28px] border border-white/10 bg-white/[0.065] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-6",
      progressItem: "rounded-2xl bg-white/[0.055] p-3",
      row: "flex items-center justify-between gap-3 rounded-2xl bg-white/[0.055] px-3 py-2",
      rowLabel: "text-[13px] font-bold text-slate-300",
      rowValue: "text-right text-[13px] font-extrabold text-white",
      sectionIcon: "text-cyan-200",
      sectionTitle: "text-[15px] font-extrabold text-white",
      subtitle: "mt-1 text-[14px] leading-6 text-slate-400",
      title: "text-[21px] font-extrabold text-white",
      warning: "rounded-full bg-yellow-300/10 px-3 py-1.5 text-[12px] font-extrabold text-yellow-100",
    };
  }

  return {
    activityDate: "text-left text-[12px] font-bold text-text-secondary sm:text-right",
    activityHeader: "hidden grid-cols-[minmax(0,1fr)_110px_100px] gap-3 border-b border-border px-3 py-2 text-[11px] font-extrabold uppercase text-text-muted sm:grid",
    activityRow: "grid gap-1.5 border-b border-border px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_110px_100px] sm:items-center sm:gap-3",
    activityTable: "mt-3 overflow-hidden rounded-2xl border border-border bg-surface",
    emptyText: "text-[13px] font-semibold text-text-secondary",
    iconWrap: "grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark",
    innerPanel: "rounded-2xl border border-border bg-surface-soft p-4",
    metric: "rounded-2xl border border-border bg-surface-soft p-4",
    metricHelper: "mt-2 text-[12px] font-semibold text-text-secondary",
    metricLabel: "text-[11px] font-extrabold uppercase text-text-muted",
    metricValue: "mt-2 text-[24px] font-extrabold text-text-primary",
    panel: "rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6",
    progressItem: "rounded-2xl bg-surface p-3",
    row: "flex items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-2",
    rowLabel: "text-[13px] font-bold text-text-secondary",
    rowValue: "text-right text-[13px] font-extrabold text-text-primary",
    sectionIcon: "text-primary-dark",
    sectionTitle: "text-[15px] font-extrabold text-text-primary",
    subtitle: "mt-1 text-[14px] leading-6 text-text-secondary",
    title: "text-[21px] font-extrabold text-text-primary",
    warning: "rounded-full bg-yellow-soft px-3 py-1.5 text-[12px] font-extrabold text-text-primary",
  };
}
