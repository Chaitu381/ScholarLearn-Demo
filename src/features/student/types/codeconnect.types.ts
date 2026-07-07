export type PracticeCategory = "coding" | "aptitude" | "reasoning" | "verbal";

export type MCQPracticeCategory = Exclude<PracticeCategory, "coding">;

export type Difficulty = "easy" | "medium" | "hard";

export type PracticeStatus =
  | "not-started"
  | "in-progress"
  | "solved"
  | "attempted"
  | "review";

export type CodingLanguage = "java" | "python" | "javascript" | "cpp";

export type CodingExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type CodingSubmission = {
  id: string;
  status: "Accepted" | "Wrong Answer" | "Runtime Error";
  language: CodingLanguage;
  runtime: string;
  memory: string;
  submittedAt: string;
};

export type CodingTestCase = {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
};

export type CodingExecutionResult = {
  status: "Ready" | "Run completed" | "Accepted";
  output: string;
  runtime: string;
  memory: string;
  passed: number;
  total: number;
};

export type CodingProblem = {
  id: string;
  problemNumber?: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  status: PracticeStatus;
  bookmarked?: boolean;
  accuracy: number;
  solvedCount: number;
  description: string;
  statement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints: string[];
  examples?: CodingExample[];
  hints?: string[];
  solutionApproach?: string;
  complexity?: string;
  submissions?: CodingSubmission[];
  starterCode?: Partial<Record<CodingLanguage, string>>;
  testCases?: CodingTestCase[];
  sampleInput: string;
  sampleOutput: string;
};

export type PracticeQuestion = {
  id: string;
  category: MCQPracticeCategory;
  questionNumber?: number;
  topic: string;
  difficulty: Difficulty;
  status: PracticeStatus;
  bookmarked?: boolean;
  accuracy?: number;
  points?: number;
  xp?: number;
  passage?: string;
  question: string;
  title?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  vocabularyNote?: string;
};

export type PracticeCategoryStats = {
  category: PracticeCategory;
  label: string;
  solved: number;
  accuracy: number;
  weakTopics: string[];
  streakDays?: number;
};

export type PracticeHubStats = {
  totalSolved: number;
  averageAccuracy: number;
  activeStreakDays: number;
  bestStreakDays: number;
  practiceXp: number;
  currentLevel: string;
  weeklyGoal: {
    completed: number;
    target: number;
  };
  categories: PracticeCategoryStats[];
};

export type DifficultyProgress = {
  difficulty: Difficulty;
  label: string;
  solved: number;
  total: number;
};

export type CurrentChallenge = {
  title: string;
  topic: string;
  difficulty: Difficulty;
  dueLabel: string;
  recentSolvedProblem: string;
  nextProblem: string;
};

export type ProblemSolvingTrendPoint = {
  month: string;
  solved: number;
};

export type DailyPracticeHoursPoint = {
  day: string;
  hours: number;
};

export type WeeklyProgressPoint = {
  week: string;
  coding: number;
  aptitude: number;
  reasoning: number;
  verbal: number;
};

export type CategoryAccuracyPoint = {
  category: string;
  accuracy: number;
};

export type RecommendedPracticeItem = {
  id: string;
  title: string;
  category: PracticeCategory;
  topic: string;
  difficulty: Difficulty;
};

export type RecentSubmissionStatus =
  | "accepted"
  | "review"
  | "improved"
  | "retry";

export type RecentPracticeSubmission = {
  id: string;
  title: string;
  category: PracticeCategory;
  submittedAt: string;
  status: RecentSubmissionStatus;
};

export type ScheduledTestStatus = "available" | "upcoming" | "completed";

export type CodeConnectScheduledTest = {
  id: string;
  title: string;
  category: MCQPracticeCategory;
  description: string;
  durationMinutes: number;
  scheduledAt: string;
  availableFrom: string;
  availableUntil: string;
  status: ScheduledTestStatus;
  createdBy: string;
  questionIds: string[];
  totalQuestions: number;
  totalPoints: number;
};

export type CodeConnectFriendRequest = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined";
};

export type CodeConnectNotificationType = "test" | "friend-request";

export type CodeConnectNotification = {
  id: string;
  type: CodeConnectNotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  targetId?: string;
  priority?: "low" | "medium" | "high";
};

export type TopicPerformanceResult = {
  attempted: number;
  correct: number;
  percentage: number;
  topic: string;
  total: number;
};

export type AttemptResult = {
  id: string;
  testId?: string;
  title: string;
  category: MCQPracticeCategory;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  percentageScore: number;
  xpEarned: number;
  answers: Record<string, string>;
  topicPerformance: TopicPerformanceResult[];
};
