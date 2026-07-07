import { BookOpen } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import type { SubjectProgress, SubjectStatus } from "../../types/student.types";

type SubjectPerformanceCardProps = {
  subjects: SubjectProgress[];
};

const statusClasses: Record<SubjectStatus, string> = {
  Strong: "bg-primary-soft text-primary-dark",
  Improving: "bg-blue-soft text-blue",
  "Needs Focus": "bg-yellow-soft text-text-primary",
  "Low Attendance": "bg-red-soft text-red",
};

export function SubjectPerformanceCard({ subjects }: SubjectPerformanceCardProps) {
  const radarData = [
    {
      metric: "Progress",
      value: average(subjects.map((subject) => subject.progress)),
    },
    {
      metric: "Tests",
      value: average(subjects.map((subject) => subject.testAverage)),
    },
    {
      metric: "Attendance",
      value: average(subjects.map((subject) => subject.attendance)),
    },
  ];

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-extrabold uppercase text-text-muted">Subject performance</p>
          <h2 className="mt-2 text-[21px] font-extrabold text-text-primary">Progress, tests, and attendance</h2>
          <p className="mt-1 text-[14px] leading-6 text-text-secondary">Compact comparison across core subjects</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow-soft text-text-primary">
          <BookOpen aria-hidden="true" size={24} strokeWidth={2.5} />
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-surface-soft p-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl bg-surface p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-extrabold text-text-primary">
                  Overall learning balance
                </h3>
                <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                  Average progress, test score, and attendance across all subjects.
                </p>
              </div>

              <span className="rounded-full bg-blue-soft px-3 py-1 text-[12px] font-extrabold text-blue">
                Live snapshot
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{
                        fill: "var(--text-secondary)",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Radar
                      dataKey="value"
                      name="Average"
                      stroke="var(--blue)"
                      fill="var(--blue-soft)"
                      fillOpacity={0.85}
                      strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-3">
                {radarData.map((item) => (
                  <div key={item.metric} className="rounded-2xl bg-surface-soft p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-extrabold text-text-muted">
                        {item.metric}
                      </p>

                      <p className="text-[22px] font-extrabold leading-none text-text-primary">
                        {item.value}%
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-blue"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <InsightCard
              label="Strongest subject"
              title={getStrongestSubject(subjects).name}
              value={`${getStrongestSubject(subjects).progress}%`}
              tone="primary"
            />

            <InsightCard
              label="Needs focus"
              title={getWeakestSubject(subjects).name}
              value={`${getWeakestSubject(subjects).progress}%`}
              tone="yellow"
            />

            <InsightCard
              label="Best attendance"
              title={getBestAttendanceSubject(subjects).name}
              value={`${getBestAttendanceSubject(subjects).attendance}%`}
              tone="blue"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {subjects.map((subject) => (
          <article key={subject.id} className="rounded-2xl bg-surface-soft p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-extrabold text-text-primary">{subject.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${statusClasses[subject.status]}`}>
                    {subject.status}
                  </span>
                </div>
                <p className="mt-1 text-[12px] font-semibold text-text-secondary">Weak topic: {subject.weakTopic}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Metric label="Attendance" value={`${subject.attendance}%`} />
                <Metric label="Tests" value={`${subject.testAverage}%`} />
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar label="Progress" value={subject.progress} tone={subject.tone} />
            </div>
          </article>
        ))}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-text-secondary">
      {label}: <strong className="font-extrabold text-text-primary">{value}</strong>
    </span>
  );
}

function InsightCard({
  label,
  title,
  value,
  tone,
}: {
  label: string;
  title: string;
  value: string;
  tone: "primary" | "blue" | "yellow";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-soft text-primary-dark"
      : tone === "blue"
        ? "bg-blue-soft text-blue"
        : "bg-yellow-soft text-text-primary";

  return (
    <article className="rounded-2xl bg-surface p-4">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">
        {label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-extrabold text-text-primary">
            {title}
          </h3>

          <p className="mt-1 text-[12px] font-semibold text-text-secondary">
            Subject highlight
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-extrabold ${toneClass}`}
        >
          {value}
        </span>
      </div>
    </article>
  );
}

function getStrongestSubject(subjects: SubjectProgress[]) {
  return [...subjects].sort((a, b) => b.progress - a.progress)[0];
}

function getWeakestSubject(subjects: SubjectProgress[]) {
  return [...subjects].sort((a, b) => a.progress - b.progress)[0];
}

function getBestAttendanceSubject(subjects: SubjectProgress[]) {
  return [...subjects].sort((a, b) => b.attendance - a.attendance)[0];
}

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
