import type { ReactElement, ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ResponsiveContainer } from "recharts";
import type { UiTone } from "../../../shared/types/ui";
import { cn } from "../../../shared/utils/cn";

type Tone = UiTone;

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-dark",
  blue: "bg-blue-soft text-blue",
  yellow: "bg-yellow-soft text-text-primary",
  orange: "bg-orange-soft text-orange",
  red: "bg-red-soft text-red",
  neutral: "bg-surface-soft text-text-secondary",
};

const solidToneClasses: Record<Exclude<Tone, "neutral">, string> = {
  primary: "bg-primary",
  blue: "bg-blue",
  yellow: "bg-yellow",
  orange: "bg-orange",
  red: "bg-red",
};

export function StudentPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function PageCard({
  action,
  children,
  className,
  description,
  icon: Icon,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  icon?: LucideIcon;
  title?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6", className)}>
      {(title || description || Icon || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                <Icon aria-hidden="true" size={22} strokeWidth={2.5} />
              </span>
            ) : null}
            <div className="min-w-0">
              {title ? <h2 className="text-[21px] font-extrabold leading-7 text-text-primary">{title}</h2> : null}
              {description ? <p className="mt-1 text-[14px] leading-6 text-text-secondary">{description}</p> : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function MetricCard({
  helper,
  icon: Icon,
  label,
  tone = "neutral",
  value,
}: {
  helper?: string;
  icon?: LucideIcon;
  label: string;
  tone?: Tone;
  value: string | number;
}) {
  return (
    <motion.article
      className="rounded-3xl border border-border bg-surface p-5 shadow-card"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
          <p className="mt-3 text-[28px] font-extrabold leading-none text-text-primary">{value}</p>
        </div>
        {Icon ? (
          <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", toneClasses[tone])}>
            <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-3 text-[13px] leading-5 text-text-secondary">{helper}</p> : null}
    </motion.article>
  );
}

export function ToneBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span className={cn("inline-flex h-7 items-center rounded-full px-3 text-[12px] font-extrabold", toneClasses[tone])}>
      {label}
    </span>
  );
}

export function FilterTabs({
  active,
  items,
  onChange,
}: {
  active: string;
  items: string[];
  onChange?: (item: string) => void;
}) {
  return (
    <div className="scrollbar-none flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-border bg-surface-soft p-1">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange?.(item)}
          className={cn(
            "h-9 shrink-0 rounded-xl px-4 text-[13px] font-extrabold transition",
            item === active
              ? "bg-surface text-text-primary shadow-card"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function ChartShell({
  children,
  className,
  description,
  height = 260,
  title,
}: {
  children: ReactElement;
  className?: string;
  description?: string;
  height?: number;
  title: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface-soft p-4", className)}>
      <h3 className="text-[16px] font-extrabold text-text-primary">{title}</h3>
      {description ? <p className="mt-1 text-[13px] leading-5 text-text-secondary">{description}</p> : null}
      <div className="mt-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="text-[13px] font-bold text-text-secondary">{label}</span>
      <span className="text-right text-[14px] font-extrabold text-text-primary">{value}</span>
    </div>
  );
}

export function ToggleRow({
  checked,
  description,
  label,
}: {
  checked: boolean;
  description: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-soft p-4">
      <div className="min-w-0">
        <p className="text-[14px] font-extrabold text-text-primary">{label}</p>
        <p className="mt-1 text-[13px] leading-5 text-text-secondary">{description}</p>
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition",
          checked ? "justify-end bg-primary" : "justify-start bg-border",
        )}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow-card" />
      </span>
    </div>
  );
}

export function MiniProgress({
  label,
  tone = "primary",
  value,
}: {
  label: string;
  tone?: Exclude<Tone, "neutral">;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-[13px] font-bold text-text-secondary">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-surface-soft">
        <div className={cn("h-full rounded-full", solidToneClasses[tone])} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
      </div>
    </div>
  );
}

export function toneForPercentage(value: number): Exclude<Tone, "neutral"> {
  if (value >= 85) {
    return "primary";
  }

  if (value >= 75) {
    return "orange";
  }

  return "red";
}

export const chartTooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  color: "var(--text-primary)",
};
