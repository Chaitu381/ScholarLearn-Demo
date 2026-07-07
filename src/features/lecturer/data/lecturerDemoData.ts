import { BookOpenCheck, ClipboardList, FileText, GraduationCap } from "lucide-react";
import type { LecturerAssignment, LecturerBatch, LecturerStat, LecturerStudent, LecturerTest } from "../types/lecturer.types";

export const lecturerStats: LecturerStat[] = [
  {
    description: "Active learner count across assigned batches.",
    label: "Students",
    tone: "primary",
    value: "164",
  },
  {
    description: "Batches currently assigned to this lecturer.",
    label: "Batches",
    tone: "blue",
    value: "5",
  },
  {
    description: "Tests waiting for review or publishing.",
    label: "Tests",
    tone: "yellow",
    value: "8",
  },
  {
    description: "Assignments pending feedback this week.",
    label: "Assignments",
    tone: "orange",
    value: "21",
  },
];

export const lecturerShortcutActions = [
  { icon: ClipboardList, label: "Create Test", path: "/lecturer/tests/create" },
  { icon: FileText, label: "Create Assignment", path: "/lecturer/assignments/create" },
  { icon: BookOpenCheck, label: "Upload Questions", path: "/lecturer/tests/create#upload-questions" },
  { icon: GraduationCap, label: "View Batches", path: "/lecturer/batches" },
];

export const lecturerBatches: LecturerBatch[] = [
  {
    attendance: 92,
    batchId: "jfs-2026-a",
    course: "Java Full Stack",
    mentorNote: "Strong momentum; monitor Spring Security practice.",
    name: "JFS-2026-A",
    progress: 84,
    students: 42,
    subject: "Spring Boot",
  },
  {
    attendance: 88,
    batchId: "jfs-2026-b",
    course: "Java Full Stack",
    mentorNote: "Needs assignment follow-up for REST API project.",
    name: "JFS-2026-B",
    progress: 77,
    students: 38,
    subject: "React",
  },
  {
    attendance: 90,
    batchId: "py-2026-a",
    course: "Python Full Stack",
    mentorNote: "Good coding consistency; aptitude needs support.",
    name: "PY-2026-A",
    progress: 81,
    students: 36,
    subject: "Python",
  },
];

export const lecturerStudents: LecturerStudent[] = [
  {
    attendance: 92,
    averageScore: 84,
    batchId: "jfs-2026-a",
    email: "chaitanya@fengari.me",
    name: "Chaitanya",
    rank: 5,
    studentId: "stu-chaitanya",
    weakTopic: "Spring Security",
  },
  {
    attendance: 88,
    averageScore: 79,
    batchId: "jfs-2026-a",
    email: "ayush@fengari.me",
    name: "Ayush",
    rank: 11,
    studentId: "stu-ayush",
    weakTopic: "SQL Joins",
  },
  {
    attendance: 95,
    averageScore: 91,
    batchId: "jfs-2026-b",
    email: "aniket@fengari.me",
    name: "Aniket",
    rank: 2,
    studentId: "stu-aniket",
    weakTopic: "Dynamic Programming",
  },
];

export const lecturerTests: LecturerTest[] = [
  {
    batchId: "jfs-2026-a",
    category: "Weekly",
    date: "2026-07-02",
    status: "Published",
    testId: "test-spring-security",
    title: "Spring Security Checkpoint",
  },
  {
    batchId: "jfs-2026-b",
    category: "Coding Test",
    date: "2026-07-05",
    status: "Draft",
    testId: "test-react-hooks",
    title: "React Hooks Coding Test",
  },
  {
    batchId: "py-2026-a",
    category: "Monthly",
    date: "2026-07-10",
    status: "Review",
    testId: "test-python-api",
    title: "Python API Monthly Test",
  },
];

export const lecturerAssignments: LecturerAssignment[] = [
  {
    assignmentId: "assign-spring-crud",
    batchId: "jfs-2026-a",
    dueDate: "2026-07-03",
    status: "Published",
    submissions: "28/42",
    title: "Build Spring Boot CRUD APIs",
  },
  {
    assignmentId: "assign-react-dashboard",
    batchId: "jfs-2026-b",
    dueDate: "2026-07-06",
    status: "Draft",
    submissions: "0/38",
    title: "React Dashboard Components",
  },
  {
    assignmentId: "assign-python-auth",
    batchId: "py-2026-a",
    dueDate: "2026-07-08",
    status: "Review",
    submissions: "18/36",
    title: "Python Auth Flow Notes",
  },
];
