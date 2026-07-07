import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { BarChart3, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { DemoPreviewData, DemoPreviewMetric } from "./demoPreviewData";

type DemoPreviewLayoutProps = {
  data: DemoPreviewData;
};

type PreviewSectionProps = {
  children: ReactNode;
  className?: string;
};

type PreviewCardProps = {
  children: ReactNode;
  className?: string;
};

type PreviewMetricCardProps = {
  metric: DemoPreviewMetric;
};

type PreviewGraphCardProps = {
  description: string;
  metrics: DemoPreviewMetric[];
  title: string;
};

type PreviewLockedButtonProps = {
  label?: string;
};

type PreviewHoverCardProps = {
  children?: ReactNode;
  eyebrow?: string;
  title: string;
};

const metricToneClass: Record<DemoPreviewMetric["tone"], string> = {
  blue: "bg-blue-soft text-blue",
  orange: "bg-orange-soft text-orange",
  primary: "bg-primary-soft text-primary-dark",
  yellow: "bg-yellow-soft text-text-primary",
};

const metricDotClass: Record<DemoPreviewMetric["tone"], string> = {
  blue: "bg-blue",
  orange: "bg-orange",
  primary: "bg-primary",
  yellow: "bg-yellow",
};

const revealTransition: Transition = { duration: 0.24, ease: "easeOut" };
const hoverTransition: Transition = { duration: 0.18, ease: "easeOut" };

export function DemoPreviewLayout({ data }: DemoPreviewLayoutProps) {
  return (
    <PreviewSection className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">Role preview</p>
          <h2 className="mt-2 text-[24px] font-extrabold text-text-primary">{data.roleLabel} access preview</h2>
          <p className="mt-3 text-[14px] font-semibold leading-6 text-text-secondary">
            {data.description} This preview is separate from the real dashboard and unlocks only after approval.
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <ShieldCheck aria-hidden="true" size={21} strokeWidth={2.5} />
        </span>
      </div>

      <PreviewSection className="mt-5 grid gap-3 sm:grid-cols-3">
        {data.metrics.map((metric) => (
          <PreviewMetricCard key={metric.label} metric={metric} />
        ))}
      </PreviewSection>

      <PreviewSection className="mt-6 grid gap-3 sm:grid-cols-2">
        {data.features.map((feature) => (
          <PreviewHoverCard key={feature} eyebrow="Locked module" title={feature}>
            <PreviewLockedButton />
          </PreviewHoverCard>
        ))}
      </PreviewSection>

      <PreviewSection className="mt-6">
        <PreviewGraphCard
          description="A sample read-only analytics surface. It previews the kind of insights available after approval."
          metrics={data.metrics}
          title={`${data.roleLabel} activity preview`}
        />
      </PreviewSection>

      <PreviewSection className="mt-6 grid gap-4 md:grid-cols-2">
        {data.sections.map((section) => (
          <PreviewCard key={section.title} className="bg-surface-soft">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-extrabold text-text-primary">{section.title}</h3>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary-dark">
                <Sparkles aria-hidden="true" size={15} strokeWidth={2.5} />
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {section.items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-[13px] font-bold text-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <PreviewLockedButton label="Available after approval" />
            </div>
          </PreviewCard>
        ))}
      </PreviewSection>
    </PreviewSection>
  );
}

export function PreviewSection({ children, className = "" }: PreviewSectionProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={revealTransition}
    >
      {children}
    </motion.section>
  );
}

export function PreviewCard({ children, className = "" }: PreviewCardProps) {
  return (
    <motion.article
      className={`rounded-2xl border border-border p-4 ${className}`}
      whileHover={{ y: -2 }}
      transition={hoverTransition}
    >
      {children}
    </motion.article>
  );
}

export function PreviewMetricCard({ metric }: PreviewMetricCardProps) {
  return (
    <PreviewCard className={metricToneClass[metric.tone]}>
      <p className="text-[11px] font-extrabold uppercase opacity-80">{metric.label}</p>
      <p className="mt-1 text-[20px] font-extrabold">{metric.value}</p>
      <div className="mt-3 h-1.5 rounded-full bg-white/40">
        <div className={`h-full w-2/3 rounded-full ${metricDotClass[metric.tone]}`} />
      </div>
    </PreviewCard>
  );
}

export function PreviewGraphCard({ description, metrics, title }: PreviewGraphCardProps) {
  const bars = metrics.map((metric, index) => ({
    height: `${Math.max(38, 86 - index * 13)}%`,
    label: metric.label,
    tone: metric.tone,
  }));

  return (
    <PreviewCard className="bg-surface-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">Read-only analytics</p>
          <h3 className="mt-1 text-[17px] font-extrabold text-text-primary">{title}</h3>
          <p className="mt-2 text-[13px] font-semibold leading-5 text-text-secondary">{description}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue">
          <BarChart3 aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>
      </div>

      <div className="mt-5 flex h-36 items-end gap-3 rounded-2xl bg-surface p-4">
        {bars.map((bar) => (
          <div key={bar.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
            <motion.div
              className={`rounded-t-xl ${metricDotClass[bar.tone]}`}
              initial={{ height: 0 }}
              whileInView={{ height: bar.height }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
            />
            <p className="truncate text-center text-[10px] font-extrabold text-text-muted">{bar.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <PreviewLockedButton label="Analytics available after approval" />
      </div>
    </PreviewCard>
  );
}

export function PreviewLockedButton({ label = "Available after approval" }: PreviewLockedButtonProps) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-surface px-3 text-[12px] font-extrabold text-text-secondary opacity-80"
    >
      <LockKeyhole aria-hidden="true" size={14} strokeWidth={2.5} />
      {label}
    </button>
  );
}

export function PreviewHoverCard({ children, eyebrow = "Preview", title }: PreviewHoverCardProps) {
  return (
    <PreviewCard className="bg-surface-soft">
      <p className="text-[11px] font-extrabold uppercase text-text-muted">{eyebrow}</p>
      <h3 className="mt-1 text-[15px] font-extrabold text-text-primary">{title}</h3>
      {children ? <div className="mt-4">{children}</div> : null}
    </PreviewCard>
  );
}
