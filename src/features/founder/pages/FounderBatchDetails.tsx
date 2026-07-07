import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpenCheck, GraduationCap, Mail, Search, ShieldAlert, Trophy, UsersRound, type LucideIcon } from "lucide-react";
import { StudentAttendanceTable } from "../../../shared/components/ui/StudentAttendanceTable";

type AttendanceStatus = "Absent" | "Late" | "Present";
type DialogSection = "Attendance" | "Overview" | "Performance" | "Topics";
type RiskStatus = "At Risk" | "Average" | "Good";

type FounderBatchSummary = {
  averageAttendance: number;
  averageScore: number;
  batchId: string;
  batchName: string;
  course: string;
  subject: string;
  totalStudents: number;
  weakStudentsCount: number;
};

type FounderStudent = {
  assignmentCompletion: number;
  attendancePercentage: number;
  avatarInitials: string;
  batchId: string;
  codingScore: number;
  email: string;
  finalTestScore: number;
  mcqScore: number;
  monthlyTestScore: number;
  name: string;
  phone?: string;
  profileImageUrl?: string;
  profilePicture?: string;
  qaScore: number;
  rankInBatch: string;
  recommendedAreas: string[];
  rollNumber: string;
  status: RiskStatus;
  strongTopics: Array<{ percentage: number; topic: string }>;
  studentId: string;
  subjectAttendance: Array<{ percentage: number; subject: string }>;
  testAverage: number;
  weeklyTestScore: number;
  weakTopics: Array<{ percentage: number; topic: string }>;
  weakTopicsCount: number;
};

type StudentDialogOverview = {
  attendanceCounts: {
    absent: number;
    late: number;
    present: number;
  };
};

const lightCard = "rounded-3xl border border-border bg-surface shadow-card";

const batchSummaries: FounderBatchSummary[] = [
  {
    averageAttendance: 92,
    averageScore: 84,
    batchId: "jfs-2026-a",
    batchName: "JFS-2026-A",
    course: "Java Full Stack",
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
    subject: "Collections",
    totalStudents: 29,
    weakStudentsCount: 2,
  },
];

