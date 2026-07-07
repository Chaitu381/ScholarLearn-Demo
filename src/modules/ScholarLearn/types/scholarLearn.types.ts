import type { LucideIcon } from "lucide-react";

export type ScholarLearnMetricTone = "blue" | "orange" | "primary" | "red" | "yellow";
export type ScholarLearnInstituteStatus = "Active" | "Disabled" | "Expired" | "Trial";
export type ScholarLearnSubscriptionPlan =
  | "Basic"
  | "Custom"
  | "Enterprise"
  | "Monthly"
  | "Premium"
  | "Trial"
  | "Yearly"
  | (string & {});

export type ScholarLearnInstituteSubscriptionUpdate = {
  disabled: boolean;
  expiryDate: string;
  plan: ScholarLearnSubscriptionPlan;
  startDate: string;
};

// TODO: Replace this frontend placeholder contract with backend DTOs when
// InstituteAttendanceSetting, InstituteDashboardSetting, InstituteFeatureSetting,
// InstituteFormSetting, InstituteGradingSetting, and InstituteTestSetting are
// available in this frontend workspace.
export type ScholarLearnInstituteCustomizationSettings = {
  attendance: {
    allowAbsent: boolean;
    allowLate: boolean;
    allowPresent: boolean;
    lockAfterHours: number;
    minimumAttendancePercentage: number;
  };
  dashboard: {
    showDashboardCards: boolean;
    showGraphs: boolean;
    showLeaderboard: boolean;
  };
  features: {
    analytics: boolean;
    attendance: boolean;
    coding: boolean;
    jobPortal: boolean;
    studentPortal: boolean;
    tests: boolean;
  };
  forms: {
    batchRequired: boolean;
    courseRequired: boolean;
    phoneRequired: boolean;
    subjectRequired: boolean;
  };
  grading: {
    gradeScale: "POINTS" | "PERCENTAGE";
    passPercentage: number;
    strongSubjectThreshold: number;
    weakSubjectThreshold: number;
  };
  tests: {
    codingTest: boolean;
    finalTest: boolean;
    mcqTest: boolean;
    monthlyTest: boolean;
    resultVisibility: boolean;
    weeklyTest: boolean;
  };
};

export type ScholarLearnMetric = {
  description: string;
  icon: LucideIcon;
  label: string;
  tone: ScholarLearnMetricTone;
  value: string;
};

export type ScholarLearnInstitute = {
  activeBatches: number;
  activeRemainingDays: number;
  averageAttendance: number;
  averagePerformance: number;
  branches: number;
  city: string;
  disabled: boolean;
  expiryDate: string;
  founderEmail: string;
  founderName: string;
  handle: string;
  id: string;
  name: string;
  plan: ScholarLearnSubscriptionPlan;
  startDate: string;
  status: ScholarLearnInstituteStatus;
  students: number;
  totalLecturers: number;
  ownerPgs?: ScholarLearnInstitutePg[];
};

export type ScholarLearnInstitutePg = {
  batches: number;
  city: string;
  id: string;
  name: string;
  status: "Active" | "Disabled" | "Maintenance";
  students: number;
};

export type ScholarLearnRoleHealth = {
  activeUsers: number;
  label: string;
  pendingApprovals: number;
  trend: string;
};

export type ScholarLearnActivity = {
  description: string;
  id: string;
  time: string;
  title: string;
};

export type ScholarLearnApprovalHistoryAction = "APPROVED" | "DENIED" | "PENDING";

export type ScholarLearnApprovalHistoryRecord = {
  action: ScholarLearnApprovalHistoryAction;
  actionAt: string;
  actionBy: string;
  id: string;
  instituteName?: string;
  reason?: string;
  requestedRole: string;
  userEmail: string;
  userId?: string;
  userName: string;
};

export type ScholarLearnChartPoint = {
  active?: number;
  attendance?: number;
  growth?: number;
  inactive?: number;
  institutes?: number;
  label: string;
  performance?: number;
  revenue?: number;
  students?: number;
  tests?: number;
};

export type ScholarLearnPlanDistribution = {
  color: string;
  name: ScholarLearnSubscriptionPlan;
  value: number;
};

export type ScholarLearnDashboardData = {
  activities: ScholarLearnActivity[];
  activeInactiveGraph: ScholarLearnChartPoint[];
  attendanceTestSummary: ScholarLearnChartPoint[];
  instituteGrowthGraph: ScholarLearnChartPoint[];
  institutePerformanceGraph: ScholarLearnChartPoint[];
  institutes: ScholarLearnInstitute[];
  metrics: ScholarLearnMetric[];
  planDistribution: ScholarLearnPlanDistribution[];
  roleHealth: ScholarLearnRoleHealth[];
};
