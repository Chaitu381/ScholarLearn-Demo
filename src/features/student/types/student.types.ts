import type { UiTone } from "../../../shared/types/ui";

export type StudentProfile = {
  id: string;
  name: string;
  course: string;
  batch: string;
  email: string;
  phone: string;
  mentor: string;
  enrollmentDate: string;
  avatarInitials: string;
  location: string;
  guardianContact: string;
  photoUrl?: string;
};

export type OverviewStat = {
  id: string;
  label: string;
  value: string | number;
  status: string;
  helperText?: string;
  tone: UiTone;
};

export type DailyProgressItem = {
  id: string;
  label: string;
  value: string;
  complete: boolean;
  tone: UiTone;
};

export type DailyProgress = {
  attendanceStatus: string;
  codingStreakDays: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  testPreparationProgress: number;
  checklist: DailyProgressItem[];
};

export type AttendanceRecord = {
  month: string;
  percentage: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalDays: number;
};

export type AttendanceTrendPoint = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  present: number;
  late: number;
  absent: number;
};

export type AttendanceDistributionItem = {
  label: "Present" | "Late" | "Absent";
  value: number;
  tone: "primary" | "orange" | "red";
};

export type SubjectAttendance = {
  subject: string;
  percentage: number;
  attendedClasses: number;
  totalClasses: number;
};

export type AttendanceAnalytics = {
  improvement: string;
  activeFilter: "Week" | "Month" | "Sem";
  summaryCards: Array<{
    label: "Present" | "Late" | "Absent";
    value: string;
    helper: string;
    tone: "primary" | "orange" | "red";
  }>;
  weeklyTrend: AttendanceTrendPoint[];
  distribution: AttendanceDistributionItem[];
  subjectWise: SubjectAttendance[];
};

export type TestCategory = "Weekly" | "Monthly" | "Final" | "Mock" | "Coding Test";
export type TestStatus = "Upcoming" | "Completed" | "Missed" | "Retake Available";

export type TestRecord = {
  id: string;
  title: string;
  subject: string;
  score: number;
  maxScore: number;
  date: string;
  category: TestCategory;
  status: TestStatus;
};

export type TestScorePoint = {
  label: string;
  score: number;
};

export type FinalExamMetric = {
  label: string;
  value: string;
  helper: string;
  tone: UiTone;
};

export type TestPerformance = {
  averageScore: number;
  weeklyScore: number;
  monthlyScore: number;
  mockScore: number;
  metricLabel: string;
  weeklyTestScores: TestScorePoint[];
  monthlyTestScores: TestScorePoint[];
  finalExamReport: FinalExamMetric[];
  weakTopics: string[];
};

export type SubjectStatus = "Strong" | "Improving" | "Needs Focus" | "Low Attendance";

export type SubjectProgress = {
  id: string;
  name: string;
  instructor: string;
  progress: number;
  attendance: number;
  testAverage: number;
  currentModule: string;
  nextMilestone: string;
  weakTopic?: string;
  status: SubjectStatus;
  nextTask: string;
  nextClass: string;
  tone: Exclude<UiTone, "neutral">;
};

export type SubjectNote = {
  id: string;
  title: string;
  description?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  fileType?: string;
  fileUrl?: string;
};

export type SubjectTopicFlowItem = {
  id: string;
  name: string;
  description?: string;
  order?: number;
  progress?: number;
  prerequisiteIds?: string[];
  status?: "completed" | "current" | "locked" | "not-started";
};

export type DifficultyProgress = {
  label: "Easy" | "Medium" | "Hard";
  solved: number;
  total: number;
  tone: Exclude<UiTone, "neutral">;
};

export type CodingHeatmapPoint = {
  week: number;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  intensity: 0 | 1 | 2 | 3 | 4;
};

export type DailyCodingHour = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  hours: number;
};

export type WeeklyCodingProgress = {
  week: string;
  easy: number;
  medium: number;
  hard: number;
};

export type MonthlyCodingTrend = {
  month: string;
  solved: number;
};

export type CodingPractice = {
  streakDays: number;
  bestStreakDays: number;
  successRate: number;
  totalProblemsSolved: number;
  solvedThisWeek: number;
  weeklyTarget: number;
  difficultyProgress: DifficultyProgress[];
  heatmap: CodingHeatmapPoint[];
  dailyCodingHours: DailyCodingHour[];
  weeklyProgress: WeeklyCodingProgress[];
  monthlyTrend: MonthlyCodingTrend[];
  recommendedProblems: Array<{
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topic: string;
  }>;
  currentChallenge: {
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topic: string;
    dueLabel: string;
  };
  recentSubmissions: Array<{
    id: string;
    problem: string;
    result: "Accepted" | "Needs Review" | "Retry";
    language: string;
    submittedAt: string;
  }>;
  recentSolvedProblem: string;
  recommendedNextProblem: string;
  languages: string[];
  recentTopics: string[];
};

