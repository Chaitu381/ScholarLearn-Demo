import { getAuthSession } from "../../../lib/authSession";
import { StudentApiError, studentApiRequest } from "./studentApi";
import type {
  Badge,
  BadgeRarity,
  CoinBalance,
  CoinTransaction,
  CoinTransactionType,
  GamificationChallenge,
  GamificationDashboardSummary,
  GamificationId,
  GamificationLeaderboardEntry,
  GamificationPeriod,
  GamificationProgressStatus,
  GamificationQuest,
  GamificationReward,
  LeaderboardQuery,
  RankPosition,
  RewardType,
  StudentBadge,
  StudentChallengeProgress,
  StudentLevel,
  StudentQuestProgress,
  StudentStreak,
  StudentXp,
} from "../types/gamification.types";

type ApiRecord = Record<string, unknown>;
type QueryValue = boolean | GamificationId | null | undefined;

// TODO(gamification-api): Confirm these paths and leaderboard query keys against the Spring Boot gamification controller mappings.
// The frontend keeps them centralized here so route adjustments do not leak into UI code.
const gamificationEndpoints = {
  badges: "/gamification/badges",
  challenges: "/gamification/challenges",
  dashboardSummary: (studentId: string) => `/gamification/students/${studentId}/dashboard-summary`,
  leaderboards: "/gamification/leaderboards",
  quests: "/gamification/quests",
  rewards: "/gamification/rewards",
  studentBadges: (studentId: string) => `/gamification/students/${studentId}/badges`,
  studentChallengeProgress: (studentId: string) => `/gamification/students/${studentId}/challenge-progress`,
  studentCoins: (studentId: string) => `/gamification/students/${studentId}/coins`,
  studentCoinTransactions: (studentId: string) => `/gamification/students/${studentId}/coin-transactions`,
  studentLevel: (studentId: string) => `/gamification/students/${studentId}/level`,
  studentQuestProgress: (studentId: string) => `/gamification/students/${studentId}/quest-progress`,
  studentRank: (studentId: string) => `/gamification/students/${studentId}/rank`,
  studentStreaks: (studentId: string) => `/gamification/students/${studentId}/streaks`,
  studentXp: (studentId: string) => `/gamification/students/${studentId}/xp`,
};

export function getStudentGamificationApiErrorMessage(error: unknown) {
  if (error instanceof StudentApiError) {
    return error.message;
  }

  return error instanceof Error ? error.message : "Unable to load gamification data. Please try again.";
}

export const studentGamificationApi = {
  getBadges() {
    return requestArray(gamificationEndpoints.badges, normalizeBadge);
  },
  getChallenges(period?: Exclude<GamificationPeriod, "ALL_TIME">) {
    return requestArray(withQuery(gamificationEndpoints.challenges, { period }), normalizeChallenge);
  },
  getGamificationDashboardSummary(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestNullable(gamificationEndpoints.dashboardSummary(resolvedStudentId), normalizeDashboardSummary);
  },
  getLeaderboards(query: LeaderboardQuery = {}) {
    return requestArray(withQuery(gamificationEndpoints.leaderboards, { ...query }), normalizeLeaderboardEntry);
  },
  getQuests() {
    return requestArray(gamificationEndpoints.quests, normalizeQuest);
  },
  getRankPosition(studentId?: GamificationId, query: Pick<LeaderboardQuery, "period" | "scope"> = {}) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestNullable(withQuery(gamificationEndpoints.studentRank(resolvedStudentId), { ...query }), normalizeRankPosition);
  },
  getRewards() {
    return requestArray(gamificationEndpoints.rewards, normalizeReward);
  },
  getStudentBadges(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestArray(gamificationEndpoints.studentBadges(resolvedStudentId), normalizeStudentBadge);
  },
  getStudentChallengeProgress(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestArray(gamificationEndpoints.studentChallengeProgress(resolvedStudentId), normalizeChallengeProgress);
  },
  getStudentCoins(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestNullable(gamificationEndpoints.studentCoins(resolvedStudentId), normalizeCoinBalance);
  },
  getStudentCoinTransactions(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestArray(gamificationEndpoints.studentCoinTransactions(resolvedStudentId), normalizeCoinTransaction);
  },
  async getStudentGamificationOverview(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    const [badges, challengeProgress, coins, level, questProgress, rank, streaks, xp] = await Promise.all([
      studentGamificationApi.getStudentBadges(resolvedStudentId),
      studentGamificationApi.getStudentChallengeProgress(resolvedStudentId),
      studentGamificationApi.getStudentCoins(resolvedStudentId),
      studentGamificationApi.getStudentLevel(resolvedStudentId),
      studentGamificationApi.getStudentQuestProgress(resolvedStudentId),
      studentGamificationApi.getRankPosition(resolvedStudentId),
      studentGamificationApi.getStudentStreaks(resolvedStudentId),
      studentGamificationApi.getStudentXp(resolvedStudentId),
    ]);

    return {
      badges,
      challengeProgress,
      coins,
      level,
      questProgress,
      rank,
      streaks,
      xp,
    };
  },
  getStudentLevel(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestNullable(gamificationEndpoints.studentLevel(resolvedStudentId), normalizeStudentLevel);
  },
  getStudentQuestProgress(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestArray(gamificationEndpoints.studentQuestProgress(resolvedStudentId), normalizeQuestProgress);
  },
  getStudentStreaks(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestArray(gamificationEndpoints.studentStreaks(resolvedStudentId), normalizeStudentStreak);
  },
  getStudentXp(studentId?: GamificationId) {
    const resolvedStudentId = resolveStudentId(studentId);
    return requestNullable(gamificationEndpoints.studentXp(resolvedStudentId), normalizeStudentXp);
  },
};

