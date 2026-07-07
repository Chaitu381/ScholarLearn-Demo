import type { LucideIcon } from "lucide-react";
import type { PracticeCategory, PracticeCategoryStats } from "../../types/codeconnect.types";

type CategoryCardProps = {
  buttonLabel: string;
  icon: LucideIcon;
  onSelect: (category: PracticeCategory) => void;
  stats: PracticeCategoryStats;
  subtitle: string;
};

export function CategoryCard({ buttonLabel, icon: Icon, onSelect, stats, subtitle }: CategoryCardProps) {
  const detailLabel = stats.category === "coding" ? `${stats.streakDays ?? 0} day streak` : `${stats.weakTopics.length} weak topics`;

  return (
    <article className="flex min-h-72 flex-col rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={24} strokeWidth={2.5} />
        </span>
        <span className="rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-secondary">
          {stats.accuracy}% accuracy
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h2 className="text-[22px] font-extrabold text-text-primary">{stats.label}</h2>
        <p className="mt-2 text-[14px] leading-6 text-text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-soft p-3">
          <p className="text-[12px] font-bold uppercase text-text-muted">Solved</p>
          <p className="mt-1 text-[22px] font-extrabold text-text-primary">{stats.solved}</p>
        </div>
        <div className="rounded-2xl bg-surface-soft p-3">
          <p className="text-[12px] font-bold uppercase text-text-muted">{stats.category === "coding" ? "Streak" : "Focus"}</p>
          <p className="mt-1 text-[16px] font-extrabold text-text-primary">{detailLabel}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {stats.weakTopics.slice(0, 3).map((topic) => (
          <span key={topic} className="rounded-full bg-orange-soft px-3 py-1 text-[12px] font-extrabold text-orange">
            {topic}
          </span>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 h-11 rounded-2xl bg-primary px-4 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
        onClick={() => onSelect(stats.category)}
      >
        {buttonLabel}
      </button>
    </article>
  );
}
