import type { ReactNode } from "react";
import { BookOpenCheck, type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon: Icon = BookOpenCheck, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-soft px-5 py-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={24} strokeWidth={2.4} />
      </span>
      <h3 className="mt-4 text-[17px] font-bold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-md text-[14px] leading-6 text-text-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