async function requestArray<TItem>(endpoint: string, normalizeItem: (value: unknown) => TItem | null) {
  const rawResponse = await studentApiRequest<unknown>(endpoint);
  return readArrayPayload(rawResponse).map(normalizeItem).filter(isPresent);
}

async function requestNullable<TItem>(endpoint: string, normalizeItem: (value: unknown) => TItem | null) {
  const rawResponse = await studentApiRequest<unknown>(endpoint);
  return normalizeItem(readObjectPayload(rawResponse) ?? rawResponse);
}

function normalizeStudentXp(value: unknown): StudentXp | null {
  const record = readObjectPayload(value);
  if (!record) return null;

  return {
    currentLevelXp: readNumber(record, ["currentLevelXp", "levelXp", "xpInCurrentLevel"]),
    earnedThisMonth: readNumber(record, ["earnedThisMonth", "monthlyXp", "xpThisMonth"]),
    earnedThisWeek: readNumber(record, ["earnedThisWeek", "weeklyXp", "xpThisWeek"]),
    earnedToday: readNumber(record, ["earnedToday", "dailyXp", "xpToday"]),
    history: readArrayPayload(record.history ?? record.xpHistory ?? record.trend ?? record.xpTrend).map(normalizeTrendPoint).filter(isPresent),
    lifetimeXp: readNumber(record, ["lifetimeXp", "totalLifetimeXp", "allTimeXp"]),
    studentId: readId(record, ["studentId", "student_id", "userId", "id"]),
    totalXp: readNumber(record, ["totalXp", "currentXp", "xp", "points", "score", "lifetimeXp"]),
    updatedAt: readString(record, ["updatedAt", "lastUpdated", "modifiedAt"]),
    xpToNextLevel: readNumber(record, ["xpToNextLevel", "nextLevelXp", "remainingXp"]),
  };
}

function normalizeStudentLevel(value: unknown): StudentLevel | null {
  const record = readObjectPayload(value);
  if (!record) return null;

  return {
    currentLevelXp: readNumber(record, ["currentLevelXp", "levelXp", "xpInCurrentLevel"]),
    level: readNumber(record, ["level", "currentLevel", "levelNumber"]),
    levelId: readId(record, ["levelId", "id"]),
    levelName: readString(record, ["levelName", "currentLevelName", "name", "title"]),
    nextLevel: readNumber(record, ["nextLevel", "nextLevelNumber"]),
    nextLevelName: readString(record, ["nextLevelName"]),
    nextLevelXp: readNumber(record, ["nextLevelXp", "xpForNextLevel", "xpToNextLevel"]),
    progressPercentage: readNumber(record, ["progressPercentage", "progress", "levelProgress", "percentage"]),
    studentId: readId(record, ["studentId", "student_id", "userId"]),
    totalXp: readNumber(record, ["totalXp", "currentXp", "xp", "points"]),
  };
}

