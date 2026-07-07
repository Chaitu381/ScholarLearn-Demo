import { cn } from "../../../../shared/utils/cn";

export function GamificationEmptyState({
  compact = false,
  description,
  title,
}: {
  compact?: boolean;
  description: string;
  title: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border bg-surface text-center", compact ? "p-4" : "p-6")}>
      <p className="text-[14px] font-extrabold text-text-primary">{title}</p>
      <p className="mt-2 text-[13px] leading-5 text-text-secondary">{description}</p>
    </div>
  );
}
