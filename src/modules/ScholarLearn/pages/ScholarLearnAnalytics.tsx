import { motion } from "framer-motion";
import { BarChart3, Building2, LineChart, UsersRound, type LucideIcon } from "lucide-react";
import { scholarLearnDemoDashboardData } from "../services/scholarLearnDemoData";

export function ScholarLearnAnalytics() {
  const { attendanceTestSummary, instituteGrowthGraph, institutePerformanceGraph } = scholarLearnDemoDashboardData;

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
          Platform analytics
        </span>
        <h1 className="mt-4 text-[30px] font-extrabold text-text-primary">Analytics</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
          Platform-wide institute performance, student growth, attendance, and test performance summary.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={Building2} label="Institute performance" value="88%" />
        <Metric icon={UsersRound} label="Student growth" value="+590" />
        <Metric icon={LineChart} label="Attendance / tests" value="91 / 85" />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <MiniBarPanel
          icon={BarChart3}
          title="Institute performance"
          data={institutePerformanceGraph.map((point) => ({
            label: point.label,
            value: point.performance ?? 0,
          }))}
        />
        <MiniBarPanel
          icon={UsersRound}
          title="Student growth"
          data={instituteGrowthGraph.map((point) => ({
            label: point.label,
            value: point.students ?? 0,
          }))}
        />
        <MiniBarPanel
          icon={LineChart}
          title="Attendance / Test summary"
          data={attendanceTestSummary.map((point) => ({
            label: point.label,
            value: point.attendance ?? 0,
          }))}
        />
      </section>
    </motion.section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      </span>
      <p className="mt-4 text-[24px] font-extrabold text-text-primary">{value}</p>
      <p className="mt-1 text-[13px] font-bold text-text-secondary">{label}</p>
    </article>
  );
}

function MiniBarPanel({
  data,
  icon: Icon,
  title,
}: {
  data: Array<{ label: string; value: number }>;
  icon: LucideIcon;
  title: string;
}) {
  const maxValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>
        <h2 className="text-[18px] font-extrabold text-text-primary">{title}</h2>
      </div>
      <div className="mt-5 space-y-3">
        {data.map((point) => (
          <div key={point.label}>
            <div className="flex items-center justify-between text-[12px] font-extrabold text-text-secondary">
              <span>{point.label}</span>
              <span>{point.value}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface-soft">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(8, (point.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
