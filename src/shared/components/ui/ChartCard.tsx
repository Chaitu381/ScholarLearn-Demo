import type { ReactElement, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

type ChartCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactElement;
  height?: number;
};

export function ChartCard({ title, description, action, children, height = 260 }: ChartCardProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold leading-7 text-text-primary">{title}</h2>
          {description ? <p className="mt-1 text-[14px] leading-6 text-text-secondary">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div style={{ height }}>
        {children ? (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-surface-soft text-[14px] font-semibold text-text-secondary">
            Chart area ready for data
          </div>
        )}
      </div>
    </section>
  );
}
