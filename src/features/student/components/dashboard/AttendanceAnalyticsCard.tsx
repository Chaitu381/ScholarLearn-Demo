import { useMemo, useState } from "react";
import {
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
import { CalendarCheck } from "lucide-react";
import { MetricPill } from "../../../../shared/components/ui/MetricPill";
import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import type { AttendanceAnalytics } from "../../types/student.types";

type AttendanceAnalyticsCardProps = {
  analytics: AttendanceAnalytics;
  overallPercentage: number;
};

type AttendanceFilter = "Week" | "Month" | "Sem";

type AttendanceTrendPoint = {
  day: string;
  present: number;
  late: number;
  absent: number;
};

const distributionColors: Record<
  AttendanceAnalytics["distribution"][number]["label"],
  string
> = {
  Present: "var(--primary)",
  Late: "var(--orange)",
  Absent: "var(--red)",
};

export function AttendanceAnalyticsCard({
  analytics,
  overallPercentage,
}: AttendanceAnalyticsCardProps) {
  const [activeFilter, setActiveFilter] = useState<AttendanceFilter>(
    analytics.activeFilter ?? "Week",
  );

  const filteredTrend = useMemo(
    () => buildAttendanceTrend(analytics.weeklyTrend, activeFilter),
    [analytics.weeklyTrend, activeFilter],
  );

  const chartCopy = getChartCopy(activeFilter);

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
              <CalendarCheck aria-hidden="true" size={22} strokeWidth={2.5} />
            </span>

            <div>
              <h2 className="text-[21px] font-extrabold text-text-primary">
                Attendance Analytics
              </h2>

              <p className="mt-1 text-[14px] leading-6 text-text-secondary">
                Real-time attendance tracking for this semester
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 xl:ml-auto">
          <MetricPill
            label="Trend"
            value={analytics.improvement}
            tone="primary"
          />

          <div className="inline-flex rounded-2xl border border-border bg-surface-soft p-1">
            {(["Week", "Month", "Sem"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={
                  filter === activeFilter
                    ? "h-8 rounded-xl bg-surface px-3 text-[12px] font-extrabold text-text-primary shadow-card"
                    : "h-8 rounded-xl px-3 text-[12px] font-extrabold text-text-secondary transition hover:bg-surface hover:text-text-primary"
                }
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {analytics.summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,60fr)_minmax(260px,40fr)]">
        <div className="rounded-2xl border border-border bg-surface-soft p-4">
          <ChartHeader title={chartCopy.title} subtitle={chartCopy.subtitle} />

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredTrend}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />

                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 12,
                  }}
                  allowDecimals={false}
                />

                <Tooltip contentStyle={tooltipStyle} />

                <Line
                  type="monotone"
                  dataKey="present"
                  name="Present"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="late"
                  name="Late"
                  stroke="var(--orange)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="absent"
                  name="Absent"
                  stroke="var(--red)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Legend
            items={[
              { label: "Present", color: "bg-primary" },
              { label: "Late", color: "bg-orange" },
              { label: "Absent", color: "bg-red" },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface-soft p-4">
          <ChartHeader
            title="Attendance Distribution"
            subtitle={`${activeFilter} class split`}
          />

          <div className="relative mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.distribution}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="82%"
                  paddingAngle={3}
                  stroke="var(--surface)"
                  strokeWidth={3}
                >
                  {analytics.distribution.map((entry) => (
                    <Cell
                      key={entry.label}
                      fill={distributionColors[entry.label]}
                    />
                  ))}
                </Pie>

                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-[30px] font-extrabold leading-none text-text-primary">
                  {overallPercentage}%
                </p>
                <p className="mt-1 text-[12px] font-bold text-text-muted">
                  Overall
                </p>
              </div>
            </div>
          </div>

          <Legend
            items={[
              { label: "Present", color: "bg-primary" },
              { label: "Late", color: "bg-orange" },
              { label: "Absent", color: "bg-red" },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface-soft p-4">
        <ChartHeader
          title="Subject-wise Attendance"
          subtitle="Recovery targets by subject"
        />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {analytics.subjectWise.map((subject) => (
            <ProgressBar
              key={subject.subject}
              label={`${subject.subject} (${subject.attendedClasses}/${subject.totalClasses})`}
              value={subject.percentage}
              tone={
                subject.percentage >= 92
                  ? "primary"
                  : subject.percentage >= 90
                    ? "orange"
                    : "red"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function buildAttendanceTrend(
  weeklyTrend: AttendanceTrendPoint[],
  activeFilter: AttendanceFilter,
): AttendanceTrendPoint[] {
  if (activeFilter === "Week") {
    return weeklyTrend;
  }

  if (activeFilter === "Month") {
    const totals = sumTrend(weeklyTrend);

    return [
      {
        day: "Week 1",
        present: Math.max(totals.present - 3, 0),
        late: totals.late + 1,
        absent: totals.absent + 1,
      },
      {
        day: "Week 2",
        present: totals.present,
        late: totals.late,
        absent: totals.absent,
      },
      {
        day: "Week 3",
        present: totals.present + 2,
        late: Math.max(totals.late - 1, 0),
        absent: totals.absent,
      },
      {
        day: "Week 4",
        present: totals.present + 4,
        late: Math.max(totals.late - 1, 0),
        absent: Math.max(totals.absent - 1, 0),
      },
    ];
  }

  const totals = sumTrend(weeklyTrend);

  return [
    {
      day: "Jan",
      present: totals.present + 12,
      late: totals.late + 3,
      absent: totals.absent + 2,
    },
    {
      day: "Feb",
      present: totals.present + 16,
      late: totals.late + 2,
      absent: totals.absent + 1,
    },
    {
      day: "Mar",
      present: totals.present + 20,
      late: totals.late + 1,
      absent: totals.absent + 1,
    },
    {
      day: "Apr",
      present: totals.present + 18,
      late: totals.late + 2,
      absent: totals.absent + 2,
    },
    {
      day: "May",
      present: totals.present + 22,
      late: totals.late + 1,
      absent: totals.absent,
    },
    {
      day: "Jun",
      present: totals.present + 25,
      late: totals.late,
      absent: Math.max(totals.absent - 1, 0),
    },
  ];
}

function sumTrend(weeklyTrend: AttendanceTrendPoint[]) {
  return weeklyTrend.reduce(
    (total, item) => ({
      present: total.present + item.present,
      late: total.late + item.late,
      absent: total.absent + item.absent,
    }),
    {
      present: 0,
      late: 0,
      absent: 0,
    },
  );
}

function getChartCopy(activeFilter: AttendanceFilter) {
  if (activeFilter === "Week") {
    return {
      title: "Weekly Attendance Trend",
      subtitle: "Present, late, and absent class counts",
    };
  }

  if (activeFilter === "Month") {
    return {
      title: "Monthly Attendance Trend",
      subtitle: "Week-by-week attendance performance",
    };
  }

  return {
    title: "Semester Attendance Trend",
    subtitle: "Month-by-month attendance performance",
  };
}

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  color: "var(--text-primary)",
};

function ChartHeader({ title, subtitle }: { title: string; subtitle: string }) {
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

function SummaryCard({
  helper,
  label,
  tone,
  value,
}: {
  helper: string;
  label: string;
  tone: "primary" | "orange" | "red";
  value: string;
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-soft text-primary-dark"
      : tone === "orange"
        ? "bg-orange-soft text-orange"
        : "bg-red-soft text-red";

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-[12px] font-extrabold ${toneClass}`}
      >
        {label}
      </span>

      <p className="mt-3 text-[24px] font-extrabold leading-none text-text-primary">
        {value}
      </p>

      <p className="mt-2 text-[13px] leading-5 text-text-secondary">
        {helper}
      </p>
    </article>
  );
}

function Legend({ items }: { items: Array<{ color: string; label: string }> }) {
  return (
    <div className="mt-4 flex flex-wrap gap-4">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-2 text-[12px] font-bold text-text-secondary"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}