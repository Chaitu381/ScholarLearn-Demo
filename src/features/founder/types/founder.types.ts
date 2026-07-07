import type { LucideIcon } from "lucide-react";

export type FounderApprovalStatus = "Approved" | "Pending" | "Rejected";
export type FounderBatchStatus = "Active" | "Completed" | "Needs Attention";
export type FounderNotificationType = "approval" | "attendance" | "batch" | "report";
export type FounderLecturerStatus = "Active" | "Needs Review" | "On Leave";

export type FounderStat = {
  description: string;
  icon: LucideIcon;
  label: string;
  tone: "blue" | "orange" | "primary" | "red" | "yellow";
  value: string;
};

export type FounderBatch = {
  assignedLecturers?: string[];
  attendance: number;
  batchId: string;
  course: string;
  name: string;
  nextClass: string;
  score: number;
  status: FounderBatchStatus;
  students: number;
  subject: string;
};

export type FounderDashboardSummary = {
  averageAttendance: number;
  averagePerformance: number;
  totalBatches: number;
  totalStudents: number;
};

export type FounderBatchDetailsData = FounderBatch & {
  activeStudents?: number;
  absentToday?: number;
  lateToday?: number;
  presentToday?: number;
};

export type FounderBatchPerformance = {
  attendanceGraph?: FounderPerformancePoint[];
  batchId: string;
  performanceGraph?: FounderPerformancePoint[];
  testPerformanceGraph?: FounderPerformancePoint[];
  weakStrongComparison?: Array<{
    label: string;
    strong: number;
    weak: number;
  }>;
};

export type FounderBatchStudent = {
  attendancePercentage: number;
  batchName: string;
  email: string;
  id: string;
  lastStatus: "Absent" | "Late" | "Present";
  name: string;
  profilePic?: string;
  rollNumber?: string;
};

export type FounderLecturerBatch = {
  attendance: number;
  batchId: string;
  course: string;
  name: string;
  nextClass: string;
  performance: number;
  students: number;
  subject: string;
};

export type FounderLecturerTest = {
  batch: string;
  createdAt: string;
  duration: string;
  status: "Completed" | "Draft" | "Published";
  subject: string;
  title: string;
  totalMarks: number;
  type: "Final" | "Monthly" | "Weekly";
};

export type FounderLecturerAssignment = {
  batch: string;
  dueDate: string;
  pending: number;
  status: "Active" | "Closed" | "Draft";
  subject: string;
  submissions: number;
  title: string;
};

export type FounderLecturer = {
  assignedBatchesCount: number;
  assignedSubjectsCount: number;
  assignments: FounderLecturerAssignment[];
  averageAttendance: number;
  averageScore: number;
  batches: FounderLecturerBatch[];
  email: string;
  id: string;
  name: string;
  pendingReviews: number;
  phone?: string;
  primarySubject?: string;
  profilePic?: string;
  status: FounderLecturerStatus;
  subjects: string[];
  tests: FounderLecturerTest[];
  totalStudents: number;
};

export type FounderApproval = {
  email: string;
  id: string;
  name: string;
  requestedAt: string;
  role: string;
  status: FounderApprovalStatus;
};

export type FounderApprovalDetails = FounderApproval & {
  batch?: string;
  course?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  registeredAt?: string;
  subjectOrDepartment?: string;
};

export type FounderApprovalNotification = {
  email: string;
  id: string;
  name: string;
  requestedAt: string;
  requestedRole: string;
};

export type FounderApprovalHistoryAction = "APPROVED" | "DENIED";

export type FounderApprovalHistoryRecord = {
  action: FounderApprovalHistoryAction;
  actionAt: string;
  actionBy: string;
  details?: Record<string, unknown>;
  id: string;
  requestedRole: string;
  userEmail: string;
  userId: string;
  userName: string;
};

export type FounderNotification = {
  id: string;
  message: string;
  timestamp: string;
  title: string;
  type: FounderNotificationType;
};

export type FounderPerformancePoint = {
  attendance: number;
  month: string;
  score: number;
  submissions: number;
};

export type FounderNavItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};