const students: FounderStudent[] = [
  {
    assignmentCompletion: 91,
    attendancePercentage: 94,
    avatarInitials: "CH",
    batchId: "jfs-2026-a",
    codingScore: 88,
    email: "chaitanya@fengari.me",
    finalTestScore: 86,
    mcqScore: 89,
    monthlyTestScore: 84,
    name: "Chaitanya",
    phone: "+91 98765 43210",
    qaScore: 82,
    rankInBatch: "#5",
    recommendedAreas: ["Revise authentication filters", "Practice 2 security MCQs daily"],
    rollNumber: "JFS-A-001",
    status: "Good",
    strongTopics: [{ percentage: 92, topic: "Spring Boot APIs" }, { percentage: 88, topic: "Java Collections" }],
    studentId: "stu-chaitanya",
    subjectAttendance: [{ percentage: 94, subject: "Spring Boot" }, { percentage: 90, subject: "React" }, { percentage: 92, subject: "MySQL" }],
    testAverage: 86,
    weeklyTestScore: 87,
    weakTopics: [{ percentage: 62, topic: "Spring Security" }],
    weakTopicsCount: 1,
  },
  {
    assignmentCompletion: 78,
    attendancePercentage: 84,
    avatarInitials: "AY",
    batchId: "jfs-2026-a",
    codingScore: 72,
    email: "ayush@fengari.me",
    finalTestScore: 78,
    mcqScore: 79,
    monthlyTestScore: 76,
    name: "Ayush",
    phone: "+91 98765 11122",
    qaScore: 75,
    rankInBatch: "#11",
    recommendedAreas: ["Complete SQL joins worksheet", "Review recursion dry runs"],
    rollNumber: "JFS-A-002",
    status: "Average",
    strongTopics: [{ percentage: 84, topic: "React Basics" }, { percentage: 81, topic: "Java OOP" }],
    studentId: "stu-ayush",
    subjectAttendance: [{ percentage: 84, subject: "Spring Boot" }, { percentage: 80, subject: "React" }, { percentage: 76, subject: "MySQL" }],
    testAverage: 76,
    weeklyTestScore: 78,
    weakTopics: [{ percentage: 58, topic: "SQL Joins" }, { percentage: 64, topic: "Recursion" }, { percentage: 66, topic: "State Management" }],
    weakTopicsCount: 3,
  },
  {
    assignmentCompletion: 62,
    attendancePercentage: 72,
    avatarInitials: "DU",
    batchId: "jfs-2026-a",
    codingScore: 61,
    email: "durshant@fengari.me",
    finalTestScore: 65,
    mcqScore: 66,
    monthlyTestScore: 61,
    name: "Durshant",
    phone: "+91 98765 22233",
    qaScore: 59,
    rankInBatch: "#18",
    recommendedAreas: ["Attend remedial Spring Security session", "Submit overdue API assignment"],
    rollNumber: "JFS-A-003",
    status: "At Risk",
    strongTopics: [{ percentage: 76, topic: "Core Java" }, { percentage: 72, topic: "HTML/CSS" }],
    studentId: "stu-durshant",
    subjectAttendance: [{ percentage: 72, subject: "Spring Boot" }, { percentage: 68, subject: "React" }, { percentage: 70, subject: "MySQL" }],
    testAverage: 64,
    weeklyTestScore: 63,
    weakTopics: [{ percentage: 45, topic: "Spring Security" }, { percentage: 50, topic: "SQL Joins" }, { percentage: 55, topic: "Coding edge cases" }],
    weakTopicsCount: 5,
  },
  {
    assignmentCompletion: 96,
    attendancePercentage: 91,
    avatarInitials: "AN",
    batchId: "jfs-2026-a",
    codingScore: 94,
    email: "aniket@fengari.me",
    finalTestScore: 92,
    mcqScore: 94,
    monthlyTestScore: 90,
    name: "Aniket",
    phone: "+91 98765 33344",
    qaScore: 88,
    rankInBatch: "#2",
    recommendedAreas: ["Attempt advanced coding mock", "Mentor peers in DP practice"],
    rollNumber: "JFS-A-004",
    status: "Good",
    strongTopics: [{ percentage: 96, topic: "Dynamic Programming" }, { percentage: 93, topic: "Spring Boot" }],
    studentId: "stu-aniket",
    subjectAttendance: [{ percentage: 91, subject: "Spring Boot" }, { percentage: 94, subject: "React" }, { percentage: 92, subject: "MySQL" }],
    testAverage: 91,
    weeklyTestScore: 93,
    weakTopics: [{ percentage: 78, topic: "System Design Basics" }],
    weakTopicsCount: 0,
  },
  {
    assignmentCompletion: 78,
    attendancePercentage: 81,
    avatarInitials: "MS",
    batchId: "jfs-2026-b",
    codingScore: 75,
    email: "meera@fengari.me",
    finalTestScore: 79,
    mcqScore: 80,
    monthlyTestScore: 77,
    name: "Meera Shah",
    qaScore: 74,
    rankInBatch: "#9",
    recommendedAreas: ["Review hooks practice", "Improve weekly submissions"],
    rollNumber: "JFS-B-001",
    status: "Average",
    strongTopics: [{ percentage: 84, topic: "React Components" }],
    studentId: "stu-meera",
    subjectAttendance: [{ percentage: 81, subject: "React" }, { percentage: 78, subject: "JavaScript" }],
    testAverage: 78,
    weeklyTestScore: 77,
    weakTopics: [{ percentage: 61, topic: "Hooks" }, { percentage: 65, topic: "API State" }],
    weakTopicsCount: 2,
  },
  {
    assignmentCompletion: 58,
    attendancePercentage: 69,
    avatarInitials: "RV",
    batchId: "jfs-2026-b",
    codingScore: 58,
    email: "rahul@fengari.me",
    finalTestScore: 61,
    mcqScore: 60,
    monthlyTestScore: 58,
    name: "Rahul Verma",
    qaScore: 55,
    rankInBatch: "#24",
    recommendedAreas: ["Attend recovery class", "Submit missing assignments"],
    rollNumber: "JFS-B-002",
    status: "At Risk",
    strongTopics: [{ percentage: 70, topic: "HTML/CSS" }],
    studentId: "stu-rahul",
    subjectAttendance: [{ percentage: 69, subject: "React" }, { percentage: 65, subject: "JavaScript" }],
    testAverage: 62,
    weeklyTestScore: 60,
    weakTopics: [{ percentage: 42, topic: "State Management" }, { percentage: 47, topic: "Async JS" }],
    weakTopicsCount: 6,
  },
  {
    assignmentCompletion: 89,
    attendancePercentage: 93,
    avatarInitials: "NK",
    batchId: "py-2026-a",
    codingScore: 87,
    email: "neha@fengari.me",
    finalTestScore: 86,
    mcqScore: 88,
    monthlyTestScore: 85,
    name: "Neha Kumar",
    qaScore: 83,
    rankInBatch: "#4",
    recommendedAreas: ["Practice advanced API problems"],
    rollNumber: "PY-A-001",
    status: "Good",
    strongTopics: [{ percentage: 90, topic: "Python APIs" }],
    studentId: "stu-neha",
    subjectAttendance: [{ percentage: 93, subject: "Python APIs" }, { percentage: 91, subject: "Django" }],
    testAverage: 85,
    weeklyTestScore: 86,
    weakTopics: [{ percentage: 70, topic: "ORM Queries" }],
    weakTopicsCount: 1,
  },
];