function normalizeBadge(value: unknown): Badge | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const badgeId = readId(record, ["badgeId", "id"]);

  if (!badgeId && !readString(record, ["name", "badgeName", "title"])) {
    return null;
  }

  return {
    active: readBoolean(record, ["active", "enabled"]),
    badgeId,
    category: readString(record, ["category", "badgeCategory"]),
    coinReward: readNumber(record, ["coinReward", "coins", "rewardCoins"]),
    description: readString(record, ["description", "badgeDescription"]),
    iconUrl: readString(record, ["iconUrl", "icon", "imageUrl"]),
    name: readString(record, ["name", "badgeName", "title"]) || `Badge ${badgeId}`,
    rarity: normalizeBadgeRarity(readString(record, ["rarity"])),
    xpReward: readNumber(record, ["xpReward", "xp", "rewardXp"]),
  };
}

function normalizeStudentBadge(value: unknown): StudentBadge | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const nestedBadge = normalizeBadge(record.badge);
  const badgeId = readId(record, ["badgeId", "badge_id"]) || nestedBadge?.badgeId || readId(record, ["id"]);

  if (!badgeId) {
    return null;
  }

  return {
    awardedAt: readString(record, ["awardedAt", "earnedAt", "createdAt"]),
    badge: nestedBadge ?? normalizeBadge(record) ?? undefined,
    badgeId,
    claimed: readBoolean(record, ["claimed", "isClaimed"]),
    claimedAt: readString(record, ["claimedAt"]),
    progressPercentage: readNumber(record, ["progressPercentage", "progress"]),
    studentBadgeId: readId(record, ["studentBadgeId", "id"]),
    studentId: readId(record, ["studentId", "student_id", "userId"]),
  };
}

function normalizeCoinBalance(value: unknown): CoinBalance | null {
  const record = readObjectPayload(value);
  if (!record) return null;

  return {
    availableCoins: readNumber(record, ["availableCoins", "currentCoins", "coins", "balance"]),
    lifetimeCoins: readNumber(record, ["lifetimeCoins", "totalEarnedCoins"]),
    pendingCoins: readNumber(record, ["pendingCoins"]),
    spentCoins: readNumber(record, ["spentCoins", "totalSpentCoins"]),
    studentId: readId(record, ["studentId", "student_id", "userId"]),
    totalCoins: readNumber(record, ["totalCoins", "coins", "lifetimeCoins", "balance"]),
    updatedAt: readString(record, ["updatedAt", "lastUpdated", "modifiedAt"]),
  };
}

function normalizeCoinTransaction(value: unknown): CoinTransaction | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const amount = readNumber(record, ["amount", "coins", "value"]);
  const transactionId = readId(record, ["transactionId", "coinTransactionId", "id"]);

  if (amount === undefined && !transactionId) {
    return null;
  }

  return {
    amount: amount ?? 0,
    balanceAfter: readNumber(record, ["balanceAfter", "newBalance"]),
    createdAt: readString(record, ["createdAt", "transactionAt", "date"]),
    description: readString(record, ["description", "reason", "note"]),
    referenceId: readId(record, ["referenceId"]),
    referenceType: readString(record, ["referenceType"]),
    studentId: readId(record, ["studentId", "student_id", "userId"]),
    transactionId,
    type: normalizeCoinTransactionType(readString(record, ["type", "transactionType"])),
  };
}

function normalizeStudentStreak(value: unknown): StudentStreak | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const streakType = readString(record, ["streakType", "type", "name", "category"]);
  const currentCount = readNumber(record, ["currentCount", "currentStreak", "count", "streak", "current"]);

  if (!streakType && currentCount === undefined) {
    return null;
  }

  return {
    active: readBoolean(record, ["active", "isActive"]),
    currentCount: currentCount ?? 0,
    lastActivityDate: readString(record, ["lastActivityDate", "lastActivityAt", "updatedAt"]),
    longestCount: readNumber(record, ["longestCount", "bestStreak", "longestStreak", "bestCount"]),
    period: normalizePeriod(readString(record, ["period"])),
    streakId: readId(record, ["streakId", "id"]),
    streakType,
    studentId: readId(record, ["studentId", "student_id", "userId"]),
  };
}

