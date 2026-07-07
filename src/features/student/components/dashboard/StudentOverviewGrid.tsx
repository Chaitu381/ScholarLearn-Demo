import { Award, CalendarCheck, ClipboardList, Flame, Medal, Puzzle } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { OverviewStat } from "../../types/student.types";
import type { UiTone } from "../../../../shared/types/ui";
import { cn } from "../../../../shared/utils/cn";

type StudentOverviewGridProps = {
  stats: OverviewStat[];
};

const statIcons: Record<string, LucideIcon> = {
  attendance: CalendarCheck,
  "problem-solving": Puzzle,
  "average-score": Award,
  "pending-assignments": ClipboardList,
  rank: Medal,
  "coding-streak": Flame,
};

const toneClasses: Record<UiTone, string> = {
  primary: "bg-primary-soft text-primary-dark",
  blue: "bg-blue-soft text-blue",
  yellow: "bg-yellow-soft text-text-primary",
  orange: "bg-orange-soft text-orange",
  red: "bg-red-soft text-red",
  neutral: "bg-surface-soft text-text-secondary",
};

export function StudentOverviewGrid({ stats }: StudentOverviewGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
      {stats.map((stat, index) => {
        const Icon = statIcons[stat.id] ?? Award;

        return (
          <motion.article
            key={stat.id}
            className="rounded-3xl border border-border bg-surface p-5 shadow-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: index * 0.03, ease: "easeOut" }}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold uppercase text-text-muted">{stat.label}</p>
                <p className="mt-3 text-[28px] font-extrabold leading-none text-text-primary">{stat.value}</p>
              </div>
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", toneClasses[stat.tone])}>
                <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
              </span>
            </div>
            <div className="mt-4">
              <span className={cn("inline-flex rounded-full px-3 py-1 text-[12px] font-extrabold", toneClasses[stat.tone])}>
                {stat.status}
              </span>
              {stat.helperText ? <p className="mt-2 text-[13px] leading-5 text-text-secondary">{stat.helperText}</p> : null}
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
