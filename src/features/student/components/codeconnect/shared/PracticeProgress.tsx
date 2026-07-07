import { BarChart3, Bookmark, CheckCircle2, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PracticeProgressProps = {
  accuracy: number;
  bookmarked: number;
  bookmarkedLabel?: string;
  correct: number;
  submitted: number;
  total: number;
};

export function PracticeProgress({
  accuracy,
  bookmarked,
  bookmarkedLabel = "Bookmarked",
  correct,
  submitted,
  total,
}: PracticeProgressProps) {
  const completion = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <section className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">Practice progress</p>
          <h2 className="mt-1 text-[18px] font-extrabold text-text-primary">{completion}% complete</h2>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Target aria-hidden="true" size={20} strokeWidth={2.5} />
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-surface-soft">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ProgressMetric icon={CheckCircle2} label="Correct" value={`${correct}/${submitted || 0}`} />
        <ProgressMetric icon={BarChart3} label="Accuracy" value={`${accuracy}%`} />
        <ProgressMetric icon={Bookmark} label={bookmarkedLabel} value={bookmarked} />
        <ProgressMetric icon={Target} label="Total" value={total} />
      </div>
    </section>
  );
}

function ProgressMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <article className="rounded-2xl bg-surface-soft p-3">
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" size={15} strokeWidth={2.5} className="text-primary-dark" />
        <span className="text-[11px] font-extrabold uppercase text-text-muted">{label}</span>
      </div>
      <p className="mt-2 text-[18px] font-extrabold leading-none text-text-primary">{value}</p>
    </article>
  );
}
