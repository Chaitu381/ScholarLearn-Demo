import type { ScholarLearnMetric, ScholarLearnMetricTone } from "../types/scholarLearn.types";

export function ScholarLearnStatsCards({ metrics }: { metrics: ScholarLearnMetric[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article
            key={metric.label}
            className="rounded-3xl border border-border bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
          >
            <div className="flex items-start gap-3">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${metricToneClass(metric.tone)}`}>
                <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[24px] font-extrabold text-text-primary">{metric.value}</p>
                <p className="text-[13px] font-extrabold text-text-primary">{metric.label}</p>
                <p className="mt-1 text-[12px] font-semibold leading-5 text-text-secondary">{metric.description}</p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function metricToneClass(tone: ScholarLearnMetricTone) {
  if (tone === "blue") return "bg-blue-soft text-blue";
  if (tone === "orange") return "bg-orange-soft text-orange";
  if (tone === "red") return "bg-red-soft text-red";
  if (tone === "yellow") return "bg-yellow-soft text-yellow";
  return "bg-primary-soft text-primary-dark";
}
