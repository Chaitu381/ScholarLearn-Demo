import type { FounderLecturer } from "../types/founder.types";

export const founderLecturers: FounderLecturer[] = [
  {
    assignedBatchesCount: 3,
    assignedSubjectsCount: 2,
    assignments: [
      { batch: "JFS-2026-A", dueDate: "2026-07-03", pending: 8, status: "Active", subject: "Spring Boot", submissions: 34, title: "REST API Security Review" },
      { batch: "JAVA-CORE-2025-C", dueDate: "2026-07-08", pending: 4, status: "Active", subject: "Collections", submissions: 25, title: "Collections Practice Sheet" },
    ],
    averageAttendance: 91,
    averageScore: 84,
    batches: [
      { attendance: 92, batchId: "jfs-2026-a", course: "Java Full Stack", name: "JFS-2026-A", nextClass: "Today, 2:00 PM", performance: 84, students: 42, subject: "Spring Boot" },
      { attendance: 95, batchId: "java-core-2025-c", course: "Core Java", name: "JAVA-CORE-2025-C", nextClass: "Completed", performance: 88, students: 29, subject: "Collections" },
      { attendance: 86, batchId: "jfs-2026-b", course: "Java Full Stack", name: "JFS-2026-B", nextClass: "Tomorrow, 10:30 AM", performance: 78, students: 38, subject: "Java Basics" },
    ],
    email: "kavya.rao@fengari.me",
    id: "lec-kavya-rao",
    name: "Kavya Rao",
    pendingReviews: 12,
    phone: "+91 98765 41020",
    primarySubject: "Spring Boot",
    status: "Active",
    subjects: ["Spring Boot", "Core Java"],
    tests: [
      { batch: "JFS-2026-A", createdAt: "2026-06-24", duration: "60 min", status: "Published", subject: "Spring Boot", title: "Spring Security Weekly Test", totalMarks: 80, type: "Weekly" },
      { batch: "JAVA-CORE-2025-C", createdAt: "2026-06-18", duration: "90 min", status: "Completed", subject: "Collections", title: "Collections Final Review", totalMarks: 100, type: "Final" },
    ],
    totalStudents: 109,
  },
  {
    assignedBatchesCount: 2,
    assignedSubjectsCount: 2,
    assignments: [
      { batch: "JFS-2026-B", dueDate: "2026-07-05", pending: 11, status: "Active", subject: "React", submissions: 27, title: "React Hooks Mini Project" },
      { batch: "MERN-2026-A", dueDate: "2026-07-10", pending: 13, status: "Draft", subject: "Node.js", submissions: 0, title: "Node Middleware Drill" },
    ],
    averageAttendance: 84,
    averageScore: 77,
    batches: [
      { attendance: 86, batchId: "jfs-2026-b", course: "Java Full Stack", name: "JFS-2026-B", nextClass: "Tomorrow, 10:30 AM", performance: 78, students: 38, subject: "React" },
      { attendance: 82, batchId: "mern-2026-a", course: "MERN Stack", name: "MERN-2026-A", nextClass: "Fri, 3:30 PM", performance: 74, students: 34, subject: "Node.js" },
    ],
    email: "neeraj.iyer@fengari.me",
    id: "lec-neeraj-iyer",
    name: "Neeraj Iyer",
    pendingReviews: 19,
    phone: "+91 98765 41021",
    primarySubject: "React",
    status: "Needs Review",
    subjects: ["React", "Node.js"],
    tests: [
      { batch: "JFS-2026-B", createdAt: "2026-06-22", duration: "75 min", status: "Published", subject: "React", title: "React Components Monthly Test", totalMarks: 90, type: "Monthly" },
      { batch: "MERN-2026-A", createdAt: "2026-06-16", duration: "45 min", status: "Draft", subject: "Node.js", title: "Express Routing Check", totalMarks: 60, type: "Weekly" },
    ],
    totalStudents: 72,
  },
  {
    assignedBatchesCount: 1,
    assignedSubjectsCount: 1,
    assignments: [
      { batch: "PY-2026-A", dueDate: "2026-07-04", pending: 6, status: "Active", subject: "Python APIs", submissions: 30, title: "FastAPI Endpoint Task" },
    ],
    averageAttendance: 90,
    averageScore: 81,
    batches: [
      { attendance: 90, batchId: "py-2026-a", course: "Python Full Stack", name: "PY-2026-A", nextClass: "Wed, 11:00 AM", performance: 81, students: 36, subject: "Python APIs" },
    ],
    email: "megha.singh@fengari.me",
    id: "lec-megha-singh",
    name: "Megha Singh",
    pendingReviews: 7,
    phone: "+91 98765 41022",
    primarySubject: "Python APIs",
    status: "Active",
    subjects: ["Python APIs"],
    tests: [
      { batch: "PY-2026-A", createdAt: "2026-06-20", duration: "60 min", status: "Completed", subject: "Python APIs", title: "Python API Integration Test", totalMarks: 75, type: "Weekly" },
    ],
    totalStudents: 36,
  },
  {
    assignedBatchesCount: 1,
    assignedSubjectsCount: 1,
    assignments: [
      { batch: "MERN-2026-A", dueDate: "2026-07-09", pending: 9, status: "Active", subject: "MongoDB", submissions: 25, title: "Aggregation Pipeline Practice" },
    ],
    averageAttendance: 83,
    averageScore: 76,
    batches: [
      { attendance: 82, batchId: "mern-2026-a", course: "MERN Stack", name: "MERN-2026-A", nextClass: "Fri, 3:30 PM", performance: 74, students: 34, subject: "MongoDB" },
    ],
    email: "arun.dev@fengari.me",
    id: "lec-arun-dev",
    name: "Arun Dev",
    pendingReviews: 10,
    phone: "+91 98765 41023",
    primarySubject: "MongoDB",
    status: "On Leave",
    subjects: ["MongoDB"],
    tests: [
      { batch: "MERN-2026-A", createdAt: "2026-06-14", duration: "60 min", status: "Published", subject: "MongoDB", title: "MongoDB Query Builder", totalMarks: 70, type: "Weekly" },
    ],
    totalStudents: 34,
  },
];

export function getFounderLecturer(lecturerId: string | undefined) {
  return founderLecturers.find((lecturer) => lecturer.id === lecturerId) ?? founderLecturers[0];
}
