import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { navigateBackInLecturer } from "./LecturerShell";

type Tone = "blue" | "orange" | "primary" | "yellow" | "neutral";
type LecturerBackButtonVariant = "dark" | "light";

const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-soft text-blue",
  neutral: "bg-surface-soft text-text-secondary",
  orange: "bg-orange-soft text-orange",
  primary: "bg-primary-soft text-primary-dark",
  yellow: "bg-yellow-soft text-text-primary",
};

export function LecturerPage({ children }: { children: ReactNode }) {
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

export function LecturerPageTitle({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[30px] font-extrabold leading-tight text-text-primary sm:text-[34px]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function LecturerBackButton({
  className,
  fallbackPath,
  label = "Back",
  variant = "light",
}: {
  className?: string;
  fallbackPath?: string;
  label?: string;
  variant?: LecturerBackButtonVariant;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 w-fit items-center gap-2 rounded-xl border px-3 text-[13px] font-extrabold transition focus:outline-none focus:ring-2",
        variant === "dark"
          ? "border-white/10 bg-white/[0.075] text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100 focus:ring-cyan-300/25"
          : "border-border bg-surface text-text-secondary hover:border-primary hover:bg-primary-soft hover:text-primary-dark focus:ring-primary/25",
        className,
      )}
      onClick={() => navigateBackInLecturer(fallbackPath)}
    >
      <ArrowLeft aria-hidden="true" size={15} strokeWidth={2.6} />
      {label}
    </button>
  );
}

export function LecturerCard({
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
    <motion.section
      className={cn(
        "rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6",
        className,
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
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
    </motion.section>
  );
}

export function LecturerMetric({
  description,
  icon: Icon,
  label,
  tone = "neutral",
  value,
}: {
  description?: string;
  icon?: LucideIcon;
  label: string;
  tone?: Tone;
  value: string | number;
}) {
  return (
    <LecturerCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
          <p className="mt-3 text-[28px] font-extrabold leading-none text-text-primary">{value}</p>
        </div>
        {Icon ? (
          <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", toneClasses[tone])}>
            <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
      {description ? <p className="mt-3 text-[13px] leading-5 text-text-secondary">{description}</p> : null}
    </LecturerCard>
  );
}

export function LecturerBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return <span className={cn("inline-flex h-7 items-center rounded-full px-3 text-[12px] font-extrabold", toneClasses[tone])}>{label}</span>;
}
