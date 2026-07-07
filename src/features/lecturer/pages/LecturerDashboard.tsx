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
  ArrowUpRight,
  BookOpenCheck,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Layers3,
  TrendingUp,
  TriangleAlert,
  Trophy,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { navigateToLecturerPath } from "../components/LecturerShell";
import { getLecturerApiStatusMessage, lecturerApi } from "../services/lecturerApi";

const topStats = [
  { label: "My Students", value: "164", helper: "+12 active this week", icon: UsersRound, accent: "primary" },
  { label: "My Batches", value: "5", helper: "3 full-stack cohorts", icon: Layers3, accent: "blue" },
  { label: "Pending Reviews", value: "21", helper: "Assignments + tests", icon: ClipboardCheck, accent: "yellow" },
  { label: "Tests Created", value: "18", helper: "6 published this month", icon: ClipboardList, accent: "primary" },
  { label: "Weak Students", value: "14", helper: "Need mentor support", icon: TriangleAlert, accent: "orange" },
  { label: "Average Attendance", value: "89%", helper: "+3% from last week", icon: BookOpenCheck, accent: "primary" },
];

const shortcuts = [
  {
    description: "Build MCQ, Q&A, and coding assessments.",
    icon: ClipboardList,
    label: "Create Test",
    path: "/lecturer/tests/create",
  },
  {
    description: "Set tasks, due dates, marks, and instructions.",
    icon: FileText,
    label: "Create Assignment",
    path: "/lecturer/assignments/create",
  },
  {
    description: "Import prepared question files into a test.",
    icon: UploadCloud,
    label: "Upload Questions",
    path: "/lecturer/tests/create#upload-questions",
  },
  {
    description: "Open assigned batches and learner progress.",
    icon: GraduationCap,
    label: "View Batches",
    path: "/lecturer/batches",
  },
];

const performanceTrend = [
  { month: "Jan", score: 68, submissions: 58 },
  { month: "Feb", score: 72, submissions: 64 },
  { month: "Mar", score: 76, submissions: 69 },
  { month: "Apr", score: 74, submissions: 72 },
  { month: "May", score: 81, submissions: 78 },
  { month: "Jun", score: 86, submissions: 84 },
];

const assignmentCompletion = [
  { batch: "JFS-A", completed: 32, pending: 8, overdue: 2 },
  { batch: "JFS-B", completed: 27, pending: 9, overdue: 2 },
  { batch: "PY-A", completed: 29, pending: 5, overdue: 2 },
  { batch: "React", completed: 21, pending: 7, overdue: 4 },
];

const testScoreDistribution = [
  { name: "90+", value: 26, color: "#58CC02" },
  { name: "75-89", value: 54, color: "#1CB0F6" },
  { name: "60-74", value: 38, color: "#FFC800" },
  { name: "< 60", value: 14, color: "#FF4B4B" },
];

const attendanceTrend = [
  { week: "W1", attendance: 84 },
  { week: "W2", attendance: 87 },
  { week: "W3", attendance: 85 },
  { week: "W4", attendance: 90 },
  { week: "W5", attendance: 88 },
  { week: "W6", attendance: 92 },
];

const weakTopics = [
  { topic: "Spring Security", students: 18, severity: 72 },
  { topic: "SQL Joins", students: 15, severity: 65 },
  { topic: "React Hooks", students: 12, severity: 58 },
  { topic: "Aptitude Speed", students: 21, severity: 78 },
];

const recentSubmissions = [
  { student: "Chaitanya", work: "Spring Boot CRUD APIs", status: "Reviewed", time: "10 min ago" },
  { student: "Ayush", work: "React Hooks Worksheet", status: "Pending", time: "28 min ago" },
  { student: "Aniket", work: "SQL Join Practice", status: "Reviewed", time: "1 hr ago" },
  { student: "Durshant", work: "Coding Test Mock", status: "Needs Review", time: "2 hr ago" },
];

const topStudents = [
  { name: "Aniket", score: "94%", rank: "#1", xp: "9,420 XP" },
  { name: "Chaitanya", score: "91%", rank: "#2", xp: "8,980 XP" },
  { name: "Ayush", score: "88%", rank: "#3", xp: "8,460 XP" },
  { name: "Durshant", score: "85%", rank: "#4", xp: "8,120 XP" },
];

const glassCard =
  "rounded-3xl border border-border bg-surface shadow-card";

const chartTooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  color: "var(--text-primary)",
};

