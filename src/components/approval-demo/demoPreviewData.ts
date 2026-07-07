import type { PendingApprovalRole } from "../../lib/demoAuth";

export type ApprovalDemoPreviewRole = PendingApprovalRole | "SCHOLARLEARN";

export type DemoPreviewMetric = {
  label: string;
  tone: "blue" | "orange" | "primary" | "yellow";
  value: string;
};

export type DemoPreviewSection = {
  items: string[];
  title: string;
};

export type DemoPreviewData = {
  description: string;
  features: string[];
  metrics: DemoPreviewMetric[];
  roleLabel: string;
  sections: DemoPreviewSection[];
};

export type StudentPreviewTone = "blue" | "neutral" | "orange" | "primary" | "red" | "yellow";

export type StudentPreviewHoverItem = {
  label: string;
  value: string;
};

export type StudentPreviewSmallCard = {
  label: string;
  tone: StudentPreviewTone;
  value: string;
};

export type StudentDashboardPreviewData = {
  analytics: {
    graphs: number[];
    hover: StudentPreviewHoverItem[];
    progressCards: StudentPreviewSmallCard[];
  };
  assignments: {
    cards: Array<StudentPreviewSmallCard & {
      dueDate: string;
      status: string;
      subject: string;
    }>;
  };
  attendance: {
    graph: number[];
    hover: StudentPreviewHoverItem[];
    percentage: number;
    summaryCards: StudentPreviewSmallCard[];
  };
  coding: {
    accuracy: string;
    hover: StudentPreviewHoverItem[];
    rank: string;
    solvedProblems: string;
    streak: string;
  };
  notes: {
    cards: Array<{
      lastUpdated: string;
      subject: string;
      title: string;
      tone: StudentPreviewTone;
      uploadedBy: string;
    }>;
  };
  ranking: {
    cards: StudentPreviewSmallCard[];
    hover: StudentPreviewHoverItem[];
  };
  tests: {
    cards: Array<StudentPreviewSmallCard & {
      attempts: string;
      rank: string;
      score: string;
      weakTopic: string;
    }>;
  };
};

export const studentDashboardPreviewData: StudentDashboardPreviewData = {
  analytics: {
    graphs: [64, 72, 69, 78, 84, 88],
    hover: [
      { label: "Strong subjects", value: "Java, React, MySQL" },
      { label: "Weak subjects", value: "Spring Security, Aptitude" },
      { label: "Improvement", value: "+14% this month" },
    ],
    progressCards: [
      { label: "Performance", value: "84%", tone: "primary" },
      { label: "Test trend", value: "+9%", tone: "blue" },
      { label: "Focus areas", value: "2", tone: "orange" },
    ],
  },
  assignments: {
    cards: [
      { label: "Pending", value: "3", tone: "yellow", dueDate: "Jun 30, 2026", subject: "Spring Boot", status: "Pending review" },
      { label: "Submitted", value: "12", tone: "primary", dueDate: "Jun 26, 2026", subject: "React", status: "Submitted" },
      { label: "Overdue", value: "1", tone: "red", dueDate: "Jun 24, 2026", subject: "MySQL", status: "Overdue" },
    ],
  },
  attendance: {
    graph: [84, 88, 91, 87, 92, 94, 92],
    hover: [
      { label: "Present count", value: "46" },
      { label: "Absent count", value: "3" },
      { label: "Late count", value: "2" },
      { label: "Attendance percentage", value: "92%" },
      { label: "Last marked date", value: "Jun 28, 2026" },
    ],
    percentage: 92,
    summaryCards: [
      { label: "Present", value: "46", tone: "primary" },
      { label: "Absent", value: "3", tone: "red" },
      { label: "Late", value: "2", tone: "orange" },
    ],
  },
  coding: {
    accuracy: "84%",
    hover: [
      { label: "Easy solved", value: "120" },
      { label: "Medium solved", value: "95" },
      { label: "Hard solved", value: "30" },
      { label: "Latest submission", value: "Valid Parentheses accepted" },
    ],
    rank: "#8 coding rank",
    solvedProblems: "245",
    streak: "12 day streak",
  },
  notes: {
    cards: [
      { title: "Java Collections recap", subject: "Java", uploadedBy: "Ananya Rao", lastUpdated: "Today, 9:30 AM", tone: "primary" },
      { title: "React Hooks worksheet", subject: "React", uploadedBy: "Meera Shah", lastUpdated: "Yesterday, 5:10 PM", tone: "blue" },
      { title: "SQL join patterns", subject: "MySQL", uploadedBy: "Rahul Verma", lastUpdated: "Jun 26, 2026", tone: "yellow" },
    ],
  },
  ranking: {
    cards: [
      { label: "Batch rank", value: "#5", tone: "primary" },
      { label: "Weekly rank", value: "#3", tone: "blue" },
      { label: "Coding rank", value: "#8", tone: "orange" },
    ],
    hover: [
      { label: "XP", value: "8,420" },
      { label: "Badges", value: "Streak Master, Test Climber" },
      { label: "Leaderboard position", value: "5 of 164" },
    ],
  },
  tests: {
    cards: [
      { label: "Weekly test", value: "86%", tone: "primary", score: "86/100", attempts: "1 attempt", weakTopic: "Spring Security", rank: "#6" },
      { label: "Monthly test", value: "82%", tone: "blue", score: "82/100", attempts: "2 attempts", weakTopic: "SQL Joins", rank: "#8" },
      { label: "Final readiness", value: "74%", tone: "yellow", score: "Readiness 74%", attempts: "3 mocks", weakTopic: "Aptitude speed", rank: "#5" },
    ],
  },
};

