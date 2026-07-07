import type { ComponentType } from "react";
import {
  BarChart3,
  BookOpen,
  Code2,
  Gauge,
  Medal,
  Settings,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { StudentAnalytics } from "../../features/student/pages/StudentAnalytics";
import { StudentCodingPractice } from "../../features/student/pages/StudentCodingPractice";
import { StudentDashboard } from "../../features/student/pages/StudentDashboard";
import { StudentLeaderboard } from "../../features/student/pages/StudentLeaderboard";
import { StudentProfile } from "../../features/student/pages/StudentProfile";
import { StudentSettings } from "../../features/student/pages/StudentSettings";
import { StudentSubjects } from "../../features/student/pages/StudentSubjects";
import { StudentTests } from "../../features/student/pages/StudentTests";

export type StudentPageKey =
  | "dashboard"
  | "subjects"
  | "coding"
  | "tests"
  | "analytics"
  | "leaderboard"
  | "profile"
  | "settings";

export type StudentPageDefinition = {
  key: StudentPageKey;
  label: string;
  shortLabel: string;
  path: string;
  icon: LucideIcon;
  component: ComponentType;
  showInNavigation?: boolean;
};

export const studentPageRegistry: StudentPageDefinition[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    path: "dashboard",
    icon: Gauge,
    component: StudentDashboard,
  },
  {
    key: "subjects",
    label: "Subjects",
    shortLabel: "Subjects",
    path: "subjects",
    icon: BookOpen,
    component: StudentSubjects,
  },
  {
    key: "coding",
    label: "Coding Practice",
    shortLabel: "Coding",
    path: "coding-practice",
    icon: Code2,
    component: StudentCodingPractice,
  },
  {
    key: "tests",
    label: "Test & Exam",
    shortLabel: "Test",
    path: "tests",
    icon: Trophy,
    component: StudentTests,
  },
  {
    key: "analytics",
    label: "Analytics",
    shortLabel: "Analytics",
    path: "analytics",
    icon: BarChart3,
    component: StudentAnalytics,
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    shortLabel: "Ranks",
    path: "leaderboard",
    icon: Medal,
    component: StudentLeaderboard,
  },
  {
    key: "profile",
    label: "Profile",
    shortLabel: "Profile",
    path: "profile",
    icon: UserRound,
    component: StudentProfile,
    showInNavigation: false,
  },
  {
    key: "settings",
    label: "Settings",
    shortLabel: "Settings",
    path: "settings",
    icon: Settings,
    component: StudentSettings,
    showInNavigation: false,
  },
];

export function getStudentPageByKey(pageKey: StudentPageKey) {
  return studentPageRegistry.find((page) => page.key === pageKey);
}