type DashboardData = {
  assignmentCompletion: typeof assignmentCompletion;
  attendanceTrend: typeof attendanceTrend;
  performanceTrend: typeof performanceTrend;
  recentSubmissions: typeof recentSubmissions;
  testScoreDistribution: typeof testScoreDistribution;
  topStats: typeof topStats;
  topStudents: typeof topStudents;
  weakTopics: typeof weakTopics;
};

const fallbackDashboardData: DashboardData = {
  assignmentCompletion,
  attendanceTrend,
  performanceTrend,
  recentSubmissions,
  testScoreDistribution,
  topStats,
  topStudents,
  weakTopics,
};

export function LecturerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(fallbackDashboardData);
  const [apiState, setApiState] = useState({ error: "", loading: true });

  useEffect(() => {
    let active = true;

    lecturerApi
      .getLecturerDashboard()
      .then((payload) => {
        if (!active) return;
        setDashboardData(normalizeDashboardData(payload));
        setApiState({ error: "", loading: false });
      })
      .catch((error) => {
        if (!active) return;
        setDashboardData(fallbackDashboardData);
        setApiState({ error: getLecturerApiStatusMessage(error), loading: false });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <DashboardActions />
      <ApiStateNotice error={apiState.error} loading={apiState.loading} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardData.topStats.map((stat) => (
          <StatGlassCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,62fr)_minmax(320px,38fr)]">
          <GlassPanel title="Student Performance Trend" subtitle="Average student score and submission momentum." icon={TrendingUp}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.performanceTrend} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#58CC02" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#58CC02" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="submissionGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#1CB0F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1CB0F6" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area dataKey="submissions" stroke="#1CB0F6" fill="url(#submissionGradient)" strokeWidth={3} />
                  <Area dataKey="score" stroke="#58CC02" fill="url(#scoreGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <GlassPanel title="Test Score Distribution" subtitle="Latest cohort assessment spread." icon={ClipboardList}>
            <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-1">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboardData.testScoreDistribution} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={4}>
                      {dashboardData.testScoreDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {dashboardData.testScoreDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.055] px-4 py-3">
                    <span className="flex items-center gap-2 text-[13px] font-bold text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </span>
                    <strong className="text-[14px] text-white">{entry.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
          <GlassPanel title="Assignment Completion" subtitle="Submitted, pending, and overdue work by batch." icon={FileText}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.assignmentCompletion} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="batch" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="completed" stackId="assignments" fill="#58CC02" radius={[0, 0, 10, 10]} />
                  <Bar dataKey="pending" stackId="assignments" fill="#FFC800" />
                  <Bar dataKey="overdue" stackId="assignments" fill="#FF4B4B" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <GlassPanel title="Attendance Trend" subtitle="Weekly attendance average across assigned batches." icon={BookOpenCheck}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.attendanceTrend} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} domain={[70, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="attendance" stroke="#58CC02" strokeWidth={4} dot={{ r: 4, fill: "#58CC02" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,35fr)_minmax(0,35fr)_minmax(280px,30fr)]">
        <WeakTopicsPanel weakTopics={dashboardData.weakTopics} />
        <RecentSubmissionsPanel recentSubmissions={dashboardData.recentSubmissions} />
        <TopStudentsPanel topStudents={dashboardData.topStudents} />
      </section>
    </motion.div>
  );
}

function DashboardActions() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {shortcuts.map((shortcut) => (
        <ActionCard key={shortcut.label} shortcut={shortcut} />
      ))}
    </section>
  );
}

