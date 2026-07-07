import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Code2,
  Coins,
  FileText,
  Flame,
  Hash,
  Mail,
  Phone,
  ShieldAlert,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StudentGamificationStaffPanel } from "../../student/components/gamification";
import { LecturerBackButton } from "../components/LecturerPrimitives";
import { getLecturerApiStatusMessage, getStudentFullProfileApiData } from "../services/lecturerApi";

type StudentStatus = "Good" | "Average" | "At Risk";
type Tone = "blue" | "cyan" | "green" | "orange" | "purple" | "red";

type StudentMetric = {
  icon: LucideIcon;
  label: string;
  tone: Tone;
  value: string;
};

type StudentProfileGamificationSummary = {
  badgesCount: number;
  coins: number;
  level: string;
  streak: string;
  xp: number;
};

type StudentProfileData = {
  academicScores: Array<{
    coding: number;
    final: number;
    mcq: number;
    monthly: number;
    qa: number;
    week: string;
    weekly: number;
  }>;
  activity: {
    assignments: Array<{ item: string; meta: string; status: string }>;
    coding: Array<{ item: string; meta: string; status: string }>;
    tests: Array<{ item: string; meta: string; status: string }>;
  };
  assignmentCompletion: number;
  attendance: {
    absent: number;
    late: number;
    overall: number;
    present: number;
    subjectWise: Array<{ percentage: number; subject: string }>;
    trend: Array<{ month: string; value: number }>;
  };
  attendancePercentage: number;
  batch: string;
  codingAverage: number;
  course: string;
  email: string;
  finalTestPerformance: number;
  gamification?: StudentProfileGamificationSummary;
  mcqAverage: number;
  monthlyTestPerformance: number;
  name: string;
  overallScore: number;
  phone: string;
  rankInBatch: string;
  recommendations: string[];
  rollNumber: string;
  status: StudentStatus;
  strongTopics: Array<{ percentage: number; topic: string }>;
  subject: string;
  testAverage: number;
  weakTopics: Array<{ percentage: number; topic: string }>;
  weeklyTestPerformance: number;
};

