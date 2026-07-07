import type { UiTone } from "../../types/ui";
import { cn } from "../../utils/cn";

type MetricPillProps = {
  label: string;
  value: string | number;
  tone?: UiTone;
};

const toneClasses: Record<UiTone, string> = {
  primary: "bg-primary-soft text-primary-dark",
  blue: "bg-blue-soft text-blue",
  yellow: "bg-yellow-soft text-text-primary",
  orange: "bg-orange-soft text-orange",
  red: "bg-red-soft text-red",
  neutral: "bg-surface-soft text-text-secondary",
};

export function MetricPill({ label, value, tone = "neutral" }: MetricPillProps) {
  return (
    <span className={cn("inline-flex min-h-8 items-center gap-2 rounded-lg px-3 text-[13px]", toneClasses[tone])}>
      <span className="font-semibold">{label}</span>
      <span className="font-extrabold">{value}</span>
    </span>
  );
}
