import { CalendarCheck, ClipboardCheck, Code2, FileCheck2, Lightbulb, type LucideIcon } from "lucide-react";
import type { Recommendation } from "../../types/student.types";
import type { UiTone } from "../../../../shared/types/ui";
import { cn } from "../../../../shared/utils/cn";

type RecommendationsCardProps = {
  recommendations: Recommendation[];
};

const toneClasses: Record<UiTone, string> = {
  primary: "bg-primary-soft text-primary-dark",
  blue: "bg-blue-soft text-blue",
  yellow: "bg-yellow-soft text-text-primary",
  orange: "bg-orange-soft text-orange",
  red: "bg-red-soft text-red",
  neutral: "bg-surface-soft text-text-secondary",
};

const priorityClasses: Record<Recommendation["priority"], string> = {
  high: "bg-red-soft text-red",
  medium: "bg-orange-soft text-orange",
  low: "bg-blue-soft text-blue",
};

const categoryIcons: Record<Recommendation["category"], LucideIcon> = {
  attendance: CalendarCheck,
  tests: ClipboardCheck,
  coding: Code2,
  assignments: FileCheck2,
};

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-extrabold uppercase text-text-muted">Weak areas / recommendations</p>
          <h2 className="mt-2 text-[21px] font-extrabold text-text-primary">This week's improvement plan</h2>
          <p className="mt-1 text-[14px] leading-6 text-text-secondary">
            Priority actions for attendance, tests, coding, and assignments
          </p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Lightbulb aria-hidden="true" size={24} strokeWidth={2.5} />
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {recommendations.map((recommendation) => (
          <RecommendationItem key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </section>
  );
}

function RecommendationItem({ recommendation }: { recommendation: Recommendation }) {
  const Icon = categoryIcons[recommendation.category];

  return (
    <article className="flex min-h-64 flex-col rounded-2xl border border-border bg-surface-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", toneClasses[recommendation.tone])}>
          <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
        </span>
        <span className={cn("rounded-full px-3 py-1 text-[11px] font-extrabold capitalize", priorityClasses[recommendation.priority])}>
          {recommendation.priority}
        </span>
      </div>
      <p className="mt-4 text-[12px] font-extrabold uppercase text-text-muted">{recommendation.category}</p>
      <h3 className="mt-1 text-[16px] font-extrabold leading-6 text-text-primary">{recommendation.title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-text-secondary">{recommendation.reason}</p>
      <div className="mt-4 flex-1 rounded-2xl bg-surface p-3">
        <p className="text-[12px] font-bold uppercase text-text-muted">Suggested action</p>
        <p className="mt-1 text-[13px] font-bold leading-5 text-text-primary">{recommendation.suggestedAction}</p>
      </div>
      <button
        type="button"
        className="mt-4 h-10 rounded-2xl bg-surface px-4 text-[13px] font-extrabold text-text-primary transition hover:text-primary"
      >
        {recommendation.actionLabel}
      </button>
    </article>
  );
}