function normalizeChallenge(value: unknown): GamificationChallenge | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const challengeId = readId(record, ["challengeId", "id"]);
  const title = readString(record, ["title", "name", "challengeName"]);

  if (!challengeId && !title) {
    return null;
  }

  return {
    active: readBoolean(record, ["active", "enabled"]),
    badgeRewardId: readId(record, ["badgeRewardId"]),
    challengeId,
    challengeType: readString(record, ["challengeType", "type"]),
    coinReward: readNumber(record, ["coinReward", "coins", "rewardCoins"]),
    description: readString(record, ["description"]),
    endsAt: readString(record, ["endsAt", "endDate", "expiresAt"]),
    period: normalizeChallengePeriod(readString(record, ["period", "frequency"])),
    startsAt: readString(record, ["startsAt", "startDate"]),
    targetValue: readNumber(record, ["targetValue", "target", "goal"]) ?? 0,
    title: title || `Challenge ${challengeId}`,
    xpReward: readNumber(record, ["xpReward", "xp", "rewardXp"]),
  };
}

function normalizeChallengeProgress(value: unknown): StudentChallengeProgress | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const challenge = normalizeChallenge(record.challenge) ?? normalizeChallenge(record);
  const challengeId = readId(record, ["challengeId", "challenge_id"]) || challenge?.challengeId;

  if (!challengeId) {
    return null;
  }

  return {
    challenge: challenge ?? undefined,
    challengeId,
    completedAt: readString(record, ["completedAt"]),
    currentValue: readNumber(record, ["currentValue", "current", "progressValue", "value"]) ?? 0,
    progressId: readId(record, ["progressId", "studentChallengeProgressId", "id"]),
    progressPercentage: readNumber(record, ["progressPercentage", "progress", "percentage"]),
    status: normalizeProgressStatus(readString(record, ["status", "progressStatus"])),
    studentId: readId(record, ["studentId", "student_id", "userId"]),
    targetValue: readNumber(record, ["targetValue", "target", "goal"]) ?? challenge?.targetValue,
  };
}

function normalizeQuest(value: unknown): GamificationQuest | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const questId = readId(record, ["questId", "id"]);
  const title = readString(record, ["title", "name", "questName"]);

  if (!questId && !title) {
    return null;
  }

  return {
    active: readBoolean(record, ["active", "enabled"]),
    badgeRewardId: readId(record, ["badgeRewardId"]),
    coinReward: readNumber(record, ["coinReward", "coins", "rewardCoins"]),
    description: readString(record, ["description"]),
    endsAt: readString(record, ["endsAt", "endDate", "expiresAt"]),
    questId,
    questType: readString(record, ["questType", "type"]),
    startsAt: readString(record, ["startsAt", "startDate"]),
    targetValue: readNumber(record, ["targetValue", "target", "goal"]),
    title: title || `Quest ${questId}`,
    xpReward: readNumber(record, ["xpReward", "xp", "rewardXp"]),
  };
}

function normalizeQuestProgress(value: unknown): StudentQuestProgress | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const quest = normalizeQuest(record.quest) ?? normalizeQuest(record);
  const questId = readId(record, ["questId", "quest_id"]) || quest?.questId;

  if (!questId) {
    return null;
  }

  return {
    completedAt: readString(record, ["completedAt"]),
    currentValue: readNumber(record, ["currentValue", "current", "progressValue", "value"]),
    progressId: readId(record, ["progressId", "studentQuestProgressId", "id"]),
    progressPercentage: readNumber(record, ["progressPercentage", "progress", "percentage"]),
    quest: quest ?? undefined,
    questId,
    status: normalizeProgressStatus(readString(record, ["status", "progressStatus"])),
    studentId: readId(record, ["studentId", "student_id", "userId"]),
    targetValue: readNumber(record, ["targetValue", "target", "goal"]) ?? quest?.targetValue,
  };
}

