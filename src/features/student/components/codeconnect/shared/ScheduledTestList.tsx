import {
  CalendarClock,
  CheckCircle2,
  Clock,
  PlayCircle,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CodeConnectScheduledTest } from "../../../types/codeconnect.types";

type ScheduledTestListProps = {
  onOpenTest: (testId: string) => void;
  tests: CodeConnectScheduledTest[];
};

export function ScheduledTestList({ onOpenTest, tests }: ScheduledTestListProps) {
  return (
    <section className="grid gap-4">
      {tests.map((test) => (
        <article
          key={test.id}
          className="rounded-3xl border border-border bg-surface p-5 shadow-card"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-8 items-center rounded-2xl bg-primary-soft px-3 text-[12px] font-extrabold text-primary-dark">
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </span>
                <span className="inline-flex h-8 items-center rounded-2xl bg-surface-soft px-3 text-[12px] font-extrabold text-text-secondary">
                  {test.category.charAt(0).toUpperCase() + test.category.slice(1)}
                </span>
              </div>

              <h2 className="mt-3 text-[22px] font-extrabold leading-8 text-text-primary">
                {test.title}
              </h2>
              <p className="mt-2 max-w-4xl text-[14px] font-bold leading-6 text-text-secondary">
                {test.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenTest(test.id)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
            >
              <PlayCircle aria-hidden="true" size={18} strokeWidth={2.5} />
              Open Test
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <TestMeta
              icon={Clock}
              label="Duration"
              value={`${test.durationMinutes} min`}
            />
            <TestMeta
              icon={CheckCircle2}
              label="Questions"
              value={test.totalQuestions.toString()}
            />
            <TestMeta
              icon={CalendarClock}
              label="Starts"
              value={formatDateTime(test.availableFrom)}
            />
            <TestMeta
              icon={UserRound}
              label="Created By"
              value={test.createdBy}
            />
            <TestMeta
              icon={CheckCircle2}
              label="Total Points"
              value={test.totalPoints.toString()}
            />
          </div>
        </article>
      ))}
    </section>
  );
}

function TestMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-soft p-4">
      <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-text-muted">
        <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
        {label}
      </span>
      <p className="mt-2 break-words text-[14px] font-extrabold leading-5 text-text-primary">
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}
