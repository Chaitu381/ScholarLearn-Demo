export type GamificationId = number | string;

export type GamificationPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME";

export type GamificationScope = "BATCH" | "COURSE" | "INSTITUTE" | "GLOBAL";

export type GamificationLeaderboardType = "ATTENDANCE" | "CODING" | "IMPROVEMENT" | "OVERALL";

export type GamificationProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CLAIMED"
  | "EXPIRED"
  | "FAILED";

export type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type CoinTransactionType =
  | "EARNED"
  | "SPENT"
  | "REWARD"
  | "BONUS"
  | "ADJUSTMENT"
  | "REFUND";

export type RewardType = "BADGE" | "COINS" | "XP" | "CERTIFICATE" | "CUSTOM";

export type GamificationTrendPoint = {
  date?: string;
  label?: string;
  value?: number;
  xp?: number;
};

export type StudentXp = {
  currentLevelXp?: number;
  earnedThisMonth?: number;
  earnedThisWeek?: number;
  earnedToday?: number;
  history?: GamificationTrendPoint[];
  lifetimeXp?: number;
  studentId?: GamificationId;
  totalXp?: number;
  updatedAt?: string;
  xpToNextLevel?: number;
};

export type StudentLevel = {
  currentLevelXp?: number;
  level?: number;
  levelId?: GamificationId;
  levelName?: string;
  nextLevel?: number;
  nextLevelName?: string;
  nextLevelXp?: number;
  progressPercentage?: number;
  studentId?: GamificationId;
  totalXp?: number;
};

export type Badge = {
  active?: boolean;
  badgeId: GamificationId;
  category?: string;
  coinReward?: number;
  description?: string;
  iconUrl?: string;
  name: string;
  rarity?: BadgeRarity;
  xpReward?: number;
};

export type StudentBadge = {
  awardedAt?: string;
  badge?: Badge;
  badgeId: GamificationId;
  claimed?: boolean;
  claimedAt?: string;
  progressPercentage?: number;
  studentBadgeId?: GamificationId;
  studentId: GamificationId;
};

export type CoinBalance = {
  availableCoins?: number;
  lifetimeCoins?: number;
  pendingCoins?: number;
  spentCoins?: number;
  studentId?: GamificationId;
  totalCoins?: number;
  updatedAt?: string;
};

export type CoinTransaction = {
  amount: number;
  balanceAfter?: number;
  createdAt?: string;
  description?: string;
  referenceId?: GamificationId;
  referenceType?: string;
  studentId: GamificationId;
  transactionId: GamificationId;
  type: CoinTransactionType;
};

export type StudentStreak = {
  active?: boolean;
  currentCount: number;
  lastActivityDate?: string;
  longestCount?: number;
  period?: GamificationPeriod;
  streakId?: GamificationId;
  streakType?: string;
  studentId: GamificationId;
};

export type GamificationChallenge = {
  active?: boolean;
  badgeRewardId?: GamificationId;
  challengeId: GamificationId;
  challengeType?: string;
  coinReward?: number;
  description?: string;
  endsAt?: string;
  period: Exclude<GamificationPeriod, "ALL_TIME">;
  startsAt?: string;
  targetValue: number;
  title: string;
  xpReward?: number;
};

export type StudentChallengeProgress = {
  challenge?: GamificationChallenge;
  challengeId: GamificationId;
  completedAt?: string;
  currentValue: number;
  progressId?: GamificationId;
  progressPercentage?: number;
  status: GamificationProgressStatus;
  studentId: GamificationId;
  targetValue?: number;
};

export type GamificationQuest = {
  active?: boolean;
  badgeRewardId?: GamificationId;
  coinReward?: number;
  description?: string;
  endsAt?: string;
  questId: GamificationId;
  questType?: string;
  startsAt?: string;
  targetValue?: number;
  title: string;
  xpReward?: number;
};

export type StudentQuestProgress = {
  completedAt?: string;
  currentValue?: number;
  progressId?: GamificationId;
  progressPercentage?: number;
  quest?: GamificationQuest;
  questId: GamificationId;
  status: GamificationProgressStatus;
  studentId: GamificationId;
  targetValue?: number;
};

export type GamificationReward = {
  active?: boolean;
  costCoins?: number;
  description?: string;
  name: string;
  quantityAvailable?: number;
  rewardId: GamificationId;
  rewardType: RewardType;
};

export type GamificationLeaderboardEntry = {
  avatarUrl?: string;
  badgesCount?: number;
  batchId?: GamificationId;
  coins?: number;
  courseId?: GamificationId;
  instituteId?: GamificationId;
  level?: number;
  points?: number;
  rank: number;
  studentId: GamificationId;
  studentName: string;
  totalXp?: number;
};

export type RankPosition = {
  movement?: number;
  period?: GamificationPeriod;
  previousRank?: number;
  rank: number;
  scope?: GamificationScope;
  studentId?: GamificationId;
  totalParticipants?: number;
};

export type GamificationDashboardSummary = {
  activeChallenges?: StudentChallengeProgress[];
  activeQuests?: StudentQuestProgress[];
  badges?: StudentBadge[];
  coins?: CoinBalance;
  leaderboardPreview?: GamificationLeaderboardEntry[];
  level?: StudentLevel;
  rank?: RankPosition;
  rewards?: GamificationReward[];
  streaks?: StudentStreak[];
  studentId?: GamificationId;
  xp?: StudentXp;
};

export type LeaderboardQuery = {
  batchId?: GamificationId;
  courseId?: GamificationId;
  instituteId?: GamificationId;
  limit?: number;
  period?: GamificationPeriod;
  scope?: GamificationScope;
  type?: GamificationLeaderboardType;
};