function normalizeReward(value: unknown): GamificationReward | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const rewardId = readId(record, ["rewardId", "id"]);
  const name = readString(record, ["name", "title"]);

  if (!rewardId && !name) {
    return null;
  }

  return {
    active: readBoolean(record, ["active", "enabled"]),
    costCoins: readNumber(record, ["costCoins", "coinCost", "cost"]),
    description: readString(record, ["description"]),
    name: name || `Reward ${rewardId}`,
    quantityAvailable: readNumber(record, ["quantityAvailable", "availableQuantity"]),
    rewardId,
    rewardType: normalizeRewardType(readString(record, ["rewardType", "type"])),
  };
}

function normalizeLeaderboardEntry(value: unknown): GamificationLeaderboardEntry | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const rank = readNumber(record, ["rank", "position", "rankPosition"]);
  const studentName = readString(record, ["studentName", "fullName", "name", "displayName"]);
  const studentId = readId(record, ["studentId", "student_id", "userId", "id"]);

  if (rank === undefined && !studentName && !studentId) {
    return null;
  }

  return {
    avatarUrl: readString(record, ["avatarUrl", "profilePicture", "profilePictureUrl", "imageUrl"]),
    badgesCount: readNumber(record, ["badgesCount", "badgeCount", "badges"]),
    batchId: readId(record, ["batchId"]),
    coins: readNumber(record, ["coins", "coinBalance", "availableCoins"]),
    courseId: readId(record, ["courseId"]),
    instituteId: readId(record, ["instituteId"]),
    level: readNumber(record, ["level", "currentLevel", "levelNumber"]),
    points: readNumber(record, ["points", "score"]),
    rank: rank ?? 0,
    studentId,
    studentName: studentName || "Student",
    totalXp: readNumber(record, ["totalXp", "xp", "currentXp", "points"]),
  };
}

function normalizeRankPosition(value: unknown): RankPosition | null {
  const record = readObjectPayload(value);
  if (!record) return null;
  const rank = readNumber(record, ["rank", "currentRank", "position", "rankPosition"]);

  if (rank === undefined) {
    return null;
  }

  return {
    movement: readNumber(record, ["movement", "rankMovement", "improvement"]),
    period: normalizePeriod(readString(record, ["period"])),
    previousRank: readNumber(record, ["previousRank", "lastRank"]),
    rank,
    scope: normalizeScope(readString(record, ["scope"])),
    studentId: readId(record, ["studentId", "student_id", "userId"]),
    totalParticipants: readNumber(record, ["totalParticipants", "totalStudents", "participants"]),
  };
}

function normalizeDashboardSummary(value: unknown): GamificationDashboardSummary | null {
  const record = readObjectPayload(value);
  if (!record) return null;

  return {
    activeChallenges: readArrayPayload(record.activeChallenges ?? record.challenges).map(normalizeChallengeProgress).filter(isPresent),
    activeQuests: readArrayPayload(record.activeQuests ?? record.quests).map(normalizeQuestProgress).filter(isPresent),
    badges: readArrayPayload(record.badges ?? record.latestBadges).map(normalizeStudentBadge).filter(isPresent),
    coins: normalizeCoinBalance(record.coins ?? record.coinBalance) ?? undefined,
    leaderboardPreview: readArrayPayload(record.leaderboardPreview ?? record.leaderboard).map(normalizeLeaderboardEntry).filter(isPresent),
    level: normalizeStudentLevel(record.level) ?? undefined,
    rank: normalizeRankPosition(record.rank ?? record.rankPosition) ?? undefined,
    rewards: readArrayPayload(record.rewards).map(normalizeReward).filter(isPresent),
    streaks: readArrayPayload(record.streaks).map(normalizeStudentStreak).filter(isPresent),
    studentId: readId(record, ["studentId", "student_id", "userId"]),
    xp: normalizeStudentXp(record.xp ?? record.xpSummary) ?? undefined,
  };
}

function readArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  const record = asRecord(value);
  if (!record) {
    return [];
  }

  const candidateKeys = [
    "data",
    "content",
    "items",
    "records",
    "results",
    "result",
    "payload",
    "body",
    "list",
    "leaderboard",
    "badges",
    "challenges",
    "quests",
    "progress",
    "transactions",
  ];

  for (const key of candidateKeys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (isRecord(candidate)) {
      const nestedArray = readArrayPayload(candidate);
      if (nestedArray.length) {
        return nestedArray;
      }
    }
  }

  return [];
}

