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
import type { ReactElement } from "react";
import { Code2 } from "lucide-react";
import { MetricPill } from "../../../../shared/components/ui/MetricPill";
import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import type { CodingHeatmapPoint, CodingPractice } from "../../types/student.types";

type CodingProgressCardProps = {
  coding: CodingPractice;
};

const heatmapClasses: Record<CodingHeatmapPoint["intensity"], string> = {
  0: "bg-surface border-border",
  1: "bg-primary-soft border-primary-soft",
  2: "bg-blue-soft border-blue-soft",
  3: "bg-primary border-primary",
  4: "bg-blue border-blue",
};

export function CodingProgressCard({ coding }: CodingProgressCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue">
            <Code2 aria-hidden="true" size={22} strokeWidth={2.5} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[21px] font-extrabold text-text-primary">Coding Analytics</h2>
              <MetricPill label="Streak" value={`${coding.streakDays} day streak`} tone="primary" />
            </div>
            <p className="mt-1 text-[14px] leading-6 text-text-secondary">
              LeetCode-style progress and practice tracking · {coding.totalProblemsSolved} problems solved
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            window.location.hash = "coding-practice";
          }}
          className="h-11 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white shadow-card transition hover:bg-primary-dark"
        >
          Practice Now
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {coding.difficultyProgress.map((difficulty) => (
          <article key={difficulty.label} className="rounded-2xl border border-border bg-surface-soft p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={difficulty.label === "Easy" ? "text-[13px] font-extrabold text-primary-dark" : difficulty.label === "Medium" ? "text-[13px] font-extrabold text-orange" : "text-[13px] font-extrabold text-red"}>
                  {difficulty.label}
                </p>
                <p className="mt-4 text-[30px] font-extrabold leading-none text-text-primary">
                  {difficulty.solved}
                  <span className="ml-2 text-[14px] font-semibold text-text-secondary">solved</span>
                </p>
              </div>
              <span className="text-[13px] font-bold text-text-muted">/{difficulty.total}</span>
            </div>
            <div className="mt-4">
              <ProgressBar value={(difficulty.solved / difficulty.total) * 100} tone={difficulty.tone} showValue={false} />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface-soft p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ChartHeader title="Activity Heatmap" subtitle="Last 52 weeks of coding practice" />
          <HeatmapLegend />
        </div>
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="grid min-w-[760px] gap-1" style={{ gridTemplateColumns: "42px repeat(52, minmax(10px, 1fr))" }}>
            {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map((day) => (
              <WeekdayRow key={day} day={day} points={coding.heatmap.filter((point) => point.day === day)} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <MiniChart title="Daily Coding Hours" subtitle="Time spent this week">
          <AreaChart data={coding.dailyCodingHours} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={3} fill="var(--primary-soft)" name="Hours" />
          </AreaChart>
        </MiniChart>

        <MiniChart title="Weekly Progress" subtitle="Solved by difficulty">
          <BarChart data={coding.weeklyProgress} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="easy" stackId="problems" fill="var(--primary)" radius={[0, 0, 8, 8]} name="Easy" />
            <Bar dataKey="medium" stackId="problems" fill="var(--orange)" name="Medium" />
            <Bar dataKey="hard" stackId="problems" fill="var(--red)" radius={[8, 8, 0, 0]} name="Hard" />
          </BarChart>
        </MiniChart>

        <MiniChart title="Monthly Trend" subtitle="Problems solved by month">
          <LineChart data={coding.monthlyTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="solved" stroke="var(--blue)" strokeWidth={3} dot={{ r: 3 }} name="Solved" />
          </LineChart>
        </MiniChart>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Problem label="Recent solved problem" value={coding.recentSolvedProblem} />
        <Problem label="Recommended next problem" value={coding.recommendedNextProblem} />
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

function ChartHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-[15px] font-extrabold text-text-primary">{title}</h3>
      <p className="mt-1 text-[13px] leading-5 text-text-secondary">{subtitle}</p>
    </div>
  );
}

function WeekdayRow({ day, points }: { day: CodingHeatmapPoint["day"]; points: CodingHeatmapPoint[] }) {
  return (
    <>
      <span className="flex h-3.5 items-center text-[11px] font-bold text-text-muted">{day}</span>
      {points.map((point) => (
        <span
          key={`${point.week}-${point.day}`}
          aria-label={`${point.day} week ${point.week} intensity ${point.intensity}`}
          className={`h-3.5 rounded border ${heatmapClasses[point.intensity]}`}
          title={`${point.day}, week ${point.week}: ${point.intensity} activity`}
        />
      ))}
    </>
  );
}

function HeatmapLegend() {
  return (
    <div className="flex items-center gap-2 text-[12px] font-bold text-text-secondary">
      <span>Less</span>
      {[0, 1, 2, 3, 4].map((value) => (
        <span key={value} className={`h-3 w-3 rounded border ${heatmapClasses[value as CodingHeatmapPoint["intensity"]]}`} />
      ))}
      <span>More</span>
    </div>
  );
}

function MiniChart({ children, subtitle, title }: { children: ReactElement; subtitle: string; title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-4">
      <ChartHeader title={title} subtitle={subtitle} />
      <div className="mt-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Problem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-soft p-4">
      <p className="text-[12px] font-bold uppercase text-text-muted">{label}</p>
      <p className="mt-1 text-[14px] font-extrabold leading-5 text-text-primary">{value}</p>
    </div>
  );
}