export function FounderBatchDetails({ batchId = "jfs-2026-a" }: { batchId?: string }) {
  const batch = batchSummaries.find((item) => item.batchId === batchId) ?? batchSummaries[0];
  const batchStudents = useMemo(() => students.filter((student) => student.batchId === batch.batchId), [batch.batchId]);
  const initialAttendanceRecords = useMemo(() => createInitialAttendanceRecords(batchStudents), [batchStudents]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>(initialAttendanceRecords);
  const [searchValue, setSearchValue] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<FounderStudent | null>(null);

  useEffect(() => {
    setAttendanceRecords(initialAttendanceRecords);
  }, [initialAttendanceRecords]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return batchStudents;

    return batchStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.rollNumber.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch),
    );
  }, [batchStudents, searchValue]);

  const summary = getAttendanceSummary(batchStudents, attendanceRecords);
  const strongStudents = batchStudents.filter((student) => student.status === "Good").length;
  const weakStudents = batchStudents.filter((student) => student.status === "At Risk").length;

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus, event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setAttendanceRecords((records) => ({ ...records, [studentId]: status }));
  };

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <BatchHeader batch={batch} />
      <AttendanceSummaryCards summary={summary} />

      <section className={`${lightCard} p-4 sm:p-5`}>
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
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search student, roll number, email"
            value={searchValue}
          />
        </label>
      </section>

      <StudentAttendanceTable
        attendanceRecords={attendanceRecords}
        emptyDescription="Try changing the search term."
        onAttendanceChange={handleAttendanceChange}
        onOpenStudent={setSelectedStudent}
        students={filteredStudents}
      />

      <FounderBatchGraphs batch={batch} students={batchStudents} />
      <WeakStrongSummary strongStudents={strongStudents} totalStudents={batchStudents.length} weakStudents={weakStudents} />

      {selectedStudent ? (
        <StudentOverviewDialog
          attendanceStatus={attendanceRecords[selectedStudent.studentId] ?? "Present"}
          batch={batch}
          onAttendanceChange={(status, event) => handleAttendanceChange(selectedStudent.studentId, status, event)}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
        />
      ) : null}
    </motion.section>
  );
}

