// TODO: Replace this dummy data with backend gamification leaderboard API.
export type LeaderboardTabKey = "attendance" | "coding" | "improvement" | "monthly" | "overall" | "weekly";

export type LeaderboardMovement = "down" | "same" | "up";

export type DummyLeaderboardEntry = {
  avatarUrl?: string;
  badgesCount: number;
  coins: number;
  initials: string;
  isCurrentStudent?: boolean;
  level: string;
  movement: LeaderboardMovement;
  movementValue: number;
  progressPercentage: number;
  rank: number;
  streakDays: number;
  studentName: string;
  xp: number;
};

export type DummyBadge = {
  description: string;
  earnedDate: string;
  name: string;
};

export type DummyChallenge = {
  progressPercentage: number;
  reward: string;
  status: "Active" | "Completed";
  title: string;
};

export type DummyQuest = {
  progressPercentage: number;
  reward: string;
  title: string;
};

export type DummyCoinActivity = {
  amount: number;
  label: string;
  time: string;
  type: "earned" | "spent";
};

export type DummyStreakSummary = {
  best: number;
  current: number;
  label: string;
};

export const dummyLeaderboardSummary = {
  badgesEarned: 18,
  coins: 3420,
  currentLevel: "Level 8 - Trailblazer",
  currentRank: 5,
  currentStreak: 12,
  currentXp: 18450,
};

export const dummyLeaderboardTabs: Array<{
  description: string;
  key: LeaderboardTabKey;
  label: string;
}> = [
  { description: "Total XP, coins, badges, streaks, and progress.", key: "overall", label: "Overall" },
  { description: "Top students by this week's XP and challenge activity.", key: "weekly", label: "Weekly" },
  { description: "Monthly progress across quests, badges, and XP.", key: "monthly", label: "Monthly" },
  { description: "Coding practice XP, streaks, and problem-solving progress.", key: "coding", label: "Coding" },
  { description: "Attendance streaks and consistency progress.", key: "attendance", label: "Attendance" },
  { description: "Students with the strongest rank movement.", key: "improvement", label: "Improvement" },
];

const overallEntries: DummyLeaderboardEntry[] = [
  { badgesCount: 26, coins: 5200, initials: "AK", level: "Level 10", movement: "same", movementValue: 0, progressPercentage: 96, rank: 1, streakDays: 21, studentName: "Aarav Kumar", xp: 24800 },
  { badgesCount: 23, coins: 4860, initials: "MR", level: "Level 9", movement: "up", movementValue: 1, progressPercentage: 91, rank: 2, streakDays: 18, studentName: "Meera Rao", xp: 23150 },
  { badgesCount: 21, coins: 4520, initials: "PM", level: "Level 9", movement: "down", movementValue: 1, progressPercentage: 88, rank: 3, streakDays: 16, studentName: "Pranav Menon", xp: 22410 },
  { badgesCount: 20, coins: 3910, initials: "SI", level: "Level 8", movement: "up", movementValue: 2, progressPercentage: 83, rank: 4, streakDays: 14, studentName: "Sara Iyer", xp: 19780 },
  { badgesCount: 18, coins: 3420, initials: "CP", isCurrentStudent: true, level: "Level 8", movement: "up", movementValue: 3, progressPercentage: 78, rank: 5, streakDays: 12, studentName: "Chaitanya Pilla", xp: 18450 },
  { badgesCount: 15, coins: 2980, initials: "NV", level: "Level 7", movement: "same", movementValue: 0, progressPercentage: 72, rank: 6, streakDays: 10, studentName: "Nisha Varma", xp: 16900 },
  { badgesCount: 13, coins: 2640, initials: "DK", level: "Level 7", movement: "down", movementValue: 2, progressPercentage: 68, rank: 7, streakDays: 8, studentName: "Dev Kumar", xp: 15820 },
];

function offsetEntries(entries: DummyLeaderboardEntry[], offsets: number[]): DummyLeaderboardEntry[] {
  return entries
    .map((entry, index) => ({
      ...entry,
      coins: Math.max(entry.coins + offsets[index] * 12, 0),
      progressPercentage: Math.min(Math.max(entry.progressPercentage + offsets[index], 0), 100),
      rank: index + 1,
      xp: Math.max(entry.xp + offsets[index] * 120, 0),
    }))
    .sort((first, second) => second.xp - first.xp)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export const dummyLeaderboards: Record<LeaderboardTabKey, DummyLeaderboardEntry[]> = {
  attendance: offsetEntries(overallEntries, [1, -2, 4, 6, 3, -1, -3]),
  coding: offsetEntries(overallEntries, [5, 3, -1, 2, 7, -2, -4]),
  improvement: offsetEntries(overallEntries, [-4, 7, 3, 6, 8, 1, -2]),
  monthly: offsetEntries(overallEntries, [2, 4, -1, 5, 3, -2, 1]),
  overall: overallEntries,
  weekly: offsetEntries(overallEntries, [-1, 6, 2, 4, 8, 1, -3]),
};

export const dummyBadges: DummyBadge[] = [
  { description: "Completed five coding challenges in one week.", earnedDate: "2026-06-26", name: "Coding Sprinter" },
  { description: "Maintained attendance above 90%.", earnedDate: "2026-06-22", name: "Consistency Star" },
  { description: "Improved rank three times in a row.", earnedDate: "2026-06-18", name: "Rank Climber" },
];

export const dummyChallenges: DummyChallenge[] = [
  { progressPercentage: 80, reward: "250 XP + 40 coins", status: "Active", title: "Solve 5 array problems" },
  { progressPercentage: 60, reward: "150 XP", status: "Active", title: "Review weak topic notes" },
  { progressPercentage: 100, reward: "Badge unlock", status: "Completed", title: "Attend 3 classes this week" },
];

export const dummyQuests: DummyQuest[] = [
  { progressPercentage: 72, reward: "500 XP", title: "Spring Boot mastery path" },
  { progressPercentage: 54, reward: "300 coins", title: "SQL Joins recovery quest" },
  { progressPercentage: 38, reward: "New badge", title: "Coding edge cases quest" },
];

export const dummyCoinActivity: DummyCoinActivity[] = [
  { amount: 120, label: "Weekly challenge progress", time: "Today", type: "earned" },
  { amount: 40, label: "Hint used in coding practice", time: "Yesterday", type: "spent" },
  { amount: 180, label: "Badge reward", time: "2 days ago", type: "earned" },
];

export const dummyStreakSummary: DummyStreakSummary[] = [
  { best: 18, current: 12, label: "Coding" },
  { best: 24, current: 15, label: "Attendance" },
  { best: 10, current: 6, label: "Tests" },
];
