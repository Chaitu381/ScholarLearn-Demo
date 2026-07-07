import type { LucideIcon } from "lucide-react";

export type LecturerRouteKey =
  | "dashboard"
  | "batches"
  | "batch-detail"
  | "student-profile"
  | "tests"
  | "create-test"
  | "test-detail"
  | "assignments"
  | "create-assignment"
  | "profile"
  | "settings";

export type LecturerRouteParams = {
  batchId?: string;
  studentId?: string;
  testId?: string;
};

export type LecturerRoute = {
  key: LecturerRouteKey;
  params: LecturerRouteParams;
};

export type LecturerNavItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  routeKey: LecturerRouteKey;
};

export type LecturerStat = {
  description: string;
  label: string;
  tone: "blue" | "orange" | "primary" | "yellow";
  value: string;
};

export type LecturerBatch = {
  attendance: number;
  batchId: string;
  course: string;
  mentorNote: string;
  name: string;
  progress: number;
  students: number;
  subject: string;
};

export type LecturerStudent = {
  attendance: number;
  averageScore: number;
  batchId: string;
  email: string;
  name: string;
  rank: number;
  studentId: string;
  weakTopic: string;
};

export type LecturerTest = {
  batchId: string;
  category: string;
  date: string;
  status: "Draft" | "Published" | "Review";
  testId: string;
  title: string;
};

export type LecturerAssignment = {
  assignmentId: string;
  batchId: string;
  dueDate: string;
  status: "Draft" | "Published" | "Review";
  submissions: string;
  title: string;
};

export type CodingQuestionDifficulty = "Easy" | "Medium" | "Hard";

export type CodingQuestionDraft = {
  allowedLanguages: string[];
  constraints: string;
  difficulty: CodingQuestionDifficulty;
  explanation: string;
  hiddenTestCasesCount: number;
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
