import { CalendarClock, GraduationCap, UserRoundCheck, UsersRound } from "lucide-react";
import type { KeyboardEvent } from "react";
import type { FounderBatch } from "../types/founder.types";

const statusClass: Record<FounderBatch["status"], string> = {
  Active: "bg-primary-soft text-primary-dark",
  Completed: "bg-blue-soft text-blue",
  "Needs Attention": "bg-orange-soft text-orange",
};

export function FounderBatchCard({ batch, onOpen }: { batch: FounderBatch; onOpen?: (batchId: string) => void }) {
  const openBatch = () => onOpen?.(batch.batchId);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onOpen) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openBatch();
    }
  };

  return (
    <article
      className={`rounded-3xl border border-border bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-card ${
        onOpen ? "cursor-pointer" : ""
      }`}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={openBatch}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">{batch.course}</p>
          <h3 className="mt-1 truncate text-[20px] font-extrabold text-text-primary">{batch.name}</h3>
          <p className="mt-1 text-[13px] font-bold text-text-secondary">{batch.subject}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold ${statusClass[batch.status]}`}>
          {batch.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <FounderBatchChip icon={UsersRound} label="Students" value={batch.students} />
        <FounderBatchChip icon={GraduationCap} label="Score" value={`${batch.score}%`} />
        <FounderBatchChip icon={CalendarClock} label="Attendance" value={`${batch.attendance}%`} />
      </div>

      {batch.assignedLecturers?.length ? (
        <div className="mt-4 rounded-2xl bg-surface-soft px-3 py-3">
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase text-text-muted">
            <UserRoundCheck aria-hidden="true" size={15} strokeWidth={2.5} className="text-primary-dark" />
            Assigned lecturers
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {batch.assignedLecturers.map((lecturer) => (
              <span key={lecturer} className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-secondary">
                {lecturer}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl bg-surface-soft px-3 py-2 text-[12px] font-bold text-text-secondary">
        Next class <span className="float-right text-text-primary">{batch.nextClass}</span>
      </div>

      <button
        type="button"
        className="mt-4 h-10 w-full rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
        onClick={(event) => {
          event.stopPropagation();
          openBatch();
        }}
      >
        View Batch
      </button>
    </article>
  );
}

function FounderBatchChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl bg-surface-soft p-3">
      <Icon aria-hidden="true" className="text-primary-dark" size={16} strokeWidth={2.5} />
      <p className="mt-2 text-[15px] font-extrabold text-text-primary">{value}</p>
      <p className="text-[11px] font-extrabold uppercase text-text-muted">{label}</p>
    </div>
  );
}
