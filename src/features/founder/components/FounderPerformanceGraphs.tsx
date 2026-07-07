import type { ReactNode } from "react";
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
import type { FounderBatch } from "../types/founder.types";

export function FounderPerformanceGraphs({ batches }: { batches: FounderBatch[] }) {
  const chartData = batches.map((batch) => ({
    attendance: batch.attendance,
    batch: batch.name.replace("-2026", ""),
    performance: batch.score,
    strong: Math.round((batch.score + batch.attendance) / 2),
    testScore: batch.score,
    weak: Math.max(0, 100 - Math.round((batch.score + batch.attendance) / 2)),
  }));

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <GraphCard title="Batch Performance" description="Average performance across active batches.">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="founderScore" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#58CC02" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#58CC02" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="batch" stroke="var(--text-muted)" tickLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} />
            <Tooltip />
            <Area dataKey="performance" fill="url(#founderScore)" stroke="#58CC02" strokeWidth={3} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </GraphCard>

      <GraphCard title="Attendance By Batch" description="Average attendance percentage per batch.">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="batch" stroke="var(--text-muted)" tickLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} />
            <Tooltip />
            <Bar dataKey="attendance" fill="#1CB0F6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GraphCard>

      <GraphCard title="Test Performance By Batch" description="Average test score comparison.">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="batch" stroke="var(--text-muted)" tickLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} />
            <Tooltip />
            <Line dataKey="testScore" dot={{ fill: "#58CC02", r: 5 }} stroke="#58CC02" strokeWidth={3} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </GraphCard>

      <GraphCard title="Weak / Strong Batch Comparison" description="Strength index and improvement gap by batch.">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="batch" stroke="var(--text-muted)" tickLine={false} />
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
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="text-[21px] font-extrabold text-text-primary">{title}</h2>
      <p className="mt-1 text-[14px] text-text-secondary">{description}</p>
      <div className="mt-5">{children}</div>
    </article>
  );
}
