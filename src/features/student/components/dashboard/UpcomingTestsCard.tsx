import { Trophy } from "lucide-react";
import type { UpcomingTest } from "../../types/student.types";

type UpcomingTestsCardProps = {
  tests: UpcomingTest[];
};

export function UpcomingTestsCard({ tests }: UpcomingTestsCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-extrabold text-text-primary">Upcoming tests & exams</h2>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-yellow-soft text-text-primary">
          <Trophy aria-hidden="true" size={20} strokeWidth={2.5} />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {tests.map((test) => (
          <article key={test.id} className="rounded-2xl bg-surface-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[14px] font-extrabold leading-5 text-text-primary">{test.title}</h3>
                <p className="mt-1 text-[12px] font-semibold text-text-secondary">{test.subject}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-extrabold text-primary-dark">
                {test.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <InfoPill label="Date" value={formatShortDate(test.date)} />
              <InfoPill label="Duration" value={`${test.durationMinutes} min`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-text-secondary">
      {label}: <strong className="font-extrabold text-text-primary">{value}</strong>
    </span>
  );
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
}
