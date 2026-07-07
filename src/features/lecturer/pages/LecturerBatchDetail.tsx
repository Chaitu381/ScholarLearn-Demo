import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  GraduationCap,
  Mail,
  Search,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { StudentAttendanceTable } from "../../../shared/components/ui/StudentAttendanceTable";
import { StudentGamificationStaffPanel } from "../../student/components/gamification";
import { LecturerBackButton } from "../components/LecturerPrimitives";
import { navigateToLecturerPath } from "../components/LecturerShell";
import { getLecturerApiStatusMessage, lecturerApi } from "../services/lecturerApi";

type BatchStatus = "Active" | "Needs Attention" | "Completed";
type StudentRiskStatus = "Good" | "Average" | "At Risk";
type AttendanceStatus = "Absent" | "Late" | "Present";
type DialogSection = "Attendance" | "Gamification" | "Overview" | "Performance" | "Topics";

type BatchSummary = {
  averageAttendance: number;
  averageScore: number;
  batchId: string;
  batchName: string;
  course: string;
  subject: string;
  totalStudents: number;
  weakStudentsCount: number;
};

type BatchStudent = {
  assignmentCompletion?: number;
  attendancePercentage: number;
  avatarInitials: string;
  batchId: string;
  codingScore: number;
  email: string;
  finalTestScore?: number;
  mcqScore?: number;
  monthlyTestScore?: number;
  name: string;
  phone?: string;
  profilePicture?: string;
  profileImageUrl?: string;
  qaScore?: number;
  rankInBatch?: string;
  recommendedAreas?: string[];
  rollNumber: string;
  status: StudentRiskStatus;
  strongTopics?: Array<{ percentage: number; topic: string }>;
  studentId: string;
  subjectAttendance?: Array<{ percentage: number; subject: string }>;
  testAverage: number;
  weeklyTestScore?: number;
  weakTopicsCount: number;
  weakTopics?: Array<{ percentage: number; topic: string }>;
};

type StudentDialogOverview = {
  assignmentCompletion: number;
  attendanceCounts: {
    absent: number;
    late: number;
    present: number;
  };
  performance: {
    coding: number;
    final: number;
    mcq: number;
    monthly: number;
    qa: number;
    weekly: number;
  };
  phone?: string;
  rankInBatch: string;
  recommendedAreas: string[];
  strongTopics: Array<{ percentage: number; topic: string }>;
  subjectAttendance: Array<{ percentage: number; subject: string }>;
  weakTopics: Array<{ percentage: number; topic: string }>;
};

const batchSummaries: Array<BatchSummary & { status: BatchStatus }> = [
  {
    averageAttendance: 92,
    averageScore: 84,
    batchId: "jfs-2026-a",
    batchName: "JFS-2026-A",
    course: "Java Full Stack",
    status: "Active",
    subject: "Spring Boot",
    totalStudents: 42,
    weakStudentsCount: 6,
  },
  {
    averageAttendance: 86,
    averageScore: 78,
    batchId: "jfs-2026-b",
    batchName: "JFS-2026-B",
    course: "Java Full Stack",
    status: "Needs Attention",
    subject: "React",
    totalStudents: 38,
    weakStudentsCount: 11,
  },
  {
    averageAttendance: 90,
    averageScore: 81,
    batchId: "py-2026-a",
    batchName: "PY-2026-A",
    course: "Python Full Stack",
    status: "Active",
    subject: "Python APIs",
    totalStudents: 36,
    weakStudentsCount: 5,
  },
  {
    averageAttendance: 82,
    averageScore: 74,
    batchId: "mern-2026-a",
    batchName: "MERN-2026-A",
    course: "MERN Stack",
    status: "Needs Attention",
    subject: "Node.js",
    totalStudents: 34,
    weakStudentsCount: 13,
  },
  {
    averageAttendance: 95,
    averageScore: 88,
    batchId: "java-core-2025-c",
    batchName: "JAVA-CORE-2025-C",
    course: "Core Java",
    status: "Completed",
    subject: "Collections",
    totalStudents: 29,
    weakStudentsCount: 2,
  },
];