function ActionCard({ shortcut }: { shortcut: (typeof shortcuts)[number] }) {
  const Icon = shortcut.icon;

  return (
    <motion.button
      type="button"
      className="group flex min-h-[126px] w-full flex-col items-start rounded-3xl border border-border bg-surface p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary/25 sm:p-5"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      onClick={() => navigateToLecturerPath(shortcut.path)}
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-dark transition group-hover:bg-surface group-hover:text-primary-dark">
        <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
      </span>
      <span className="mt-4 text-[16px] font-extrabold leading-tight text-text-primary">
        {shortcut.label}
      </span>
      <span className="mt-2 text-[13px] font-semibold leading-5 text-text-secondary">
        {shortcut.description}
      </span>
    </motion.button>
  );
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

function StatGlassCard({ stat }: { stat: DashboardData["topStats"][number] }) {
  const Icon = stat.icon;
  return (
    <motion.article
      className={`${glassCard} group relative overflow-hidden p-5`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className={`absolute inset-x-0 top-0 h-px ${accentLineClass(stat.accent)}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-slate-500">{stat.label}</p>
          <p className="mt-3 text-[28px] font-extrabold leading-none text-white">{stat.value}</p>
          <p className="mt-3 text-[13px] font-semibold text-slate-400">{stat.helper}</p>
        </div>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accentIconClass(stat.accent)}`}>
          <Icon aria-hidden="true" size={22} strokeWidth={2.5} />
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

function WeakTopicsPanel({ weakTopics }: { weakTopics: DashboardData["weakTopics"] }) {
  return (
    <GlassPanel title="Weak Topics" subtitle="Most repeated improvement signals." icon={TriangleAlert}>
      <div className="space-y-4">
        {weakTopics.map((topic) => (
          <div key={topic.topic}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[14px] font-extrabold text-slate-100">{topic.topic}</span>
              <span className="text-[12px] font-bold text-slate-400">{topic.students} students</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300"
                style={{ width: `${topic.severity}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function RecentSubmissionsPanel({ recentSubmissions }: { recentSubmissions: DashboardData["recentSubmissions"] }) {
  return (
    <GlassPanel title="Recent Submissions" subtitle="Latest student activity requiring attention." icon={FileText}>
      <div className="space-y-3">
        {recentSubmissions.map((submission) => (
          <div key={`${submission.student}-${submission.work}`} className="rounded-2xl border border-border bg-surface-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-extrabold text-white">{submission.student}</p>
                <p className="mt-1 text-[13px] font-semibold text-slate-400">{submission.work}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold text-cyan-100">
                {submission.status}
              </span>
            </div>
            <p className="mt-3 text-[12px] font-bold text-slate-500">{submission.time}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function TopStudentsPanel({ topStudents }: { topStudents: DashboardData["topStudents"] }) {
  return (
    <GlassPanel title="Top Performing Students" subtitle="Strongest learners this week." icon={Trophy}>
      <div className="space-y-3">
        {topStudents.map((student) => (
          <div key={student.name} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-soft p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-[13px] font-extrabold text-primary-dark">
                {student.rank}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-extrabold text-white">{student.name}</p>
                <p className="mt-1 text-[12px] font-bold text-slate-400">{student.xp}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300/10 px-3 py-1 text-[12px] font-extrabold text-cyan-100">
              {student.score}
              <ArrowUpRight aria-hidden="true" size={13} strokeWidth={2.5} />
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function accentIconClass(accent: string) {
  if (accent === "blue") return "bg-blue-soft text-blue";
  if (accent === "orange") return "bg-orange-soft text-orange";
  if (accent === "yellow") return "bg-yellow-soft text-text-primary";
  return "bg-primary-soft text-primary-dark";
}

function accentLineClass(accent: string) {
  if (accent === "blue") return "bg-blue-soft";
  if (accent === "orange") return "bg-orange-soft";
  if (accent === "yellow") return "bg-yellow-soft";
  return "bg-primary-soft";
}

function normalizeDashboardData(payload: unknown): DashboardData {
  const record = toRecord(payload);
  return {
    assignmentCompletion: readArray(record.assignmentCompletion, fallbackDashboardData.assignmentCompletion),
    attendanceTrend: readArray(record.attendanceTrend, fallbackDashboardData.attendanceTrend),
    performanceTrend: readArray(record.performanceTrend, fallbackDashboardData.performanceTrend),
    recentSubmissions: readArray(record.recentSubmissions, fallbackDashboardData.recentSubmissions),
    testScoreDistribution: readArray(record.testScoreDistribution, fallbackDashboardData.testScoreDistribution),
    topStats: normalizeTopStats(readArray(record.topStats ?? record.stats, fallbackDashboardData.topStats)),
    topStudents: readArray(record.topStudents, fallbackDashboardData.topStudents),
    weakTopics: readArray(record.weakTopics, fallbackDashboardData.weakTopics),
  };
}

function normalizeTopStats(stats: Array<Record<string, unknown>> | DashboardData["topStats"]) {
  return stats.map((stat, index) => {
    const fallback = fallbackDashboardData.topStats[index] ?? fallbackDashboardData.topStats[0];
    const record = toRecord(stat);
    return {
      accent: typeof record.accent === "string" ? record.accent : fallback.accent,
      helper: typeof record.helper === "string" ? record.helper : fallback.helper,
      icon: fallback.icon,
      label: typeof record.label === "string" ? record.label : fallback.label,
      value: typeof record.value === "string" || typeof record.value === "number" ? String(record.value) : fallback.value,
    };
  });
}

function readArray<T>(value: unknown, fallback: T[]) {
  return Array.isArray(value) && value.length ? (value as T[]) : fallback;
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
