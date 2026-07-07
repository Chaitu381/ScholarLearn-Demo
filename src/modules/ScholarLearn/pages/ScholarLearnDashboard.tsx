import { motion } from "framer-motion";
import { Building2, CheckCircle2, Clock3, PieChart as PieChartIcon, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScholarLearnStatsCards } from "../components/ScholarLearnStatsCards";
import { useScholarLearnDashboard } from "../hooks/useScholarLearnDashboard";
import type { ScholarLearnInstitute, ScholarLearnPlanDistribution, ScholarLearnRoleHealth } from "../types/scholarLearn.types";

export function ScholarLearnDashboard() {
  const { data, error, loading } = useScholarLearnDashboard();

  if (loading) {
    return (
      <section className="rounded-3xl border border-border bg-surface p-6 text-[14px] font-extrabold text-text-secondary shadow-card">
        Loading ScholarLearn dashboard...
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-3xl border border-red-soft bg-red-soft p-6 text-[14px] font-extrabold text-red">
        {error || "Unable to load ScholarLearn dashboard."}
      </section>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,65fr)_minmax(280px,35fr)] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
              Platform Owner
            </span>
            <h1 className="mt-4 text-[32px] font-extrabold leading-tight text-text-primary sm:text-[40px]">
              ScholarLearn Command Center
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-text-secondary">
              Monitor institutes, Founder approvals, subscriptions, access status, performance, and platform-wide student growth.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-surface-soft p-5">
            <p className="text-[12px] font-extrabold uppercase text-text-muted">Today&apos;s Platform Focus</p>
            <p className="mt-3 text-[24px] font-extrabold text-text-primary">Founder approvals</p>
            <p className="mt-2 text-[13px] leading-5 text-text-secondary">
              Review pending Founder accounts, renew institutes near expiry, and keep disabled institutes separated from active access.
            </p>
          </div>
        </div>
      </section>

      <ScholarLearnStatsCards metrics={data.metrics} />

      <div className="grid gap-5 xl:grid-cols-2">
        <GraphCard
          icon={TrendingUp}
          title="Institute Performance Graph"
          subtitle="Average performance by institute"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.institutePerformanceGraph} margin={{ bottom: 0, left: -18, right: 8, top: 10 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="performance" fill="#58cc02" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>

        <GraphCard
          icon={UsersRound}
          title="Institute Student Growth"
          subtitle="Student growth across all institutes"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.instituteGrowthGraph} margin={{ bottom: 0, left: -18, right: 8, top: 10 }}>
              <defs>
                <linearGradient id="studentGrowth" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#58cc02" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#58cc02" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="students" fill="url(#studentGrowth)" stroke="#58cc02" strokeWidth={3} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </GraphCard>

        <GraphCard
          icon={PieChartIcon}
          title="Subscription Plan Distribution"
          subtitle="Current plan mix across institutes"
        >
          <PlanDistributionChart data={data.planDistribution} />
        </GraphCard>

        <GraphCard
          icon={Building2}
          title="Active vs Inactive Institutes"
          subtitle="Monthly active access movement"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.activeInactiveGraph} margin={{ bottom: 0, left: -18, right: 8, top: 10 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" />
              <Bar dataKey="active" fill="#58cc02" radius={[10, 10, 0, 0]} />
              <Bar dataKey="inactive" fill="#ff4b4b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GraphCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <GraphCard
          icon={CheckCircle2}
          title="Attendance / Test Performance Summary"
          subtitle="Platform averages where backend analytics are available"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.attendanceTestSummary} margin={{ bottom: 0, left: -18, right: 8, top: 10 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" />
              <Line dataKey="attendance" dot={false} stroke="#58cc02" strokeWidth={3} type="monotone" />
              <Line dataKey="tests" dot={false} stroke="#1cb0f6" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <SectionTitle
            icon={UsersRound}
            title="Role Health"
            subtitle="Active users and approval pressure by role."
          />
          <div className="mt-5 space-y-4">
            {data.roleHealth.map((role) => (
              <RoleHealthRow key={role.label} role={role} />
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <SectionTitle
            icon={Building2}
            title="Institute Snapshot"
            subtitle="Fast read of access, attendance, and active branches."
          />
          <div className="mt-5 space-y-3">
            {data.institutes.slice(0, 4).map((institute) => (
              <InstituteRow key={institute.id} institute={institute} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <SectionTitle
            icon={Clock3}
            title="Recent Platform Activity"
            subtitle="Demo fallback timeline for platform-owner operations."
          />
          <div className="mt-5 space-y-3">
            {data.activities.map((activity) => (
              <article key={activity.id} className="rounded-3xl border border-border bg-surface-soft p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                    <CheckCircle2 aria-hidden="true" size={17} strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="text-[15px] font-extrabold text-text-primary">{activity.title}</p>
                    <p className="mt-1 text-[13px] font-semibold leading-5 text-text-secondary">{activity.description}</p>
                    <p className="mt-2 text-[12px] font-extrabold uppercase text-text-muted">{activity.time}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

const tooltipStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  boxShadow: "0 16px 40px rgba(17, 24, 39, 0.10)",
  fontWeight: 800,
};

function PlanDistributionChart({ data }: { data: ScholarLearnPlanDistribution[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={4}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-border bg-surface-soft px-3 py-2">
            <span className="flex items-center gap-2 text-[13px] font-extrabold text-text-primary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="text-[13px] font-extrabold text-text-secondary">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphCard({
  children,
  icon,
  subtitle,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <SectionTitle icon={icon} title={title} subtitle={subtitle} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InstituteRow({ institute }: { institute: ScholarLearnInstitute }) {
  return (
    <article className="rounded-3xl border border-border bg-surface-soft p-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_110px_110px_auto] md:items-center">
        <div>
          <h2 className="text-[17px] font-extrabold text-text-primary">{institute.name}</h2>
          <p className="mt-1 text-[13px] font-semibold text-text-secondary">
            {institute.founderName} • {institute.city}
          </p>
        </div>
        <MiniValue label="Students" value={institute.students} />
        <MiniValue label="Branches" value={institute.branches} />
        <span className={`w-fit rounded-full px-3 py-1 text-[12px] font-extrabold ${statusClass(institute.status)}`}>
          {institute.status}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[12px] font-extrabold text-text-secondary">
          <span>Performance</span>
          <span>{institute.averagePerformance}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-primary" style={{ width: `${institute.averagePerformance}%` }} />
        </div>
      </div>
    </article>
  );
}

function RoleHealthRow({ role }: { role: ScholarLearnRoleHealth }) {
  const pendingPercent = Math.min(100, role.pendingApprovals * 4);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-extrabold text-text-primary">{role.label}</p>
          <p className="mt-1 text-[12px] font-semibold text-text-secondary">{role.activeUsers} active users</p>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">{role.trend}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-orange" style={{ width: `${pendingPercent}%` }} />
      </div>
      <p className="mt-2 text-[12px] font-semibold text-text-secondary">{role.pendingApprovals} pending approvals</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  subtitle,
  title,
}: {
  icon: LucideIcon;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      </span>
      <div>
        <h2 className="text-[21px] font-extrabold text-text-primary">{title}</h2>
        <p className="mt-1 text-[14px] leading-6 text-text-secondary">{subtitle}</p>
      </div>
    </div>
  );
}

function MiniValue({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-[18px] font-extrabold text-text-primary">{value}</p>
      <p className="text-[11px] font-extrabold uppercase text-text-muted">{label}</p>
    </div>
  );
}

function statusClass(status: ScholarLearnInstitute["status"]) {
  if (status === "Active") return "bg-primary-soft text-primary-dark";
  if (status === "Trial") return "bg-blue-soft text-blue";
  if (status === "Expired") return "bg-orange-soft text-orange";
  return "bg-red-soft text-red";
}
