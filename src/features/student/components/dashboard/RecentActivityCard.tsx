import { Award, BookOpenCheck, CalendarCheck, CheckCircle2, Code2, FileCheck2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RecentActivity } from "../../types/student.types";

type RecentActivityCardProps = {
  activity: RecentActivity[];
};

const activityIcons: Record<RecentActivity["type"], LucideIcon> = {
  attendance: CalendarCheck,
  coding: Code2,
  assignment: FileCheck2,
  test: CheckCircle2,
  badge: Award,
  lesson: BookOpenCheck,
};

export function RecentActivityCard({ activity }: RecentActivityCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-extrabold text-text-primary">Recent activity</h2>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
          Live
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {activity.map((item) => {
          const Icon = activityIcons[item.type];

          return (
            <article key={item.id} className="flex gap-3">
              <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-soft text-blue">
                <Icon aria-hidden="true" size={17} strokeWidth={2.5} />
              </span>
              <div className="min-w-0 border-b border-border pb-3 last:border-b-0 last:pb-0">
                <p className="text-[14px] font-extrabold leading-5 text-text-primary">{item.title}</p>
                <p className="mt-1 text-[13px] leading-5 text-text-secondary">{item.detail}</p>
                <p className="mt-1 text-[12px] font-semibold text-text-muted">{formatActivityTime(item.timestamp)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatActivityTime(timestamp: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