function readObjectPayload(value: unknown): ApiRecord | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  for (const key of ["data", "result", "payload", "body", "response"]) {
    if (isRecord(record[key])) {
      return record[key] as ApiRecord;
    }
  }

  return record;
}

function resolveStudentId(studentId?: GamificationId) {
  const explicitStudentId = normalizeId(studentId);

  if (explicitStudentId) {
    return encodeURIComponent(explicitStudentId);
  }

  const session = getAuthSession();
  const user = session?.user;
  const sessionStudentId =
    normalizeId(session?.studentId) ||
    normalizeId(user?.studentId) ||
    normalizeId(user?.id) ||
    normalizeId(user?.userId);

  if (!sessionStudentId) {
    throw new Error("Student id is required to load gamification data.");
  }

  return encodeURIComponent(sessionStudentId);
}

function withQuery(endpoint: string, query: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    const normalizedValue = normalizeId(value);

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

function normalizeId(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function readId(record: ApiRecord, keys: string[]): GamificationId {
  return readString(record, keys);
}

function readString(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return "";
}

function readNumber(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return undefined;
}

function readBoolean(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string" && value.trim()) {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
  }

  return undefined;
}

function normalizeProgressStatus(value: string): GamificationProgressStatus {
  const normalized = value.toUpperCase();
  if (normalized.includes("CLAIM")) return "CLAIMED";
  if (normalized.includes("COMPLETE") || normalized.includes("DONE")) return "COMPLETED";
  if (normalized.includes("EXPIRE")) return "EXPIRED";
  if (normalized.includes("FAIL")) return "FAILED";
  if (normalized.includes("ACTIVE") || normalized.includes("PROGRESS")) return "IN_PROGRESS";
  return "NOT_STARTED";
}

function normalizePeriod(value: string): GamificationPeriod | undefined {
  const normalized = value.toUpperCase();
  if (normalized.includes("DAILY")) return "DAILY";
  if (normalized.includes("WEEK")) return "WEEKLY";
  if (normalized.includes("MONTH")) return "MONTHLY";
  if (normalized.includes("ALL")) return "ALL_TIME";
  return undefined;
}

function normalizeChallengePeriod(value: string): Exclude<GamificationPeriod, "ALL_TIME"> {
  return normalizePeriod(value) === "MONTHLY" ? "MONTHLY" : normalizePeriod(value) === "WEEKLY" ? "WEEKLY" : "DAILY";
}

function normalizeScope(value: string): RankPosition["scope"] {
  const normalized = value.toUpperCase();
  if (normalized.includes("GLOBAL")) return "GLOBAL";
  if (normalized.includes("INSTITUTE")) return "INSTITUTE";
  if (normalized.includes("COURSE")) return "COURSE";
  if (normalized.includes("BATCH")) return "BATCH";
  return undefined;
}

function normalizeBadgeRarity(value: string): BadgeRarity | undefined {
  const normalized = value.toUpperCase();
  if (normalized === "COMMON" || normalized === "RARE" || normalized === "EPIC" || normalized === "LEGENDARY") {
    return normalized;
  }
  return undefined;
}

function normalizeCoinTransactionType(value: string): CoinTransactionType {
  const normalized = value.toUpperCase();
  if (normalized === "SPENT" || normalized === "REWARD" || normalized === "BONUS" || normalized === "ADJUSTMENT" || normalized === "REFUND") {
    return normalized;
  }
  return "EARNED";
}

function normalizeRewardType(value: string): RewardType {
  const normalized = value.toUpperCase();
  if (normalized === "BADGE" || normalized === "COINS" || normalized === "XP" || normalized === "CERTIFICATE" || normalized === "CUSTOM") {
    return normalized;
  }
  return "CUSTOM";
}

function normalizeTrendPoint(value: unknown) {
  const record = readObjectPayload(value);
  if (!record) return null;

  const xp = readNumber(record, ["xp", "earnedXp", "value", "totalXp", "points"]);
  if (xp === undefined) return null;

  return {
    date: readString(record, ["date", "createdAt", "day", "month"]),
    label: readString(record, ["label", "date", "day", "month"]),
    value: xp,
    xp,
  };
}

function isPresent<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

function asRecord(value: unknown): ApiRecord | null {
  return isRecord(value) ? value : null;
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