export const demoPreviewData: Record<ApprovalDemoPreviewRole, DemoPreviewData> = {
  ADMIN: {
    description: "Preview institute operations, batch health, and administrative reporting after approval.",
    features: ["Institute Overview", "Courses", "Batches", "Students", "Attendance", "Reports"],
    metrics: [
      { label: "Active courses", value: "12", tone: "primary" },
      { label: "Batches", value: "28", tone: "blue" },
      { label: "Reports", value: "Live", tone: "orange" },
    ],
    roleLabel: "Admin",
    sections: [
      { title: "Operations", items: ["Course planning", "Batch allocation", "Student records"] },
      { title: "Controls", items: ["Attendance audit", "Report exports", "Approval queues"] },
    ],
  },
  ATTENDANCE_MARKER: {
    description: "Preview the attendance marking workflow for assigned batches and daily reports.",
    features: ["Batch List", "Attendance Marking", "Attendance Reports"],
    metrics: [
      { label: "Assigned batches", value: "6", tone: "primary" },
      { label: "Today sessions", value: "9", tone: "blue" },
      { label: "Pending marks", value: "2", tone: "yellow" },
    ],
    roleLabel: "Attendance Marker",
    sections: [
      { title: "Daily Work", items: ["Batch-wise roll calls", "Late/absent tracking", "Session notes"] },
      { title: "Reports", items: ["Daily summary", "Low attendance alerts", "Exportable records"] },
    ],
  },
  INSTITUTE_FOUNDER: {
    description: "Preview high-level institute performance, growth indicators, and academic outcomes.",
    features: ["Institute Overview", "Courses", "Batches", "Students", "Attendance", "Reports"],
    metrics: [
      { label: "Campuses", value: "3", tone: "primary" },
      { label: "Learners", value: "1.8k", tone: "blue" },
      { label: "Health score", value: "92%", tone: "yellow" },
    ],
    roleLabel: "Institute Founder",
    sections: [
      { title: "Executive View", items: ["Institute KPIs", "Revenue-ready reports", "Batch health"] },
      { title: "Academic Oversight", items: ["Course outcomes", "Attendance patterns", "Placement signals"] },
    ],
  },
  JOB_MANAGER: {
    description: "Preview placement operations for job posts, student applications, and hiring progress.",
    features: ["Job Posts", "Applications", "Placement Overview"],
    metrics: [
      { label: "Open roles", value: "18", tone: "primary" },
      { label: "Applications", value: "246", tone: "blue" },
      { label: "Shortlisted", value: "42", tone: "orange" },
    ],
    roleLabel: "Job Manager",
    sections: [
      { title: "Placement Pipeline", items: ["Job post management", "Application review", "Interview stages"] },
      { title: "Insights", items: ["Placement overview", "Skill match", "Batch readiness"] },
    ],
  },
  JUNIOR_LECTURER: {
    description: "Preview batch support tools for notes, assignments, tests, and student progress tracking.",
    features: ["Assigned Batches", "Notes", "Assignments", "Tests", "Student Analytics", "Attendance Overview"],
    metrics: [
      { label: "Batches", value: "3", tone: "primary" },
      { label: "Tasks", value: "14", tone: "orange" },
      { label: "Avg progress", value: "78%", tone: "blue" },
    ],
    roleLabel: "Junior Lecturer",
    sections: [
      { title: "Teaching Support", items: ["Upload notes", "Assignment follow-ups", "Test coordination"] },
      { title: "Student Signals", items: ["Weak topic flags", "Attendance overview", "Mentor escalations"] },
    ],
  },
  LECTURER: {
    description: "Preview lecturer tools for assigned batches, academic work, and student analytics.",
    features: ["Assigned Batches", "Notes", "Assignments", "Tests", "Student Analytics", "Attendance Overview"],
    metrics: [
      { label: "Batches", value: "5", tone: "primary" },
      { label: "Students", value: "164", tone: "blue" },
      { label: "Avg score", value: "84%", tone: "yellow" },
    ],
    roleLabel: "Lecturer",
    sections: [
      { title: "Classroom Tools", items: ["Notes library", "Assignment review", "Test planning"] },
      { title: "Analytics", items: ["Student performance", "Attendance overview", "Topic mastery"] },
    ],
  },
  SCHOLARLEARN: {
    description: "Preview platform owner controls for product health, institutes, roles, and system insights.",
    features: ["Platform Overview", "Institutes", "User Roles", "Approvals", "System Reports"],
    metrics: [
      { label: "Institutes", value: "24", tone: "primary" },
      { label: "Users", value: "9.4k", tone: "blue" },
      { label: "Uptime", value: "99.9%", tone: "yellow" },
    ],
    roleLabel: "ScholarLearn Platform Owner",
    sections: [
      { title: "Platform View", items: ["Institute onboarding", "Role management", "Approval monitoring"] },
      { title: "System Health", items: ["Usage reports", "Access audits", "Operational insights"] },
    ],
  },
  STUDENT: {
    description: "Preview the student learning workspace for attendance, practice, tests, assignments, and ranking.",
    features: ["Attendance", "Notes", "Tests & Exams", "Assignments", "Coding Practice", "Analytics", "Ranking"],
    metrics: [
      { label: "Attendance", value: "92%", tone: "primary" },
      { label: "Avg score", value: "84%", tone: "blue" },
      { label: "Rank", value: "#5", tone: "yellow" },
    ],
    roleLabel: "Student",
    sections: [
      { title: "Learning", items: ["Notes access", "Tests & exams", "Assignments"] },
      { title: "Growth", items: ["Coding practice", "Performance analytics", "Batch ranking"] },
    ],
  },
};
