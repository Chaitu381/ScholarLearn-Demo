import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileQuestion,
  Lock,
  PlayCircle,
  ShieldCheck,
  Timer,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CodeConnectScheduledTest } from "../../../types/codeconnect.types";

type EntryState = "upcoming" | "active" | "expired" | "completed";

type ScheduledTestEntryProps = {
  onBack: () => void;
  onStartTest: (testId: string) => void;
  test: CodeConnectScheduledTest;
};

export function ScheduledTestEntry({
  onBack,
  onStartTest,
  test,
}: ScheduledTestEntryProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const timing = useMemo(() => getTestTiming(test, nowMs), [nowMs, test]);

  useEffect(() => {
    if (timing.state !== "upcoming" && timing.state !== "active") {
      return;
    }

    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [timing.state]);

  const canStart = timing.state === "active";
  const timer = getTimerInfo(timing.state, test, nowMs);

  return (
    <section className="h-full min-h-0 overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.34fr)]">
        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-border bg-surface-soft px-4 text-[12px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                >
                  <ArrowLeft aria-hidden="true" size={15} strokeWidth={2.5} />
                  Back
                </button>

                <span className={statusClassName(timing.state)}>
                  {statusLabel(timing.state)}
                </span>

                <span className="inline-flex h-8 items-center rounded-2xl bg-surface-soft px-3 text-[12px] font-extrabold text-text-secondary">
                  {formatCategory(test.category)}
                </span>
              </div>

              <h2 className="mt-3 text-[28px] font-extrabold leading-tight text-text-primary">
                {test.title}
              </h2>

              <p className="mt-2 max-w-4xl text-[13px] font-bold leading-6 text-text-secondary">
                {test.description}
              </p>
            </div>

            {/* <button
              type="button"
              disabled={!canStart}
              onClick={() => onStartTest(test.id)}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted"
            >
              {canStart ? (
                <PlayCircle aria-hidden="true" size={17} strokeWidth={2.5} />
              ) : (
                <Lock aria-hidden="true" size={17} strokeWidth={2.5} />
              )}
              {canStart ? "Start Test" : disabledLabel(timing.state)}
            </button> */}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard label="Duration" value={`${test.durationMinutes} min`} />
              <MetricCard label="Questions" value={test.totalQuestions.toString()} />
              <MetricCard label="Total Points" value={test.totalPoints.toString()} />
              <MetricCard label="Category" value={formatCategory(test.category)} />
            </div>

            <div className={timerCardClassName(timing.state)}>
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase text-text-secondary">
                <Timer aria-hidden="true" size={16} strokeWidth={2.5} />
                {timer.title}
              </div>

              <p className="mt-2 font-mono text-[32px] font-extrabold leading-none text-text-primary">
                {timer.value}
              </p>

              <p className="mt-2 text-[12px] font-bold text-text-secondary">
                {timer.helper}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface-soft p-3.5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-orange-soft text-orange">
                {timing.state === "active" ? (
                  <PlayCircle aria-hidden="true" size={19} strokeWidth={2.5} />
                ) : timing.state === "upcoming" ? (
                  <CalendarClock aria-hidden="true" size={19} strokeWidth={2.5} />
                ) : (
                  <Lock aria-hidden="true" size={19} strokeWidth={2.5} />
                )}
              </span>

              <div className="min-w-0">
                <p className="text-[15px] font-extrabold text-text-primary">
                  {entryTitle(timing.state)}
                </p>

                <p className="mt-1 text-[13px] font-bold leading-5 text-text-secondary">
                  {entryMessage(timing.state, test)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <InstructionCard
              icon={ShieldCheck}
              title="Timed exam"
              description="The timer starts after you enter the exam workspace."
            />

            <InstructionCard
              icon={FileQuestion}
              title="MCQ workspace"
              description={`${test.totalQuestions} questions will be loaded from this test.`}
            />

            <InstructionCard
              icon={CheckCircle2}
              title="Final submit"
              description="Submit before the window closes to save the attempt."
            />
          </div>

          <div className="mt-4 grid min-h-0 grid-cols-2 gap-3">
            <InfoPanel title="Student instructions">
              <ChecklistItem text="Keep this browser tab open during the exam." />
              <ChecklistItem text="Do not refresh after the test starts." />
              <ChecklistItem text="Answer all MCQs before final submission." />
              <ChecklistItem text="Use the countdown to manage remaining time." />
            </InfoPanel>

            <InfoPanel title="Exam window">
              <TimelineRow
                label="Scheduled"
                value={formatDateTime(test.scheduledAt)}
              />
              <TimelineRow
                label="Available from"
                value={formatDateTime(test.availableFrom)}
              />
              <TimelineRow
                label="Available until"
                value={formatDateTime(test.availableUntil)}
              />
            </InfoPanel>
          </div>
        </div>

        <aside className="min-h-0 rounded-3xl border border-border bg-surface-soft p-4">
          <p className="text-[13px] font-extrabold uppercase text-text-muted">
            Test details
          </p>

          <div className="mt-3 grid gap-2.5">
            <Meta icon={UserRound} label="Created By" value={test.createdBy} />
            <Meta
              icon={CalendarClock}
              label="Scheduled"
              value={formatDateTime(test.scheduledAt)}
            />
            <Meta
              icon={CalendarClock}
              label="Available From"
              value={formatDateTime(test.availableFrom)}
            />
            <Meta
              icon={Clock}
              label="Available Until"
              value={formatDateTime(test.availableUntil)}
            />
            <Meta
              icon={Clock}
              label="Duration"
              value={`${test.durationMinutes} min`}
            />
            <Meta
              icon={CheckCircle2}
              label="Questions"
              value={test.totalQuestions.toString()}
            />
            <Meta
              icon={CheckCircle2}
              label="Total Points"
              value={test.totalPoints.toString()}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-3.5">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-2 text-[18px] font-extrabold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function InstructionCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-3.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      </span>

      <p className="mt-3 text-[13px] font-extrabold text-text-primary">
        {title}
      </p>

      <p className="mt-1 text-[12px] font-bold leading-5 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function InfoPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-3.5">
      <p className="text-[13px] font-extrabold text-text-primary">{title}</p>
      <div className="mt-2.5 space-y-2">{children}</div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-[12px] font-bold leading-5 text-text-secondary">
      <CheckCircle2
        aria-hidden="true"
        size={15}
        strokeWidth={2.5}
        className="mt-0.5 shrink-0 text-primary"
      />
      <span>{text}</span>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
      <span className="text-[11px] font-extrabold uppercase text-text-muted">
        {label}
      </span>

      <span className="text-right text-[12px] font-extrabold text-text-primary">
        {value}
      </span>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase text-text-muted">
        <Icon aria-hidden="true" size={14} strokeWidth={2.5} />
        {label}
      </span>

      <p className="mt-2 break-words text-[13px] font-extrabold leading-5 text-text-primary">
        {value}
      </p>
    </div>
  );
}

function getTestTiming(test: CodeConnectScheduledTest, nowMs: number) {
  const availableFromMs = parseDateMs(test.availableFrom) ?? nowMs;
  const availableUntilMs =
    parseDateMs(test.availableUntil) ?? Number.POSITIVE_INFINITY;

  if (test.status === "completed") {
    return { startsInMs: 0, state: "completed" as const };
  }

  if (nowMs < availableFromMs) {
    return {
      startsInMs: availableFromMs - nowMs,
      state: "upcoming" as const,
    };
  }

  if (nowMs > availableUntilMs) {
    return { startsInMs: 0, state: "expired" as const };
  }

  return { startsInMs: 0, state: "active" as const };
}

function getTimerInfo(
  state: EntryState,
  test: CodeConnectScheduledTest,
  nowMs: number,
) {
  if (state === "upcoming") {
    return {
      title: "Test starts in",
      value: formatDuration((parseDateMs(test.availableFrom) ?? nowMs) - nowMs),
      helper: `Start unlocks at ${formatDateTime(test.availableFrom)}`,
    };
  }

  if (state === "active") {
    return {
      title: "Test window closes in",
      value: formatDuration((parseDateMs(test.availableUntil) ?? nowMs) - nowMs),
      helper: `Window closes at ${formatDateTime(test.availableUntil)}`,
    };
  }

  if (state === "expired") {
    return {
      title: "Test expired",
      value: "00:00:00",
      helper: `Expired at ${formatDateTime(test.availableUntil)}`,
    };
  }

  return {
    title: "Completed",
    value: "00:00:00",
    helper: "This test has already been completed.",
  };
}

function timerCardClassName(state: EntryState) {
  const base = "rounded-3xl border p-4";

  if (state === "active") {
    return `${base} border-primary/30 bg-primary-soft`;
  }

  if (state === "upcoming") {
    return `${base} border-blue/30 bg-blue-soft`;
  }

  if (state === "expired") {
    return `${base} border-red/30 bg-red-soft`;
  }

  return `${base} border-border bg-surface-soft`;
}

function statusClassName(state: EntryState) {
  const base =
    "inline-flex h-8 items-center rounded-2xl px-3 text-[12px] font-extrabold";

  if (state === "active") {
    return `${base} bg-primary-soft text-primary-dark`;
  }

  if (state === "upcoming") {
    return `${base} bg-blue-soft text-blue`;
  }

  if (state === "expired") {
    return `${base} bg-red-soft text-red`;
  }

  return `${base} bg-surface-soft text-text-secondary`;
}

function statusLabel(state: EntryState) {
  if (state === "active") {
    return "Active";
  }

  if (state === "upcoming") {
    return "Upcoming";
  }

  if (state === "expired") {
    return "Expired";
  }

  return "Completed";
}

function entryTitle(state: EntryState) {
  if (state === "active") {
    return "This test is available now";
  }

  if (state === "upcoming") {
    return "This test has not started yet";
  }

  if (state === "expired") {
    return "This test has expired";
  }

  return "This test is already completed";
}

function entryMessage(state: EntryState, test: CodeConnectScheduledTest) {
  if (state === "active") {
    return "Review the instructions, then start the timed exam workspace.";
  }

  if (state === "upcoming") {
    return `The Start Test button unlocks at ${formatDateTime(test.availableFrom)}.`;
  }

  if (state === "expired") {
    return "This test has expired. Contact your trainer if a retake is needed.";
  }

  return "A completed test can be reviewed if a saved local attempt exists.";
}

function disabledLabel(state: EntryState) {
  if (state === "upcoming") {
    return "Starts Soon";
  }

  if (state === "expired") {
    return "Test Expired";
  }

  return "Completed";
}

function formatCategory(category: CodeConnectScheduledTest["category"]) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function parseDateMs(value: string) {
  const dateMs = new Date(value).getTime();
  return Number.isNaN(dateMs) ? undefined : dateMs;
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
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