const studentProfiles: Record<string, StudentProfileData> = {
  "stu-chaitanya": {
    academicScores: [
      { coding: 72, final: 74, mcq: 76, monthly: 72, qa: 70, week: "W1", weekly: 74 },
      { coding: 78, final: 78, mcq: 82, monthly: 76, qa: 75, week: "W2", weekly: 80 },
      { coding: 84, final: 82, mcq: 86, monthly: 81, qa: 78, week: "W3", weekly: 83 },
      { coding: 88, final: 86, mcq: 89, monthly: 84, qa: 82, week: "W4", weekly: 87 },
    ],
    activity: {
      assignments: [
        { item: "Spring Boot CRUD APIs", meta: "Submitted yesterday", status: "Reviewed" },
        { item: "React State Worksheet", meta: "Due Jul 03", status: "Pending" },
      ],
      coding: [
        { item: "Valid Parentheses", meta: "Java · 72ms", status: "Accepted" },
        { item: "Longest Substring", meta: "Java · Needs edge case review", status: "Review" },
      ],
      tests: [
        { item: "Spring Security Checkpoint", meta: "86/100 · Rank #6", status: "Completed" },
        { item: "Monthly Java Test", meta: "82/100 · 2 attempts", status: "Completed" },
      ],
    },
    assignmentCompletion: 91,
    attendance: {
      absent: 3,
      late: 2,
      overall: 92,
      present: 46,
      subjectWise: [
        { percentage: 94, subject: "Spring Boot" },
        { percentage: 90, subject: "React" },
        { percentage: 92, subject: "MySQL" },
        { percentage: 88, subject: "Aptitude" },
      ],
      trend: [
        { month: "Jan", value: 84 },
        { month: "Feb", value: 88 },
        { month: "Mar", value: 91 },
        { month: "Apr", value: 87 },
        { month: "May", value: 92 },
        { month: "Jun", value: 94 },
      ],
    },
    attendancePercentage: 92,
    batch: "JFS-2026-A",
    codingAverage: 88,
    course: "Java Full Stack",
    email: "chaitanya@fengari.me",
    finalTestPerformance: 86,
    mcqAverage: 89,
    monthlyTestPerformance: 84,
    name: "Chaitanya",
    overallScore: 86,
    phone: "+91 98765 43210",
    rankInBatch: "#5",
    recommendations: ["Revise Spring Security filters", "Practice SQL joins under time limit", "Attempt 2 medium coding problems daily"],
    rollNumber: "JFS-A-001",
    status: "Good",
    strongTopics: [
      { percentage: 94, topic: "Java Collections" },
      { percentage: 91, topic: "React Components" },
      { percentage: 88, topic: "REST APIs" },
    ],
    subject: "Spring Boot",
    testAverage: 86,
    weakTopics: [
      { percentage: 62, topic: "Spring Security" },
      { percentage: 68, topic: "SQL Joins" },
      { percentage: 71, topic: "Aptitude Speed" },
    ],
    weeklyTestPerformance: 87,
  },
  "stu-ayush": {
    academicScores: [
      { coding: 62, final: 66, mcq: 68, monthly: 65, qa: 64, week: "W1", weekly: 67 },
      { coding: 68, final: 70, mcq: 72, monthly: 70, qa: 69, week: "W2", weekly: 73 },
      { coding: 72, final: 74, mcq: 76, monthly: 73, qa: 72, week: "W3", weekly: 75 },
      { coding: 74, final: 78, mcq: 79, monthly: 76, qa: 75, week: "W4", weekly: 78 },
    ],
    activity: {
      assignments: [{ item: "React Hooks Worksheet", meta: "Due tomorrow", status: "Pending" }],
      coding: [{ item: "Two Sum", meta: "Java · Accepted", status: "Accepted" }],
      tests: [{ item: "SQL Join Practice", meta: "76/100", status: "Completed" }],
    },
    assignmentCompletion: 78,
    attendance: {
      absent: 5,
      late: 3,
      overall: 84,
      present: 42,
      subjectWise: [
        { percentage: 82, subject: "Spring Boot" },
        { percentage: 86, subject: "React" },
        { percentage: 84, subject: "MySQL" },
      ],
      trend: [
        { month: "Jan", value: 78 },
        { month: "Feb", value: 82 },
        { month: "Mar", value: 80 },
        { month: "Apr", value: 83 },
        { month: "May", value: 84 },
        { month: "Jun", value: 86 },
      ],
    },
    attendancePercentage: 84,
    batch: "JFS-2026-A",
    codingAverage: 74,
    course: "Java Full Stack",
    email: "ayush@fengari.me",
    finalTestPerformance: 78,
    mcqAverage: 79,
    monthlyTestPerformance: 76,
    name: "Ayush",
    overallScore: 78,
    phone: "+91 98765 11122",
    rankInBatch: "#11",
    recommendations: ["Practice SQL joins", "Improve attendance consistency", "Review coding edge cases"],
    rollNumber: "JFS-A-002",
    status: "Average",
    strongTopics: [{ percentage: 84, topic: "React Basics" }, { percentage: 81, topic: "Java OOP" }],
    subject: "Spring Boot",
    testAverage: 76,
    weakTopics: [{ percentage: 58, topic: "SQL Joins" }, { percentage: 64, topic: "Recursion" }],
    weeklyTestPerformance: 78,
  },
};

const fallbackProfile = studentProfiles["stu-chaitanya"];
const glassCard =
  "rounded-[28px] border border-white/10 bg-white/[0.065] shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl";
const chartTooltipStyle = {
  background: "rgba(15, 23, 42, 0.94)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  borderRadius: 16,
  color: "#E5E7EB",
};

export function LecturerStudentProfile({ batchId, studentId }: { batchId?: string; studentId?: string }) {
  const fallbackStudent = (studentId ? studentProfiles[studentId] : undefined) ?? fallbackProfile;
  const [student, setStudent] = useState<StudentProfileData>(fallbackStudent);
  const [apiState, setApiState] = useState({ error: "", loading: Boolean(batchId && studentId) });

  useEffect(() => {
    if (!batchId || !studentId) {
      setStudent(fallbackStudent);
      setApiState({ error: "", loading: false });
      return;
    }

    let active = true;

    getStudentFullProfileApiData(batchId, studentId)
      .then((payload) => {
        if (!active) return;
        setStudent(normalizeStudentProfileData(payload, fallbackStudent));
        setApiState({ error: "", loading: false });
      })
      .catch((error) => {
        if (!active) return;
        setStudent(fallbackStudent);
        setApiState({ error: getLecturerApiStatusMessage(error), loading: false });
      });

    return () => {
      active = false;
    };
  }, [batchId, fallbackStudent, studentId]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-[36px] bg-[#070B19] p-4 text-slate-100 sm:p-5 lg:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(168,85,247,0.20),transparent_28%),linear-gradient(135deg,rgba(59,130,246,0.08),rgba(15,23,42,0))]" />

      <div className="relative space-y-6">
        <LecturerBackButton label="Back to Batch" variant="dark" />
        <ApiStateNotice error={apiState.error} loading={apiState.loading} />
        <StudentHeader student={student} studentId={studentId} />
        <PerformanceCards student={student} />
        <StudentGamificationStaffPanel studentId={studentId} variant="dark" />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,58fr)_minmax(320px,42fr)]">
          <AttendanceAnalytics student={student} />
          <AcademicAnalytics student={student} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <TopicsPanel student={student} />
          <RecentActivity student={student} />
        </section>
      </div>
    </motion.div>
  );
}