function BatchHeader({ batch }: { batch: FounderBatchSummary }) {
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

function AttendanceSummaryCards({ summary }: { summary: Record<"Absent" | "Late" | "Present" | "Total", number> }) {
  const cards = [
    { icon: UsersRound, label: "Total Students", tone: "blue" as const, value: summary.Total },
    { icon: BookOpenCheck, label: "Present Students", tone: "primary" as const, value: summary.Present },
    { icon: ShieldAlert, label: "Absent Students", tone: "red" as const, value: summary.Absent },
    { icon: GraduationCap, label: "Late Students", tone: "orange" as const, value: summary.Late },
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

function FounderBatchGraphs({ batch, students }: { batch: FounderBatchSummary; students: FounderStudent[] }) {
  const graphData = students.map((student) => ({
    attendance: student.attendancePercentage,
    name: student.name.split(" ")[0],
    score: student.testAverage,
    strong: student.status === "Good" ? student.testAverage : 0,
    weak: student.status === "At Risk" ? 100 - student.testAverage : 0,
  }));

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <GraphCard title="Batch Performance" description={`${batch.batchName} student performance trend.`}>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={graphData}>
            <defs>
              <linearGradient id="founderBatchPerformance" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#58CC02" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#58CC02" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} />
            <Tooltip />
            <Area dataKey="score" fill="url(#founderBatchPerformance)" stroke="#58CC02" strokeWidth={3} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </GraphCard>

      <GraphCard title="Attendance Graph" description="Attendance percentage by student.">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={graphData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} />
            <Tooltip />
            <Bar dataKey="attendance" fill="#1CB0F6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GraphCard>

      <GraphCard title="Test Performance Graph" description="Average test score by student.">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={graphData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} />
            <Tooltip />
            <Line dataKey="score" dot={{ fill: "#58CC02", r: 5 }} stroke="#58CC02" strokeWidth={3} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </GraphCard>

      <GraphCard title="Weak / Strong Students" description="Strong performers compared with at-risk students.">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={graphData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} />
            <Tooltip />
            <Bar dataKey="strong" fill="#58CC02" radius={[10, 10, 0, 0]} />
            <Bar dataKey="weak" fill="#FF9600" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GraphCard>
    </section>
  );
}

function WeakStrongSummary({
  strongStudents,
  totalStudents,
  weakStudents,
}: {
  strongStudents: number;
  totalStudents: number;
  weakStudents: number;
}) {
  const averageStudents = Math.max(0, totalStudents - strongStudents - weakStudents);
  return (
    <section className={`${lightCard} p-5 sm:p-6`}>
      <h2 className="text-[21px] font-extrabold text-text-primary">Weak / Strong Students Summary</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <SummaryBlock icon={Trophy} label="Strong Students" tone="primary" value={strongStudents} />
        <SummaryBlock icon={GraduationCap} label="Average Students" tone="blue" value={averageStudents} />
        <SummaryBlock icon={ShieldAlert} label="Weak Students" tone="orange" value={weakStudents} />
      </div>
    </section>
  );
}

function GraphCard({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <article className={`${lightCard} p-5 sm:p-6`}>
      <h2 className="text-[21px] font-extrabold text-text-primary">{title}</h2>
      <p className="mt-1 text-[14px] text-text-secondary">{description}</p>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function SummaryBlock({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "blue" | "orange" | "primary";
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${summaryToneClass(tone)}`}>
        <Icon aria-hidden="true" size={20} strokeWidth={2.5} />
      </span>
      <p className="mt-3 text-[26px] font-extrabold text-text-primary">{value}</p>
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
    </div>
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
  batch: FounderBatchSummary;
  onAttendanceChange: (status: AttendanceStatus, event?: MouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
  student: FounderStudent;
}) {
  const [activeSection, setActiveSection] = useState<DialogSection>("Overview");
  const overview = getStudentDialogOverview(student);
  const sections: DialogSection[] = ["Overview", "Attendance", "Performance", "Topics"];

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
                    {student.phone ? <span>{student.phone}</span> : null}
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
            {activeSection === "Overview" ? <OverviewSection student={student} /> : null}
            {activeSection === "Attendance" ? (
              <AttendanceSection
                attendanceStatus={attendanceStatus}
                onAttendanceChange={onAttendanceChange}
                overview={overview}
                student={student}
              />
            ) : null}
            {activeSection === "Performance" ? <PerformanceSection student={student} /> : null}
            {activeSection === "Topics" ? <TopicsSection student={student} /> : null}
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
              <button
                type="button"
                className="h-10 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}

function OverviewSection({ student }: { student: FounderStudent }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <DialogMetric label="Attendance" value={`${student.attendancePercentage}%`} />
      <DialogMetric label="Test Average" value={`${student.testAverage}%`} />
      <DialogMetric label="Coding Score" value={`${student.codingScore}%`} />
      <DialogMetric label="Assignments" value={`${student.assignmentCompletion}%`} />
      <DialogMetric label="Batch Rank" value={student.rankInBatch} />
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
  student: FounderStudent;
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
          {student.subjectAttendance.map((item) => (
            <ProgressRow key={item.subject} label={item.subject} value={item.percentage} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PerformanceSection({ student }: { student: FounderStudent }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <DialogMetric label="Weekly Test" value={`${student.weeklyTestScore}%`} />
      <DialogMetric label="Monthly Test" value={`${student.monthlyTestScore}%`} />
      <DialogMetric label="Final Test" value={`${student.finalTestScore}%`} />
      <DialogMetric label="MCQ Score" value={`${student.mcqScore}%`} />
      <DialogMetric label="Q&A Score" value={`${student.qaScore}%`} />
      <DialogMetric label="Coding Score" value={`${student.codingScore}%`} />
    </div>
  );
}

function TopicsSection({ student }: { student: FounderStudent }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TopicProgressList title="Weak Topics" topics={student.weakTopics} tone="orange" />
      <TopicProgressList title="Strong Topics" topics={student.strongTopics} tone="primary" />
      <section className="rounded-3xl border border-border bg-surface-soft p-4 lg:col-span-2">
        <p className="text-[15px] font-extrabold text-text-primary">Recommended Improvement Areas</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {student.recommendedAreas.map((area) => (
            <span key={area} className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-secondary">
              {area}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function DialogMetric({ label, value }: { label: string; value: number | string }) {
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
        <div className="h-full rounded-full bg-primary" style={{ width: `${clampPercent(value)}%` }} />
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
          <ProgressRow key={topic.topic} label={topic.topic} value={topic.percentage} />
        ))}
      </div>
    </section>
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

function createInitialAttendanceRecords(batchStudents: FounderStudent[]) {
  return batchStudents.reduce<Record<string, AttendanceStatus>>((records, student) => {
    records[student.studentId] = student.attendancePercentage < 75 ? "Absent" : student.attendancePercentage < 85 ? "Late" : "Present";
    return records;
  }, {});
}

function getAttendanceSummary(batchStudents: FounderStudent[], records: Record<string, AttendanceStatus>) {
  return batchStudents.reduce(
    (summary, student) => {
      const status = records[student.studentId] ?? "Present";
      summary[status] += 1;
      return summary;
    },
    { Absent: 0, Late: 0, Present: 0, Total: batchStudents.length },
  );
}

function getStudentDialogOverview(student: FounderStudent): StudentDialogOverview {
  const attendedSessions = 44;
  const present = Math.max(0, Math.round((student.attendancePercentage / 100) * attendedSessions));
  const missedSessions = Math.max(0, attendedSessions - present);
  const late = Math.max(0, Math.round(missedSessions * 0.35));
  const absent = Math.max(0, missedSessions - late);

  return {
    attendanceCounts: { absent, late, present },
  };
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}
