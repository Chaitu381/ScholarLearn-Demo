import type { UiTone } from "../../types/ui";
import { cn } from "../../utils/cn";

type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  tone?: Exclude<UiTone, "neutral">;
  showValue?: boolean;
};

const toneClasses: Record<Exclude<UiTone, "neutral">, string> = {
  primary: "bg-primary",
  blue: "bg-blue",
  yellow: "bg-yellow",
  orange: "bg-orange",
  red: "bg-red",
};

export function ProgressBar({ value, max = 100, label, tone = "primary", showValue = true }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-[13px] font-bold text-text-secondary">
          {label ? <span>{label}</span> : <span />}
          {showValue ? <span>{Math.round(percentage)}%</span> : null}
        </div>
      )}
      <div
        className="h-3 overflow-hidden rounded-lg bg-surface-soft"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div className={cn("h-full rounded-lg transition-all", toneClasses[tone])} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