const batchStudents: BatchStudent[] = [
  {
    attendancePercentage: 94,
    avatarInitials: "CH",
    batchId: "jfs-2026-a",
    codingScore: 88,
    email: "chaitanya@fengari.me",
    phone: "+91 98765 43210",
    rankInBatch: "#5",
    name: "Chaitanya",
    rollNumber: "JFS-A-001",
    status: "Good",
    studentId: "stu-chaitanya",
    testAverage: 86,
    weakTopicsCount: 1,
    assignmentCompletion: 91,
    finalTestScore: 86,
    mcqScore: 89,
    monthlyTestScore: 84,
    qaScore: 82,
    weeklyTestScore: 87,
    strongTopics: [{ percentage: 92, topic: "Spring Boot APIs" }, { percentage: 88, topic: "Java Collections" }],
    subjectAttendance: [{ percentage: 94, subject: "Spring Boot" }, { percentage: 90, subject: "React" }, { percentage: 92, subject: "MySQL" }],
    weakTopics: [{ percentage: 62, topic: "Spring Security" }],
    recommendedAreas: ["Revise authentication filters", "Practice 2 security MCQs daily"],
  },
  {
    attendancePercentage: 84,
    avatarInitials: "AY",
    batchId: "jfs-2026-a",
    codingScore: 72,
    email: "ayush@fengari.me",
    phone: "+91 98765 11122",
    rankInBatch: "#11",
    name: "Ayush",
    rollNumber: "JFS-A-002",
    status: "Average",
    studentId: "stu-ayush",
    testAverage: 76,
    weakTopicsCount: 3,
    assignmentCompletion: 78,
    finalTestScore: 78,
    mcqScore: 79,
    monthlyTestScore: 76,
    qaScore: 75,
    weeklyTestScore: 78,
    strongTopics: [{ percentage: 84, topic: "React Basics" }, { percentage: 81, topic: "Java OOP" }],
    subjectAttendance: [{ percentage: 84, subject: "Spring Boot" }, { percentage: 80, subject: "React" }, { percentage: 76, subject: "MySQL" }],
    weakTopics: [{ percentage: 58, topic: "SQL Joins" }, { percentage: 64, topic: "Recursion" }, { percentage: 66, topic: "State Management" }],
    recommendedAreas: ["Complete SQL joins worksheet", "Review recursion dry runs"],
  },
  {
    attendancePercentage: 72,
    avatarInitials: "DU",
    batchId: "jfs-2026-a",
    codingScore: 61,
    email: "durshant@fengari.me",
    phone: "+91 98765 22233",
    rankInBatch: "#18",
    name: "Durshant",
    rollNumber: "JFS-A-003",
    status: "At Risk",
    studentId: "stu-durshant",
    testAverage: 64,
    weakTopicsCount: 5,
    assignmentCompletion: 62,
    finalTestScore: 65,
    mcqScore: 66,
    monthlyTestScore: 61,
    qaScore: 59,
    weeklyTestScore: 63,
    strongTopics: [{ percentage: 76, topic: "Core Java" }, { percentage: 72, topic: "HTML/CSS" }],
    subjectAttendance: [{ percentage: 72, subject: "Spring Boot" }, { percentage: 68, subject: "React" }, { percentage: 70, subject: "MySQL" }],
    weakTopics: [{ percentage: 45, topic: "Spring Security" }, { percentage: 50, topic: "SQL Joins" }, { percentage: 55, topic: "Coding edge cases" }],
    recommendedAreas: ["Attend remedial Spring Security session", "Submit overdue API assignment"],
  },
  {
    attendancePercentage: 91,
    avatarInitials: "AN",
    batchId: "jfs-2026-a",
    codingScore: 94,
    email: "aniket@fengari.me",
    phone: "+91 98765 33344",
    rankInBatch: "#2",
    name: "Aniket",
    rollNumber: "JFS-A-004",
    status: "Good",
    studentId: "stu-aniket",
    testAverage: 91,
    weakTopicsCount: 0,
    assignmentCompletion: 96,
    finalTestScore: 92,
    mcqScore: 94,
    monthlyTestScore: 90,
    qaScore: 88,
    weeklyTestScore: 93,
    strongTopics: [{ percentage: 96, topic: "Dynamic Programming" }, { percentage: 93, topic: "Spring Boot" }],
    subjectAttendance: [{ percentage: 91, subject: "Spring Boot" }, { percentage: 94, subject: "React" }, { percentage: 92, subject: "MySQL" }],
    weakTopics: [{ percentage: 78, topic: "System Design Basics" }],
    recommendedAreas: ["Attempt advanced coding mock", "Mentor peers in DP practice"],
  },
  {
    attendancePercentage: 81,
    avatarInitials: "MS",
    batchId: "jfs-2026-b",
    codingScore: 75,
    email: "meera@fengari.me",
    name: "Meera Shah",
    rollNumber: "JFS-B-001",
    status: "Average",
    studentId: "stu-meera",
    testAverage: 78,
    weakTopicsCount: 2,
  },
  {
    attendancePercentage: 69,
    avatarInitials: "RV",
    batchId: "jfs-2026-b",
    codingScore: 58,
    email: "rahul@fengari.me",
    name: "Rahul Verma",
    rollNumber: "JFS-B-002",
    status: "At Risk",
    studentId: "stu-rahul",
    testAverage: 62,
    weakTopicsCount: 6,
  },
  {
    attendancePercentage: 93,
    avatarInitials: "NK",
    batchId: "py-2026-a",
    codingScore: 87,
    email: "neha@fengari.me",
    name: "Neha Kumar",
    rollNumber: "PY-A-001",
    status: "Good",
    studentId: "stu-neha",
    testAverage: 85,
    weakTopicsCount: 1,
  },
  {
    attendancePercentage: 79,
    avatarInitials: "IR",
    batchId: "mern-2026-a",
    codingScore: 68,
    email: "isha@fengari.me",
    name: "Isha Rao",
    rollNumber: "MERN-A-001",
    status: "Average",
    studentId: "stu-isha",
    testAverage: 73,
    weakTopicsCount: 4,
  },
  {
    attendancePercentage: 96,
    avatarInitials: "SP",
    batchId: "java-core-2025-c",
    codingScore: 91,
    email: "sai@fengari.me",
    name: "Sai Prakash",
    rollNumber: "JC-C-001",
    status: "Good",
    studentId: "stu-sai",
    testAverage: 89,
    weakTopicsCount: 1,
  },
];