export type Assignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "pending" | "submitted" | "overdue" | "reviewed";
  priority: "low" | "medium" | "high";
  score?: number;
  description: string;
};

export type UpcomingTest = {
  id: string;
  title: string;
  subject: string;
  date: string;
  durationMinutes: number;
  status: "scheduled" | "revision" | "mock";
};

export type RecentActivity = {
  id: string;
  type: "lesson" | "assignment" | "test" | "coding" | "attendance" | "badge";
  title: string;
  detail: string;
  timestamp: string;
};

export type LeaderboardEntry = {
  rank: number;
  studentName: string;
  score: number;
  points: number;
  batch: string;
  isCurrentStudent?: boolean;
};

export type LeaderboardPreview = {
  currentRank: number;
  totalStudents: number;
  weeklyImprovement: number;
  nextRankPointsGap: number;
  progressToNextRank: number;
  topStudents: LeaderboardEntry[];
  currentStudent: LeaderboardEntry;
};

export type Recommendation = {
  id: string;
  title: string;
  reason: string;
  suggestedAction: string;
  actionLabel: string;
  category: "attendance" | "tests" | "coding" | "assignments";
  priority: "high" | "medium" | "low";
  tone: UiTone;
};

export type StudentAchievement = {
  id: string;
  title: string;
  description: string;
  tone: UiTone;
};

export type StudentSettingsGroup = {
  id: string;
  title: string;
  description: string;
  settings: Array<{
    id: string;
    label: string;
    description: string;
    enabled: boolean;
  }>;
};

export type StudentMockData = {
  profile: StudentProfile;
  dailyProgress: DailyProgress;
  overviewStats: OverviewStat[];
  attendanceSummary: {
    percentage: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    subjectWise: SubjectAttendance[];
  };
  attendanceAnalytics: AttendanceAnalytics;
  attendance: AttendanceRecord[];
  testPerformance: TestPerformance;
  tests: TestRecord[];
  subjects: SubjectProgress[];
  codingPractice: CodingPractice;
  assignments: Assignment[];
  upcomingTests: UpcomingTest[];
  recentActivity: RecentActivity[];
  leaderboard: LeaderboardEntry[];
  leaderboardPreview: LeaderboardPreview;
  recommendations: Recommendation[];
  achievements: StudentAchievement[];
  settings: StudentSettingsGroup[];
};

export type StudentTestSectionType = "CODING" | "MCQ" | "QA";
export type StudentTestAttemptStatus = "AUTO_SUBMITTED" | "EXPIRED" | "IN_PROGRESS" | "SUBMITTED";

export type StudentTestMcqQuestion = {
  correctOptionIndex?: number;
  id: string;
  marks: number;
  options: string[];
  questionText: string;
};

export type StudentTestQaQuestion = {
  expectedAnswer?: string;
  id: string;
  marks: number;
  questionText: string;
};

export type StudentTestCodingQuestion = {
  allowedLanguages: string[];
  constraints: string;
  codingQuestionId?: string;
  id: string;
  inputFormat: string;
  marks: number;
  outputFormat: string;
  problemStatement: string;
  sampleInput: string;
  sampleOutput: string;
  starterCode: string;
  title: string;
};

export type StudentTestSection =
  | {
      id: string;
      marks: number;
      questions: StudentTestMcqQuestion[];
      sectionType: "MCQ";
      title: string;
    }
  | {
      id: string;
      marks: number;
      questions: StudentTestQaQuestion[];
      sectionType: "QA";
      title: string;
    }
  | {
      id: string;
      marks: number;
      questions: StudentTestCodingQuestion[];
      sectionType: "CODING";
      title: string;
    };

export type StudentTestDetails = {
  batch: string;
  durationMinutes: number;
  instructions: string[];
  sections: StudentTestSection[];
  subject: string;
  testId: string;
  testType: "FINAL" | "MOCK" | "MONTHLY" | "WEEKLY";
  title: string;
  totalMarks: number;
};

export type StudentTestAnswer =
  | {
      questionId: string;
      selectedOptionIndex: number | null;
      sectionType: "MCQ";
    }
  | {
      questionId: string;
      sectionType: "QA";
      text: string;
    }
  | {
      code: string;
      language: string;
      questionId: string;
      sectionType: "CODING";
    };

export type StudentTestAttemptState = {
  activeTestId: string;
  answers: Record<string, StudentTestAnswer>;
  attemptId: string;
  backendRemainingSeconds?: number;
  backendRemainingSyncedAt?: string;
  codingAnswers: Record<string, Extract<StudentTestAnswer, { sectionType: "CODING" }>>;
  durationMinutes: number;
  remainingSeconds: number;
  startedAt: string;
  status?: StudentTestAttemptStatus;
  submitted: boolean;
  submittedAt?: string;
  testId: string;
};
