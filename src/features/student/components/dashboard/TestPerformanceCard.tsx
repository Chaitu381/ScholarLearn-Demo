import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClipboardCheck } from "lucide-react";
import { MetricPill } from "../../../../shared/components/ui/MetricPill";
import type {
  FinalExamMetric,
  TestPerformance,
} from "../../types/student.types";
import type { UiTone } from "../../../../shared/types/ui";

type TestPerformanceCardProps = {
  performance: TestPerformance;
};

const toneClasses: Record<UiTone, string> = {
  primary: "bg-primary-soft text-primary-dark",
  blue: "bg-blue-soft text-blue",
  yellow: "bg-yellow-soft text-text-primary",
  orange: "bg-orange-soft text-orange",
  red: "bg-red-soft text-red",
  neutral: "bg-surface-soft text-text-secondary",
};

export function TestPerformanceCard({
  performance,
}: TestPerformanceCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue">
            <ClipboardCheck aria-hidden="true" size={22} strokeWidth={2.5} />
          </span>

          <div>
            <h2 className="text-[21px] font-extrabold text-text-primary">
              Test Performance
            </h2>

            <p className="mt-1 text-[14px] leading-6 text-text-secondary">
              Track weekly, monthly, and exam results
            </p>
          </div>
        </div>

        <MetricPill
          label="Status"
          value={performance.metricLabel}
          tone="primary"
        />
      </div>

      <div className="mt-6 grid gap-5">
        <div className="rounded-2xl border border-border bg-surface-soft p-4">
          <ChartHeader
            title="Weekly Tests"
            subtitle="Latest weekly assessment scores"
          />

          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performance.weeklyTestScores}
                margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  domain={[60, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{ fill: "var(--surface)" }}
                  contentStyle={tooltipStyle}
                />

                <Bar
                  dataKey="score"
                  name="Score"
                  fill="var(--blue)"
                  radius={[12, 12, 0, 0]}
                  barSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-soft p-4">
          <ChartHeader
            title="Monthly Report"
            subtitle="Semester score trend"
          />

          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performance.monthlyTestScores}
                margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  domain={[60, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 12,
                  }}
                />

                <Tooltip contentStyle={tooltipStyle} />

                <Area
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fill="var(--primary-soft)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-soft p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <ChartHeader
              title="Final Examination Report"
              subtitle="Exam, internal, and external performance"
            />

            <div className="flex flex-wrap gap-2 sm:justify-end">
              {performance.weakTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-orange-soft px-3 py-1 text-[12px] font-extrabold text-orange"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {performance.finalExamReport.map((metric) => (
              <ExamMetric key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  color: "var(--text-primary)",
};

function ChartHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h3 className="text-[15px] font-extrabold text-text-primary">
        {title}
      </h3>

      <p className="mt-1 text-[13px] leading-5 text-text-secondary">
        {subtitle}
      </p>
    </div>
  );
}

function ExamMetric({ metric }: { metric: FinalExamMetric }) {
  return (
    <article className="rounded-2xl bg-surface p-4">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-[12px] font-extrabold ${toneClasses[metric.tone]}`}
      >
        {metric.label}
      </span>

      <p className="mt-3 text-[24px] font-extrabold text-text-primary">
        {metric.value}
      </p>

      <p className="mt-1 text-[13px] leading-5 text-text-secondary">
        {metric.helper}
      </p>
    </article>
  );
}