const lightCard = "rounded-3xl border border-border bg-surface shadow-card";

export function LecturerBatchDetail({ batchId }: { batchId?: string }) {
  const fallbackBatch = batchSummaries.find((item) => item.batchId === batchId) ?? batchSummaries[0];
  const fallbackStudents = batchStudents.filter((student) => student.batchId === fallbackBatch.batchId);
  const [batch, setBatch] = useState<BatchSummary & { status: BatchStatus }>(fallbackBatch);
  const [students, setStudents] = useState<BatchStudent[]>(fallbackStudents);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>(() =>
    createInitialAttendanceRecords(fallbackStudents),
  );
  const [apiState, setApiState] = useState({ error: "", loading: true });
  const [searchValue, setSearchValue] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<BatchStudent | null>(null);

  useEffect(() => {
    let active = true;
    const resolvedBatchId = batchId ?? fallbackBatch.batchId;

    Promise.all([lecturerApi.getLecturerBatch(resolvedBatchId), lecturerApi.getLecturerBatchStudents(resolvedBatchId)])
      .then(([batchPayload, studentsPayload]) => {
        if (!active) return;
        const nextBatch = normalizeBatchSummary(batchPayload, fallbackBatch);
        const nextStudents = normalizeBatchStudents(studentsPayload, resolvedBatchId);
        const nextStudentsForBatch = nextStudents.filter((student) => student.batchId === nextBatch.batchId);

        setBatch(nextBatch);
        setStudents(nextStudents);
        setAttendanceRecords(createInitialAttendanceRecords(nextStudentsForBatch.length ? nextStudentsForBatch : nextStudents));
        setApiState({ error: "", loading: false });
      })
      .catch((error) => {
        if (!active) return;
        const nextStudents = batchStudents.filter((student) => student.batchId === fallbackBatch.batchId);
        setBatch(fallbackBatch);
        setStudents(nextStudents);
        setAttendanceRecords(createInitialAttendanceRecords(nextStudents));
        setApiState({ error: getLecturerApiStatusMessage(error), loading: false });
      });

    return () => {
      active = false;
    };
  }, [batchId, fallbackBatch]);

  const studentsForBatch = useMemo(() => students.filter((student) => student.batchId === batch.batchId), [batch.batchId, students]);
  const attendanceSummary = useMemo(() => getAttendanceSummary(studentsForBatch, attendanceRecords), [attendanceRecords, studentsForBatch]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return studentsForBatch.filter((student) => {
      const attendanceStatus = attendanceRecords[student.studentId] ?? "Present";
      const matchesSearch =
        !normalizedSearch ||
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.rollNumber.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch);
      const matchesAttendance = attendanceFilter === "All" || attendanceStatus === attendanceFilter;
      const matchesRisk = riskFilter === "All" || student.status === riskFilter;

      return matchesSearch && matchesAttendance && matchesRisk;
    });
  }, [attendanceFilter, attendanceRecords, riskFilter, searchValue, studentsForBatch]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus, event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setAttendanceRecords((currentRecords) => ({
      ...currentRecords,
      [studentId]: status,
    }));
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <LecturerBackButton />
      <ApiStateNotice error={apiState.error} loading={apiState.loading} />
      <BatchHeading batch={batch} />
      <AttendanceSummaryCards summary={attendanceSummary} />
      <Filters
        attendanceFilter={attendanceFilter}
        onAttendanceFilterChange={setAttendanceFilter}
        onRiskFilterChange={setRiskFilter}
        onSearchChange={setSearchValue}
        riskFilter={riskFilter}
        searchValue={searchValue}
      />

      <StudentAttendanceTable
        attendanceRecords={attendanceRecords}
        onAttendanceChange={handleAttendanceChange}
        onOpenStudent={setSelectedStudent}
        students={filteredStudents}
      />

      {selectedStudent ? (
        <StudentOverviewDialog
          attendanceStatus={attendanceRecords[selectedStudent.studentId] ?? "Present"}
          batch={batch}
          onAttendanceChange={(status, event) => handleAttendanceChange(selectedStudent.studentId, status, event)}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
        />
      ) : null}
    </motion.div>
  );
}