function StudentHeader({ student, studentId }: { student: StudentProfileData; studentId?: string }) {
  const gamification = getStudentGamificationSummary(student);
  const attendanceStatus = getAttendanceStatus(student.attendancePercentage);
  const profileDetails: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: Hash, label: "Roll number", value: student.rollNumber },
    { icon: Hash, label: "Student ID", value: studentId ?? "Not available" },
    { icon: BookOpenCheck, label: "Batch", value: student.batch },
    { icon: ClipboardList, label: "Course", value: student.course },
    { icon: FileText, label: "Subject", value: student.subject },
    { icon: Mail, label: "Email", value: student.email },
    { icon: Phone, label: "Phone", value: student.phone },
    { icon: Trophy, label: "Rank", value: student.rankInBatch || "Not ranked" },
  ];

  const gamificationStats: Array<{ icon: LucideIcon; label: string; tone: Tone; value: string }> = [
    { icon: Zap, label: "XP", tone: "cyan", value: formatProfileNumber(gamification.xp) },
    { icon: Star, label: "Level", tone: "purple", value: gamification.level },
    { icon: Coins, label: "Coins", tone: "orange", value: formatProfileNumber(gamification.coins) },
    { icon: Flame, label: "Streak", tone: "red", value: gamification.streak },
    { icon: BadgeCheck, label: "Badges", tone: "green", value: String(gamification.badgesCount) },
    { icon: Trophy, label: "Rank", tone: "cyan", value: student.rankInBatch || "-" },
  ];

  return (
    <section className={`${glassCard} p-4 sm:p-5`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.35fr)_minmax(280px,0.95fr)]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300/25 to-purple-400/25 text-[17px] font-extrabold text-white ring-1 ring-white/10">
              {getStudentInitials(student.name)}
            </span>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-extrabold uppercase text-cyan-200">
                Student Profile
              </span>
              <h1 className="mt-2 truncate text-[24px] font-extrabold leading-tight text-white sm:text-[28px]">{student.name}</h1>
              <p className="mt-1 text-[13px] font-semibold text-slate-400">{student.rollNumber}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ProfileChip label={attendanceStatus} tone={getAttendanceTone(student.attendancePercentage)} />
            <ProfileChip label={`Performance: ${student.status}`} tone={getPerformanceTone(student.status)} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {profileDetails.map((item) => (
            <ProfileInfoItem key={item.label} item={item} />
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-extrabold text-white">Gamification</p>
              <p className="mt-1 text-[12px] font-semibold text-slate-500">Compact learner snapshot</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              <Zap aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {gamificationStats.map((stat) => (
              <ProfileStatTile key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileInfoItem({ item }: { item: { icon: LucideIcon; label: string; value: string } }) {
  const Icon = item.icon;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
        <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase text-slate-500">{item.label}</p>
        <p className="mt-0.5 truncate text-[13px] font-extrabold text-slate-100" title={item.value}>
          {item.value}
        </p>
      </div>
    </div>
  );
}

function ProfileStatTile({ stat }: { stat: { icon: LucideIcon; label: string; tone: Tone; value: string } }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-extrabold uppercase text-slate-500">{stat.label}</p>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl ${toneClass(stat.tone)}`}>
          <Icon aria-hidden="true" size={14} strokeWidth={2.5} />
        </span>
      </div>
      <p className="mt-2 truncate text-[16px] font-extrabold text-white" title={stat.value}>
        {stat.value}
      </p>
    </div>
  );
}

function ProfileChip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-[11px] font-extrabold ${profileChipClass(tone)}`}>
      {label}
    </span>
  );
}

function getStudentInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStudentGamificationSummary(student: StudentProfileData): StudentProfileGamificationSummary {
  const scoreBase = Math.max(student.overallScore, student.testAverage, student.codingAverage);
  const xp = Math.max(1500, Math.round(student.overallScore * 85 + student.codingAverage * 42 + student.assignmentCompletion * 28));
  const levelNumber = Math.max(1, Math.floor(xp / 1500));
  const streakDays = Math.max(3, Math.round(student.attendancePercentage / 9));

  const fallbackSummary = {
    badgesCount: Math.max(2, Math.round(scoreBase / 15)),
    coins: Math.max(100, Math.round(xp / 18)),
    level: `Level ${levelNumber}`,
    streak: `${streakDays} days`,
    xp,
  };

  if (!student.gamification) return fallbackSummary;

  return {
    badgesCount: student.gamification.badgesCount || fallbackSummary.badgesCount,
    coins: student.gamification.coins || fallbackSummary.coins,
    level: student.gamification.level || fallbackSummary.level,
    streak: student.gamification.streak && student.gamification.streak !== "0 days" ? student.gamification.streak : fallbackSummary.streak,
    xp: student.gamification.xp || fallbackSummary.xp,
  };
}

function getAttendanceStatus(attendancePercentage: number) {
  if (attendancePercentage >= 90) return "Attendance: Excellent";
  if (attendancePercentage >= 80) return "Attendance: Good";
  if (attendancePercentage >= 70) return "Attendance: Needs Focus";
  return "Attendance: At Risk";
}

function getAttendanceTone(attendancePercentage: number): Tone {
  if (attendancePercentage >= 90) return "green";
  if (attendancePercentage >= 80) return "cyan";
  if (attendancePercentage >= 70) return "orange";
  return "red";
}

function getPerformanceTone(status: StudentStatus): Tone {
  if (status === "Good") return "green";
  if (status === "Average") return "blue";
  return "orange";
}

function profileChipClass(tone: Tone) {
  if (tone === "blue") return "border-blue-300/20 bg-blue-300/10 text-blue-100";
  if (tone === "green") return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (tone === "orange") return "border-orange-300/20 bg-orange-300/10 text-orange-100";
  if (tone === "purple") return "border-purple-300/20 bg-purple-300/10 text-purple-100";
  if (tone === "red") return "border-rose-300/20 bg-rose-300/10 text-rose-100";
  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

function formatProfileNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function ApiStateNotice({ error, loading }: { error: string; loading: boolean }) {
  if (!loading && !error) return null;

  return (
    <div className="flex justify-end">
      <span className="inline-flex h-8 items-center rounded-full bg-white/[0.06] px-3 text-[12px] font-extrabold text-slate-400">
        {loading ? "Syncing data" : "Demo data"}
      </span>
      <span className="sr-only">{error}</span>
    </div>
  );
}

function PerformanceCards({ student }: { student: StudentProfileData }) {
  const metrics: StudentMetric[] = [
    { icon: Trophy, label: "Overall Score", tone: "cyan", value: `${student.overallScore}%` },
    { icon: BookOpenCheck, label: "Attendance", tone: "blue", value: `${student.attendancePercentage}%` },
    { icon: ClipboardList, label: "MCQ Average", tone: "purple", value: `${student.mcqAverage}%` },
    { icon: Code2, label: "Coding Average", tone: "green", value: `${student.codingAverage}%` },
    { icon: FileText, label: "Assignments", tone: "orange", value: `${student.assignmentCompletion}%` },
    { icon: BarChart3, label: "Rank in Batch", tone: "cyan", value: student.rankInBatch },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}

function AttendanceAnalytics({ student }: { student: StudentProfileData }) {
  const attendanceDistribution = [
    { name: "Present", value: student.attendance.present, color: "#22D3EE" },
    { name: "Absent", value: student.attendance.absent, color: "#FB7185" },
    { name: "Late", value: student.attendance.late, color: "#FBBF24" },
  ];

  return (
    <GlassPanel title="Attendance Analytics" subtitle="Overall, subject-wise, and monthly attendance." icon={BookOpenCheck}>
      <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
        <div>
          <div className="relative h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceDistribution} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={4}>
                  {attendanceDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-[30px] font-extrabold text-white">{student.attendance.overall}%</p>
                <p className="text-[11px] font-extrabold uppercase text-slate-500">Overall</p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <TinyMetric label="Present" value={student.attendance.present} />
            <TinyMetric label="Absent" value={student.attendance.absent} />
            <TinyMetric label="Late" value={student.attendance.late} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={student.attendance.trend} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} domain={[70, 100]} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={4} dot={{ r: 4, fill: "#38BDF8" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {student.attendance.subjectWise.map((subject) => (
              <ProgressRow key={subject.subject} label={subject.subject} value={subject.percentage} tone="cyan" />
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

function AcademicAnalytics({ student }: { student: StudentProfileData }) {
  const academicSummary = [
    { label: "Weekly Test", value: student.weeklyTestPerformance },
    { label: "Monthly Test", value: student.monthlyTestPerformance },
    { label: "Final Test", value: student.finalTestPerformance },
    { label: "MCQ", value: student.mcqAverage },
    { label: "Q&A", value: student.academicScores[student.academicScores.length - 1]?.qa ?? 0 },
    { label: "Coding", value: student.codingAverage },
  ];

  return (
    <GlassPanel title="Academic Analytics" subtitle="Test performance and section-wise score trends." icon={BarChart3}>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={student.academicScores} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyProfileGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="codingProfileGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="week" stroke="#94A3B8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Area dataKey="weekly" stroke="#22D3EE" fill="url(#weeklyProfileGradient)" strokeWidth={3} />
            <Area dataKey="coding" stroke="#A78BFA" fill="url(#codingProfileGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {academicSummary.map((item) => (
          <ProgressRow key={item.label} label={item.label} value={item.value} tone={item.value >= 85 ? "cyan" : "purple"} />
        ))}
      </div>
    </GlassPanel>
  );
}

function TopicsPanel({ student }: { student: StudentProfileData }) {
  return (
    <GlassPanel title="Weak & Strong Topics" subtitle="Topic mastery and improvement recommendations." icon={ShieldAlert}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-[13px] font-extrabold uppercase text-rose-200">Weak topics</p>
          <div className="mt-3 space-y-3">
            {student.weakTopics.map((topic) => (
              <ProgressRow key={topic.topic} label={topic.topic} value={topic.percentage} tone="red" />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[13px] font-extrabold uppercase text-cyan-200">Strong topics</p>
          <div className="mt-3 space-y-3">
            {student.strongTopics.map((topic) => (
              <ProgressRow key={topic.topic} label={topic.topic} value={topic.percentage} tone="cyan" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
        <p className="text-[13px] font-extrabold uppercase text-slate-400">Recommended improvement areas</p>
        <div className="mt-3 space-y-2">
          {student.recommendations.map((recommendation) => (
            <div key={recommendation} className="flex items-start gap-2 text-[13px] font-semibold text-slate-300">
              <Sparkles aria-hidden="true" size={15} strokeWidth={2.5} className="mt-0.5 text-cyan-200" />
              {recommendation}
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

function RecentActivity({ student }: { student: StudentProfileData }) {
  return (
    <GlassPanel title="Recent Activity" subtitle="Recent test attempts, coding submissions, and assignments." icon={ClipboardList}>
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-1">
        <ActivityColumn title="Test Attempts" items={student.activity.tests} />
        <ActivityColumn title="Coding Submissions" items={student.activity.coding} />
        <ActivityColumn title="Assignments" items={student.activity.assignments} />
      </div>
    </GlassPanel>
  );
}

function ActivityColumn({ items, title }: { items: Array<{ item: string; meta: string; status: string }>; title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <p className="text-[13px] font-extrabold uppercase text-slate-400">{title}</p>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={`${title}-${item.item}`} className="rounded-2xl bg-white/[0.055] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-extrabold text-white">{item.item}</p>
                <p className="mt-1 text-[12px] font-semibold text-slate-400">{item.meta}</p>
              </div>
              <span className="shrink-0 rounded-full bg-cyan-300/10 px-3 py-1 text-[11px] font-extrabold text-cyan-100">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: StudentMetric }) {
  const Icon = metric.icon;
  return (
    <motion.article
      className={`${glassCard} p-5`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-slate-500">{metric.label}</p>
          <p className="mt-3 text-[27px] font-extrabold leading-none text-white">{metric.value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass(metric.tone)}`}>
          <Icon aria-hidden="true" size={20} strokeWidth={2.5} />
        </span>
      </div>
    </motion.article>
  );
}

function GlassPanel({
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  subtitle: string;
  title: string;
}) {
  return (
    <motion.section className={`${glassCard} p-5 sm:p-6`} whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: "easeOut" }}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[21px] font-extrabold text-white">{title}</h2>
          <p className="mt-1 text-[14px] leading-6 text-slate-400">{subtitle}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
          <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
        </span>
      </div>
      {children}
    </motion.section>
  );
}

function TinyMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/[0.055] p-3 text-center">
      <p className="text-[18px] font-extrabold text-white">{value}</p>
      <p className="mt-1 text-[10px] font-extrabold uppercase text-slate-500">{label}</p>
    </div>
  );
}

function ProgressRow({ label, tone, value }: { label: string; tone: "cyan" | "purple" | "red"; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[13px] font-extrabold text-slate-200">{label}</span>
        <span className="text-[12px] font-bold text-slate-400">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${progressToneClass(tone)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function toneClass(tone: Tone) {
  if (tone === "blue") return "bg-blue-400/10 text-blue-200";
  if (tone === "green") return "bg-emerald-300/10 text-emerald-200";
  if (tone === "orange") return "bg-orange-300/10 text-orange-200";
  if (tone === "purple") return "bg-purple-400/10 text-purple-200";
  if (tone === "red") return "bg-rose-300/10 text-rose-200";
  return "bg-cyan-300/10 text-cyan-200";
}

function progressToneClass(tone: "cyan" | "purple" | "red") {
  if (tone === "purple") return "bg-gradient-to-r from-purple-400 to-blue-400";
  if (tone === "red") return "bg-gradient-to-r from-rose-400 to-orange-300";
  return "bg-gradient-to-r from-cyan-300 to-blue-400";
}

function normalizeStudentProfileData(payload: unknown, fallback: StudentProfileData): StudentProfileData {
  const root = toRecord(payload);
  const lecturerStudent = toRecord(root.lecturerStudent);
  const analytics = toRecord(root.analytics);
  const attendance = toRecord(root.attendance);
  const attendanceGraph = toRecord(root.attendanceGraph);
  const gamification = toRecord(root.gamification ?? root.gamificationSummary ?? analytics.gamification);
  const performance = toRecord(root.performance);
  const progress = toRecord(root.progress);
  const rank = toRecord(root.rank);
  const weakTopicsPayload = root.weakTopics;

  const attendanceTrend = readArray<{ month: string; value: number }>(
    attendanceGraph.trend ?? attendanceGraph.graph ?? attendanceGraph.data,
    fallback.attendance.trend,
  );
  const weakTopics = normalizeTopics(weakTopicsPayload, fallback.weakTopics);
  const strongTopics = normalizeTopics(analytics.strongTopics ?? performance.strongTopics, fallback.strongTopics);

  return {
    ...fallback,
    academicScores: readArray(performance.academicScores ?? analytics.academicScores ?? progress.academicScores, fallback.academicScores),
    activity: {
      assignments: readActivity(root.assignments, fallback.activity.assignments),
      coding: readActivity(root.codingSubmissions ?? analytics.codingSubmissions, fallback.activity.coding),
      tests: readActivity(root.tests, fallback.activity.tests),
    },
    assignmentCompletion: readNumber(analytics.assignmentCompletion ?? performance.assignmentCompletion, fallback.assignmentCompletion),
    attendance: {
      absent: readNumber(attendance.absent, fallback.attendance.absent),
      late: readNumber(attendance.late, fallback.attendance.late),
      overall: readNumber(attendance.overall ?? attendance.percentage, fallback.attendance.overall),
      present: readNumber(attendance.present, fallback.attendance.present),
      subjectWise: readArray(attendance.subjectWise ?? attendance.subjects, fallback.attendance.subjectWise),
      trend: attendanceTrend,
    },
    attendancePercentage: readNumber(attendance.percentage ?? attendance.overall, fallback.attendancePercentage),
    batch: readString(lecturerStudent.batch ?? lecturerStudent.batchName, fallback.batch),
    codingAverage: readNumber(performance.codingAverage ?? analytics.codingAverage, fallback.codingAverage),
    course: readString(lecturerStudent.course ?? lecturerStudent.courseName, fallback.course),
    email: readString(lecturerStudent.email, fallback.email),
    finalTestPerformance: readNumber(performance.finalTestPerformance ?? root.finalReport, fallback.finalTestPerformance),
    gamification: normalizeGamificationSummary(gamification, fallback.gamification),
    mcqAverage: readNumber(performance.mcqAverage ?? analytics.mcqAverage, fallback.mcqAverage),
    monthlyTestPerformance: readNumber(performance.monthlyTestPerformance, fallback.monthlyTestPerformance),
    name: readString(lecturerStudent.name ?? lecturerStudent.studentName, fallback.name),
    overallScore: readNumber(performance.overallScore ?? analytics.overallScore ?? root.grade, fallback.overallScore),
    phone: readString(lecturerStudent.phone ?? lecturerStudent.phoneNumber, fallback.phone),
    rankInBatch: readString(rank.rankInBatch ?? rank.rank ?? lecturerStudent.rankInBatch, fallback.rankInBatch),
    recommendations: readStringArray(analytics.recommendations ?? progress.recommendations, fallback.recommendations),
    rollNumber: readString(lecturerStudent.rollNumber ?? lecturerStudent.rollNo, fallback.rollNumber),
    status: normalizeStatus(lecturerStudent.status ?? root.riskScore, fallback.status),
    strongTopics,
    subject: readString(lecturerStudent.subject ?? lecturerStudent.subjectName, fallback.subject),
    testAverage: readNumber(performance.testAverage ?? analytics.testAverage, fallback.testAverage),
    weakTopics,
    weeklyTestPerformance: readNumber(performance.weeklyTestPerformance, fallback.weeklyTestPerformance),
  };
}

function normalizeGamificationSummary(
  payload: Record<string, unknown>,
  fallback: StudentProfileGamificationSummary | undefined,
): StudentProfileGamificationSummary | undefined {
  if (!Object.keys(payload).length) return fallback;

  const rawLevel = payload.levelName ?? payload.level;
  const rawStreak = payload.currentStreak ?? payload.currentStreakDays ?? payload.streak ?? payload.streakDays;
  const fallbackStreakDays = readFirstNumber(fallback?.streak);

  return {
    badgesCount: readNumber(payload.badgesCount ?? payload.badgesEarned ?? payload.badges, fallback?.badgesCount ?? 0),
    coins: readNumber(payload.coins ?? payload.availableCoins ?? payload.totalCoins, fallback?.coins ?? 0),
    level:
      typeof rawLevel === "number"
        ? `Level ${rawLevel}`
        : readString(rawLevel, fallback?.level ?? "Level 1"),
    streak:
      typeof rawStreak === "string" && rawStreak.trim()
        ? rawStreak
        : `${readNumber(rawStreak, fallbackStreakDays)} days`,
    xp: readNumber(payload.xp ?? payload.totalXp ?? payload.lifetimeXp, fallback?.xp ?? 0),
  };
}

function normalizeTopics(payload: unknown, fallback: StudentProfileData["weakTopics"]) {
  const topics = readArray<Record<string, unknown>>(payload, []);
  if (!topics.length) return fallback;

  return topics.map((topic, index) => {
    const fallbackTopic = fallback[index] ?? fallback[0];
    return {
      percentage: readNumber(topic.percentage ?? topic.score ?? topic.value, fallbackTopic.percentage),
      topic: readString(topic.topic ?? topic.name, fallbackTopic.topic),
    };
  });
}

function readActivity(payload: unknown, fallback: StudentProfileData["activity"]["tests"]) {
  const records = readArray<Record<string, unknown>>(payload, []);
  if (!records.length) return fallback;

  return records.map((record, index) => {
    const fallbackItem = fallback[index] ?? fallback[0];
    return {
      item: readString(record.item ?? record.title ?? record.name, fallbackItem.item),
      meta: readString(record.meta ?? record.description ?? record.score, fallbackItem.meta),
      status: readString(record.status, fallbackItem.status),
    };
  });
}

function normalizeStatus(value: unknown, fallback: StudentStatus): StudentStatus {
  if (value === "Good" || value === "Average" || value === "At Risk") return value;
  const numericRisk = Number(value);
  if (Number.isFinite(numericRisk)) {
    if (numericRisk >= 75) return "At Risk";
    if (numericRisk >= 45) return "Average";
    return "Good";
  }
  return fallback;
}

function readArray<T>(payload: unknown, fallback: T[]) {
  return Array.isArray(payload) && payload.length ? (payload as T[]) : fallback;
}

function readStringArray(payload: unknown, fallback: string[]) {
  return Array.isArray(payload) && payload.every((item) => typeof item === "string") ? payload : fallback;
}

function readFirstNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function readNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
