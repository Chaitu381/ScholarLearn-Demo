import type { UiTone } from "../../types/ui";
import { cn } from "../../utils/cn";

type StatusBadgeProps = {
  label: string;
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

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex h-7 items-center rounded-lg px-3 text-[12px] font-extrabold", toneClasses[tone])}>
      {label}
    </span>
  );
}