function BatchHeading({ batch }: { batch: BatchSummary }) {
  return (
    <section className={`${lightCard} p-5 sm:p-6`}>
      <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
        Batch Details
      </span>
      <h1 className="mt-4 text-[28px] font-extrabold leading-tight text-text-primary sm:text-[34px]">{batch.batchName}</h1>
      <p className="mt-2 max-w-3xl text-[15px] leading-7 text-text-secondary">
        {batch.course} - {batch.subject}
      </p>
    </section>
  );
}

function ApiStateNotice({ error, loading }: { error: string; loading: boolean }) {
  if (!loading && !error) return null;

  return (
    <div className="flex justify-end">
      <span className="inline-flex h-8 items-center rounded-full bg-surface-soft px-3 text-[12px] font-extrabold text-text-secondary">
        {loading ? "Syncing data" : "Demo data"}
      </span>
      <span className="sr-only">{error}</span>
    </div>
  );
}

function AttendanceSummaryCards({ summary }: { summary: Record<"Absent" | "Late" | "Present" | "Total", number> }) {
  const cards = [
    { icon: UsersRound, label: "Total Students", tone: "blue" as const, value: summary.Total },
    { icon: BookOpenCheck, label: "Present Today", tone: "primary" as const, value: summary.Present },
    { icon: ShieldAlert, label: "Absent Today", tone: "red" as const, value: summary.Absent },
    { icon: GraduationCap, label: "Late Today", tone: "orange" as const, value: summary.Late },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.label}
            className="rounded-3xl border border-border bg-surface p-4 shadow-card"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-extrabold uppercase text-text-muted">{card.label}</p>
                <p className="mt-2 text-[30px] font-extrabold leading-none text-text-primary">{card.value}</p>
              </div>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${summaryToneClass(card.tone)}`}>
                <Icon aria-hidden="true" size={20} strokeWidth={2.5} />
              </span>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}

function Filters({
  attendanceFilter,
  onAttendanceFilterChange,
  onRiskFilterChange,
  onSearchChange,
  riskFilter,
  searchValue,
}: {
  attendanceFilter: string;
  onAttendanceFilterChange: (value: string) => void;
  onRiskFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  riskFilter: string;
  searchValue: string;
}) {
  return (
    <section className={`${lightCard} p-4 sm:p-5`}>
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_170px_170px]">
        <label className="relative block">
          <span className="sr-only">Search student</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
            strokeWidth={2.5}
          />
          <input
            className="h-12 w-full rounded-2xl border border-border bg-surface-soft pl-11 pr-4 text-[14px] font-semibold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search student, roll number, email"
            value={searchValue}
          />
        </label>
        <FilterSelect
          label="Attendance"
          onChange={onAttendanceFilterChange}
          options={["All", "Present", "Absent", "Late"]}
          value={attendanceFilter}
        />
        <FilterSelect
          label="Risk"
          onChange={onRiskFilterChange}
          options={["All", "Good", "Average", "At Risk"]}
          value={riskFilter}
        />
      </div>
    </section>
  );
}

function StudentOverviewDialog({
  attendanceStatus,
  batch,
  onAttendanceChange,
  onClose,
  student,
}: {
  attendanceStatus: AttendanceStatus;
  batch: BatchSummary;
  onAttendanceChange: (status: AttendanceStatus, event?: MouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
  student: BatchStudent;
}) {
  const [activeSection, setActiveSection] = useState<DialogSection>("Overview");
  const overview = getStudentDialogOverview(student, batch);
  const sections: DialogSection[] = ["Overview", "Attendance", "Performance", "Topics", "Gamification"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <motion.div
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-[90vh] overflow-y-auto">
          <header className="border-b border-border bg-surface-soft p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-primary-soft text-[18px] font-extrabold text-primary-dark">
                  {student.avatarInitials}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[24px] font-extrabold text-text-primary">{student.name}</h2>
                    <AttendanceStatusPill status={attendanceStatus} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-bold text-text-secondary">
                    <span>{student.rollNumber}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail aria-hidden="true" size={15} strokeWidth={2.5} className="text-blue" />
                      {student.email}
                    </span>
                    {overview.phone ? <span>{overview.phone}</span> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InfoChip label="Batch" value={batch.batchName} />
                    <InfoChip label="Course" value={batch.course} />
                    <InfoChip label="Subject" value={batch.subject} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="h-10 self-start rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <nav className="scrollbar-none mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-surface p-1">
              {sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  className={`h-9 shrink-0 rounded-xl px-4 text-[13px] font-extrabold transition ${
                    activeSection === section
                      ? "bg-primary-soft text-primary-dark"
                      : "text-text-secondary hover:bg-surface-soft hover:text-text-primary"
                  }`}
                  onClick={() => setActiveSection(section)}
                >
                  {section === "Topics" ? "Weak & Strong Topics" : section}
                </button>
              ))}
            </nav>
          </header>

          <div className="p-5 sm:p-6">
            {activeSection === "Overview" ? <OverviewSection overview={overview} student={student} /> : null}
            {activeSection === "Attendance" ? (
              <AttendanceSection
                attendanceStatus={attendanceStatus}
                onAttendanceChange={onAttendanceChange}
                overview={overview}
                student={student}
              />
            ) : null}
            {activeSection === "Performance" ? <PerformanceSection overview={overview} /> : null}
            {activeSection === "Topics" ? <TopicsSection overview={overview} /> : null}
            {activeSection === "Gamification" ? <StudentGamificationStaffPanel studentId={student.studentId} /> : null}
          </div>

          <footer className="border-t border-border bg-surface-soft p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {(["Present", "Absent", "Late"] as AttendanceStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`h-10 rounded-2xl px-4 text-[13px] font-extrabold transition ${attendanceButtonClass(status, attendanceStatus === status)}`}
                    onClick={(event) => onAttendanceChange(status, event)}
                  >
                    Mark {status}
                  </button>
                ))}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="h-10 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                  onClick={onClose}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="h-10 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
                  onClick={() => navigateToLecturerPath(`/lecturer/batches/${batch.batchId}/students/${student.studentId}`)}
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}

function OverviewSection({ overview, student }: { overview: StudentDialogOverview; student: BatchStudent }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <DialogMetric label="Attendance" value={`${student.attendancePercentage}%`} />
      <DialogMetric label="Test Average" value={`${student.testAverage}%`} />
      <DialogMetric label="Coding Score" value={`${student.codingScore}%`} />
      <DialogMetric label="Assignments" value={`${overview.assignmentCompletion}%`} />
      <DialogMetric label="Batch Rank" value={overview.rankInBatch} />
      <DialogMetric label="Overall Status" value={student.status} />
    </div>
  );
}

function AttendanceSection({
  attendanceStatus,
  onAttendanceChange,
  overview,
  student,
}: {
  attendanceStatus: AttendanceStatus;
  onAttendanceChange: (status: AttendanceStatus, event?: MouseEvent<HTMLButtonElement>) => void;
  overview: StudentDialogOverview;
  student: BatchStudent;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-border bg-surface-soft p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-extrabold uppercase text-text-muted">Today attendance</p>
            <p className="mt-1 text-[16px] font-extrabold text-text-primary">{student.name} is marked {attendanceStatus}</p>
          </div>
          <AttendanceButtons onChange={onAttendanceChange} selectedStatus={attendanceStatus} />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <DialogMetric label="Present Count" value={overview.attendanceCounts.present} />
        <DialogMetric label="Absent Count" value={overview.attendanceCounts.absent} />
        <DialogMetric label="Late Count" value={overview.attendanceCounts.late} />
      </div>

      <section className="rounded-3xl border border-border bg-surface p-4">
        <p className="text-[15px] font-extrabold text-text-primary">Subject-wise Attendance</p>
        <div className="mt-4 space-y-3">
          {overview.subjectAttendance.map((item) => (
            <ProgressRow key={item.subject} label={item.subject} value={item.percentage} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PerformanceSection({ overview }: { overview: StudentDialogOverview }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <DialogMetric label="Weekly Test" value={`${overview.performance.weekly}%`} />
      <DialogMetric label="Monthly Test" value={`${overview.performance.monthly}%`} />
      <DialogMetric label="Final Test" value={`${overview.performance.final}%`} />
      <DialogMetric label="MCQ Score" value={`${overview.performance.mcq}%`} />
      <DialogMetric label="Q&A Score" value={`${overview.performance.qa}%`} />
      <DialogMetric label="Coding Score" value={`${overview.performance.coding}%`} />
    </div>
  );
}

function TopicsSection({ overview }: { overview: StudentDialogOverview }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TopicProgressList title="Weak Topics" topics={overview.weakTopics} tone="orange" />
      <TopicProgressList title="Strong Topics" topics={overview.strongTopics} tone="primary" />
      <section className="rounded-3xl border border-border bg-surface-soft p-4 lg:col-span-2">
        <p className="text-[15px] font-extrabold text-text-primary">Recommended Improvement Areas</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {overview.recommendedAreas.map((area) => (
            <span key={area} className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-secondary">
              {area}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function DialogMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-4">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-2 text-[18px] font-extrabold text-text-primary">{value}</p>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-text-secondary">
      <span>{label}</span>
      <strong className="text-text-primary">{value}</strong>
    </span>
  );
}

function AttendanceStatusPill({ status }: { status: AttendanceStatus }) {
  return (
    <span className={`inline-flex h-7 items-center rounded-full px-3 text-[12px] font-extrabold ${attendanceStatusClass(status)}`}>
      {status}
    </span>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-[13px] font-bold text-text-secondary">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-surface-soft">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
      </div>
    </div>
  );
}

function TopicProgressList({
  title,
  topics,
  tone,
}: {
  title: string;
  topics: Array<{ percentage: number; topic: string }>;
  tone: "orange" | "primary";
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-4">
      <p className="text-[15px] font-extrabold text-text-primary">{title}</p>
      <div className="mt-4 space-y-3">
        {topics.map((topic) => (
          <div key={topic.topic}>
            <div className="mb-2 flex items-center justify-between gap-3 text-[13px] font-bold text-text-secondary">
              <span>{topic.topic}</span>
              <span>{Math.round(topic.percentage)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-soft">
              <div
                className={`h-full rounded-full ${tone === "primary" ? "bg-primary" : "bg-orange"}`}
                style={{ width: `${Math.min(Math.max(topic.percentage, 0), 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        className="h-12 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[14px] font-extrabold text-text-primary outline-none transition focus:border-primary"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `All ${label}` : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AttendanceButtons({
  onChange,
  selectedStatus,
}: {
  onChange: (status: AttendanceStatus, event?: MouseEvent<HTMLButtonElement>) => void;
  selectedStatus: AttendanceStatus;
}) {
  return (
    <div className="flex flex-wrap justify-start gap-2 md:justify-end">
      {(["Present", "Absent", "Late"] as AttendanceStatus[]).map((status) => (
        <button
          key={status}
          type="button"
          className={`h-9 rounded-2xl px-3 text-[12px] font-extrabold transition ${attendanceButtonClass(status, selectedStatus === status)}`}
          onClick={(event) => onChange(status, event)}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

function attendanceButtonClass(status: AttendanceStatus, selected: boolean) {
  if (status === "Present") {
    return selected
      ? "bg-primary text-white"
      : "border border-border bg-surface text-text-secondary hover:border-primary hover:bg-primary-soft hover:text-primary-dark";
  }

  if (status === "Absent") {
    return selected
      ? "bg-red text-white"
      : "border border-border bg-red-soft text-red hover:border-red hover:bg-red-soft";
  }

  return selected
    ? "bg-orange text-white"
    : "border border-border bg-orange-soft text-orange hover:border-orange hover:bg-orange-soft";
}

function attendanceStatusClass(status: AttendanceStatus) {
  if (status === "Present") return "bg-primary-soft text-primary-dark";
  if (status === "Absent") return "bg-red-soft text-red";
  return "bg-orange-soft text-orange";
}

function summaryToneClass(tone: "blue" | "orange" | "primary" | "red") {
  if (tone === "blue") return "bg-blue-soft text-blue";
  if (tone === "orange") return "bg-orange-soft text-orange";
  if (tone === "red") return "bg-red-soft text-red";
  return "bg-primary-soft text-primary-dark";
}

function createInitialAttendanceRecords(students: BatchStudent[]) {
  return students.reduce<Record<string, AttendanceStatus>>((records, student) => {
    records[student.studentId] = student.attendancePercentage < 75 ? "Absent" : student.attendancePercentage < 85 ? "Late" : "Present";
    return records;
  }, {});
}

function getAttendanceSummary(students: BatchStudent[], records: Record<string, AttendanceStatus>) {
  return students.reduce(
    (summary, student) => {
      const status = records[student.studentId] ?? "Present";
      summary[status] += 1;
      return summary;
    },
    { Absent: 0, Late: 0, Present: 0, Total: students.length },
  );
}

function getStudentDialogOverview(student: BatchStudent, batch: BatchSummary): StudentDialogOverview {
  const attendancePercentage = clampPercent(student.attendancePercentage);
  const attendedSessions = 44;
  const present = Math.max(0, Math.round((attendancePercentage / 100) * attendedSessions));
  const missedSessions = Math.max(0, attendedSessions - present);
  const late = Math.max(0, Math.round(missedSessions * 0.35));
  const absent = Math.max(0, missedSessions - late);

  return {
    assignmentCompletion: clampPercent(student.assignmentCompletion ?? student.testAverage + 4),
    attendanceCounts: { absent, late, present },
    performance: {
      coding: clampPercent(student.codingScore),
      final: clampPercent(student.finalTestScore ?? student.testAverage + 1),
      mcq: clampPercent(student.mcqScore ?? student.testAverage + 2),
      monthly: clampPercent(student.monthlyTestScore ?? student.testAverage),
      qa: clampPercent(student.qaScore ?? student.testAverage - 2),
      weekly: clampPercent(student.weeklyTestScore ?? student.testAverage + 1),
    },
    phone: student.phone,
    rankInBatch: student.rankInBatch ?? `#${Math.max(1, Math.round((100 - student.testAverage) / 4) + 1)}`,
    recommendedAreas: student.recommendedAreas ?? getDefaultRecommendations(student),
    strongTopics: student.strongTopics ?? getDefaultStrongTopics(batch, student),
    subjectAttendance: student.subjectAttendance ?? getDefaultSubjectAttendance(batch, student),
    weakTopics: student.weakTopics ?? getDefaultWeakTopics(student),
  };
}

function getDefaultSubjectAttendance(batch: BatchSummary, student: BatchStudent) {
  return [
    { percentage: clampPercent(student.attendancePercentage), subject: batch.subject },
    { percentage: clampPercent(student.attendancePercentage - 3), subject: "Practice Lab" },
    { percentage: clampPercent(student.attendancePercentage + 2), subject: "Assignments" },
  ];
}

function getDefaultStrongTopics(batch: BatchSummary, student: BatchStudent) {
  const firstScore = clampPercent(Math.max(student.testAverage, student.codingScore));
  return [
    { percentage: firstScore, topic: batch.subject },
    { percentage: clampPercent(firstScore - 4), topic: student.codingScore >= 80 ? "Problem Solving" : "Core Concepts" },
  ];
}

function getDefaultWeakTopics(student: BatchStudent) {
  if (student.weakTopicsCount <= 0) {
    return [{ percentage: 78, topic: "Advanced Practice" }];
  }

  return [
    { percentage: clampPercent(student.testAverage - 18), topic: "Concept Revision" },
    { percentage: clampPercent(student.codingScore - 14), topic: "Coding Edge Cases" },
  ];
}

function getDefaultRecommendations(student: BatchStudent) {
  if (student.status === "Good") return ["Attempt one advanced mock", "Keep mentoring peer discussions"];
  if (student.status === "Average") return ["Revise weak topics twice weekly", "Submit practice reflections"];
  return ["Schedule remedial review", "Complete missed assignments this week"];
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeBatchSummary(payload: unknown, fallback: BatchSummary & { status: BatchStatus }): BatchSummary & { status: BatchStatus } {
  const record = readFirstRecord(payload);
  return {
    averageAttendance: readNumber(record.averageAttendance ?? record.attendance, fallback.averageAttendance),
    averageScore: readNumber(record.averageScore ?? record.score, fallback.averageScore),
    batchId: readString(record.batchId ?? record.id, fallback.batchId),
    batchName: readString(record.batchName ?? record.name, fallback.batchName),
    course: readString(record.course ?? record.courseName, fallback.course),
    status: normalizeBatchStatus(record.status, fallback.status),
    subject: readString(record.subject ?? record.subjectName, fallback.subject),
    totalStudents: readNumber(record.totalStudents ?? record.students, fallback.totalStudents),
    weakStudentsCount: readNumber(record.weakStudentsCount ?? record.weakStudents, fallback.weakStudentsCount),
  };
}

function normalizeBatchStudents(payload: unknown, batchId: string): BatchStudent[] {
  const records = readRecords(payload);
  if (!records.length) {
    return batchStudents.filter((student) => student.batchId === batchId);
  }

  const fallbackStudents = batchStudents.filter((student) => student.batchId === batchId);

  return records.map((record, index) => {
    const fallback = fallbackStudents[index] ?? batchStudents[index] ?? batchStudents[0];
    const name = readString(record.name ?? record.studentName, fallback.name);
    return {
      assignmentCompletion: readOptionalNumber(
        record.assignmentCompletion ?? record.assignmentCompletionPercentage ?? fallback.assignmentCompletion,
      ),
      attendancePercentage: readNumber(record.attendancePercentage ?? record.attendance, fallback.attendancePercentage),
      avatarInitials: readString(record.avatarInitials, getInitials(name)),
      batchId: readString(record.batchId, batchId),
      codingScore: readNumber(record.codingScore ?? record.codingAverage, fallback.codingScore),
      email: readString(record.email, fallback.email),
      finalTestScore: readOptionalNumber(record.finalTestScore ?? record.finalTestPerformance ?? fallback.finalTestScore),
      mcqScore: readOptionalNumber(record.mcqScore ?? record.mcqAverage ?? fallback.mcqScore),
      monthlyTestScore: readOptionalNumber(record.monthlyTestScore ?? record.monthlyTestPerformance ?? fallback.monthlyTestScore),
      name,
      phone: readOptionalString(record.phone ?? record.phoneNumber ?? fallback.phone),
      profilePicture: readOptionalString(record.profilePicture ?? record.profilePhoto ?? fallback.profilePicture),
      profileImageUrl: readOptionalString(record.profileImageUrl ?? record.avatarUrl ?? fallback.profileImageUrl),
      qaScore: readOptionalNumber(record.qaScore ?? record.qaAverage ?? fallback.qaScore),
      rankInBatch: readOptionalString(record.rankInBatch ?? record.rank ?? fallback.rankInBatch),
      recommendedAreas: readStringArray(record.recommendedAreas) ?? fallback.recommendedAreas,
      rollNumber: readString(record.rollNumber ?? record.rollNo, fallback.rollNumber),
      status: normalizeRiskStatus(record.status ?? record.riskStatus, fallback.status),
      strongTopics: normalizeTopicScores(record.strongTopics) ?? fallback.strongTopics,
      studentId: readString(record.studentId ?? record.id, fallback.studentId),
      subjectAttendance: normalizeSubjectAttendance(record.subjectAttendance ?? record.attendanceBySubject) ?? fallback.subjectAttendance,
      testAverage: readNumber(record.testAverage ?? record.averageScore, fallback.testAverage),
      weeklyTestScore: readOptionalNumber(record.weeklyTestScore ?? record.weeklyTestPerformance ?? fallback.weeklyTestScore),
      weakTopicsCount: readNumber(record.weakTopicsCount ?? record.weakTopics, fallback.weakTopicsCount),
      weakTopics: normalizeTopicScores(record.weakTopics) ?? fallback.weakTopics,
    };
  });
}

function readRecords(payload: unknown) {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  const record = isRecord(payload) ? payload : {};
  const value = record.students ?? record.data ?? record.items ?? record.batches;
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function readFirstRecord(payload: unknown) {
  if (isRecord(payload)) {
    const value = payload.batch ?? payload.data;
    return isRecord(value) ? value : payload;
  }
  const records = readRecords(payload);
  return records[0] ?? {};
}

function normalizeBatchStatus(value: unknown, fallback: BatchStatus): BatchStatus {
  if (value === "Active" || value === "Needs Attention" || value === "Completed") return value;
  return fallback;
}

function normalizeRiskStatus(value: unknown, fallback: StudentRiskStatus): StudentRiskStatus {
  if (value === "Good" || value === "Average" || value === "At Risk") return value;
  return fallback;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeSubjectAttendance(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const items = value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const subject = readString(item.subject ?? item.subjectName ?? item.name, "");
    if (!subject) return [];
    return [
      {
        percentage: clampPercent(readNumber(item.percentage ?? item.attendance ?? item.value, 0)),
        subject,
      },
    ];
  });

  return items.length ? items : undefined;
}

function normalizeTopicScores(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const topics = value.flatMap((item) => {
    if (typeof item === "string" && item.trim()) {
      return [{ percentage: 70, topic: item.trim() }];
    }

    if (!isRecord(item)) return [];
    const topic = readString(item.topic ?? item.name ?? item.title, "");
    if (!topic) return [];
    return [
      {
        percentage: clampPercent(readNumber(item.percentage ?? item.score ?? item.accuracy, 70)),
        topic,
      },
    ];
  });

  return topics.length ? topics : undefined;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
  return items.length ? items : undefined;
}

function readOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
