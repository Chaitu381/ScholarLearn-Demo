import { motion } from "framer-motion";
import type { FounderStat } from "../types/founder.types";

const toneClasses: Record<FounderStat["tone"], string> = {
  blue: "bg-blue-soft text-blue",
  orange: "bg-orange-soft text-orange",
  primary: "bg-primary-soft text-primary-dark",
  red: "bg-red-soft text-red",
  yellow: "bg-yellow-soft text-text-primary",
};

export function FounderStatsCards({ stats }: { stats: FounderStat[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <motion.article
            key={stat.label}
            className="rounded-3xl border border-border bg-surface p-5 shadow-card"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-extrabold uppercase text-text-muted">{stat.label}</p>
                <p className="mt-3 text-[28px] font-extrabold leading-none text-text-primary">{stat.value}</p>
              </div>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${toneClasses[stat.tone]}`}>
                <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-text-secondary">{stat.description}</p>
          </motion.article>
        );
      })}
    </section>
  );
}
