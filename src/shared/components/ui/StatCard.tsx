import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { UiTone } from "../../types/ui";
import { cn } from "../../utils/cn";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  tone?: UiTone;
  footer?: ReactNode;
};

const toneClasses: Record<UiTone, string> = {
  primary: "bg-primary-soft text-primary-dark",
  blue: "bg-blue-soft text-blue",
  yellow: "bg-yellow-soft text-text-primary",
  orange: "bg-orange-soft text-orange",
  red: "bg-red-soft text-red",
  neutral: "bg-surface-soft text-text-secondary",
};

export function StatCard({ title, value, description, icon: Icon, tone = "primary", footer }: StatCardProps) {
  return (
    <motion.article
      className="rounded-lg border border-border bg-surface p-5 shadow-card"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-bold uppercase tracking-normal text-text-secondary">{title}</p>
          <p className="mt-2 text-[30px] font-extrabold leading-none text-text-primary">{value}</p>
        </div>
        {Icon ? (
          <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-lg", toneClasses[tone])}>
            <Icon aria-hidden="true" size={22} strokeWidth={2.4} />
          </span>
        ) : null}
      </div>
      {description ? <p className="mt-3 text-[14px] leading-6 text-text-secondary">{description}</p> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </motion.article>
  );
}
