import { ClipboardList } from "lucide-react";
import type { Assignment } from "../../types/student.types";
import { cn } from "../../../../shared/utils/cn";

type UpcomingAssignmentsCardProps = {
  assignments: Assignment[];
};

const priorityClasses: Record<Assignment["priority"], string> = {
  high: "bg-red-soft text-red",
  medium: "bg-orange-soft text-orange",
  low: "bg-blue-soft text-blue",
};

export function UpcomingAssignmentsCard({ assignments }: UpcomingAssignmentsCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <CardHeader title="Upcoming assignments" icon={ClipboardList} />
      <div className="mt-4 space-y-3">
        {assignments.slice(0, 3).map((assignment) => (
          <article key={assignment.id} className="rounded-2xl bg-surface-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[14px] font-extrabold leading-5 text-text-primary">{assignment.title}</h3>
                <p className="mt-1 text-[12px] font-semibold text-text-secondary">{assignment.subject}</p>
              </div>
              <span className={cn("shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold", priorityClasses[assignment.priority])}>
                {assignment.priority}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <InfoPill label="Due" value={formatShortDate(assignment.dueDate)} />
              <InfoPill label="Status" value={assignment.status} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CardHeader({ title, icon: Icon }: { title: string; icon: typeof ClipboardList }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[18px] font-extrabold text-text-primary">{title}</h2>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-soft text-blue">
        <Icon aria-hidden="true" size={20} strokeWidth={2.5} />
      </span>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-text-secondary">
      {label}: <strong className="font-extrabold capitalize text-text-primary">{value}</strong>
    </span>
  );
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
}
