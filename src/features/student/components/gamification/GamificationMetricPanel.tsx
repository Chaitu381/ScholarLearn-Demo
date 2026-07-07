import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../../shared/utils/cn";

type MetricTone = "blue" | "orange" | "primary" | "yellow";

const toneClasses: Record<MetricTone, string> = {
  blue: "bg-blue-soft text-blue",
  orange: "bg-orange-soft text-orange",
  primary: "bg-primary-soft text-primary-dark",
  yellow: "bg-yellow-soft text-text-primary",
};

export function GamificationMetricPanel({
  children,
  helper,
  icon: Icon,
  label,
  tone,
  value,
}: {
  children?: ReactNode;
  helper: string;
  icon: LucideIcon;
  label: string;
  tone: MetricTone;
  value: string;
}) {
  return (
    <motion.article
      className="rounded-2xl border border-border bg-surface-soft p-5"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
          <p className="mt-3 truncate text-[28px] font-extrabold leading-none text-text-primary">{value}</p>
          <p className="mt-2 text-[13px] leading-5 text-text-secondary">{helper}</p>
        </div>
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", toneClasses[tone])}>
          <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
        </span>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </motion.article>
  );
}
