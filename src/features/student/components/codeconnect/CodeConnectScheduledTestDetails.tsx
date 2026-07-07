import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileQuestion,
  PlayCircle,
  ShieldCheck,
  Timer,
  UserRound,
} from "lucide-react";
import type { CodeConnectScheduledTest } from "../../types/codeconnect.types";

type CodeConnectScheduledTestDetailsProps = {
  test: CodeConnectScheduledTest;
  onBack: () => void;
  onStartTest: (testId: string) => void;
};

type AvailabilityState = "available" | "upcoming" | "closed";

const categoryLabel: Partial<
  Record<CodeConnectScheduledTest["category"], string>
> = {
  aptitude: "Aptitude",
  reasoning: "Reasoning",
  verbal: "Verbal",
};

export function CodeConnectScheduledTestDetails({
  test,
  onBack,
  onStartTest,
}: CodeConnectScheduledTestDetailsProps) {
  const [nowMs, setNowMs] = useState(Date.now);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const availability = getAvailabilityState(test, nowMs);
  const canStart = availability === "available";
  const readableCategory = getCategoryLabel(test.category);

  const timerInfo = useMemo(() => {
    if (availability === "upcoming") {
      return {
        title: "Test starts in",
        value: formatDuration(new Date(test.availableFrom).getTime() - nowMs),
        helper: `Starts at ${formatDateTime(test.availableFrom)}`,
      };
    }

    if (availability === "available") {
      return {
        title: "Test window closes in",
        value: formatDuration(new Date(test.availableUntil).getTime() - nowMs),
        helper: `Closes at ${formatDateTime(test.availableUntil)}`,
      };
    }

    return {
      title: "Test closed",
      value: "00:00:00",
      helper: `Closed at ${formatDateTime(test.availableUntil)}`,
    };
  }, [availability, nowMs, test.availableFrom, test.availableUntil]);

  return (
    <main className="h-[calc(100dvh-76px)] overflow-hidden bg-[#0d1822] px-5 py-4 text-white">
      <section className="mx-auto grid h-full max-w-[1480px] grid-cols-[minmax(0,1fr)_330px] gap-4">
        <div className="flex min-h-0 flex-col rounded-[26px] border border-slate-700/70 bg-[#14212c] p-5 shadow-2xl">
          <div className="grid grid-cols-[minmax(0,1fr)_330px] gap-5">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-black ${
                    availability === "available"
                      ? "bg-lime-500/20 text-lime-400"
                      : availability === "upcoming"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {availability === "available"
                    ? "Active"
                    : availability === "upcoming"
                      ? "Upcoming"
                      : "Closed"}
                </span>

                <span className="rounded-full bg-slate-700/70 px-4 py-1.5 text-xs font-black text-slate-200">
                  {readableCategory}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
                {test.title}
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
                {test.description}
              </p>
            </div>

            <div
              className={`rounded-3xl border p-5 ${
                availability === "available"
                  ? "border-lime-500/30 bg-lime-500/10"
                  : availability === "upcoming"
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-red-500/30 bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-300">
                <Timer size={17} />
                {timerInfo.title}
              </div>

              <div className="mt-3 font-mono text-4xl font-black text-white">
                {timerInfo.value}
              </div>

              <p className="mt-2 text-xs font-bold text-slate-300">
                {timerInfo.helper}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-4">
            <MetricCard label="Duration" value={`${test.durationMinutes} min`} />
            <MetricCard label="Questions" value={String(test.totalQuestions)} />
            <MetricCard label="Points" value={String(test.totalPoints)} />
            <MetricCard label="Type" value={readableCategory} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-700 bg-[#1b2b38] p-4">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  availability === "available"
                    ? "bg-lime-500/15 text-lime-400"
                    : availability === "upcoming"
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-red-500/15 text-red-300"
                }`}
              >
                {availability === "available" ? (
                  <PlayCircle size={22} />
                ) : availability === "upcoming" ? (
                  <Timer size={22} />
                ) : (
                  <Clock size={22} />
                )}
              </div>

              <div>
                <h2 className="text-base font-black text-white">
                  {availability === "available"
                    ? "This test is available now"
                    : availability === "upcoming"
                      ? "This test has not started yet"
                      : "This test is no longer available"}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {availability === "available"
                    ? "Review the instructions, then start the timed exam workspace."
                    : availability === "upcoming"
                      ? `You can start this test from ${formatDateTime(
                          test.availableFrom,
                        )}.`
                      : `The test window ended at ${formatDateTime(
                          test.availableUntil,
                        )}.`}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4">
            <InstructionCard
              icon={<ShieldCheck size={19} />}
              title="Timed Exam"
              description="The countdown starts after entering the exam workspace."
            />

            <InstructionCard
              icon={<FileQuestion size={19} />}
              title="MCQ Questions"
              description={`${test.totalQuestions} questions will be loaded for this scheduled test.`}
            />

            <InstructionCard
              icon={<CheckCircle2 size={19} />}
              title="Final Submit"
              description="Submit before the test window ends to avoid losing progress."
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <InfoPanel title="Student instructions">
              <ChecklistItem text="Keep this tab open until you submit the test." />
              <ChecklistItem text="Do not refresh the page during the exam." />
              <ChecklistItem text="Answer all visible MCQs before final submission." />
              <ChecklistItem text="Use the timer to plan your remaining questions." />
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

          <div className="mt-auto flex items-center justify-between pt-5">
            {/* <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#1b2b38] px-6 py-3 text-sm font-black text-white transition hover:bg-[#233545]"
            >
              <ArrowLeft size={18} />
              Back
            </button> */}

            {/* <button
              type="button"
              disabled={!canStart}
              onClick={() => onStartTest(test.id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm font-black transition ${
                canStart
                  ? "bg-lime-500 text-white hover:bg-lime-400"
                  : "cursor-not-allowed bg-slate-700 text-slate-400"
              }`}
            >
              <PlayCircle size={18} />
              {canStart ? "Start Test" : "Not Available"}
            </button> */}
          </div>
        </div>

        <aside className="min-h-0 rounded-[26px] border border-slate-700/70 bg-[#1b2b38] p-4 shadow-2xl">
          <h2 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
            Test Details
          </h2>

          <div className="grid gap-2.5">
            <DetailCard
              icon={<UserRound size={16} />}
              label="Created By"
              value={test.createdBy}
            />

            <DetailCard
              icon={<CalendarClock size={16} />}
              label="Scheduled"
              value={formatDateTime(test.scheduledAt)}
            />

            <DetailCard
              icon={<CalendarClock size={16} />}
              label="Available From"
              value={formatDateTime(test.availableFrom)}
            />

            <DetailCard
              icon={<Clock size={16} />}
              label="Available Until"
              value={formatDateTime(test.availableUntil)}
            />

            <DetailCard
              icon={<Timer size={16} />}
              label="Duration"
              value={`${test.durationMinutes} min`}
            />

            <DetailCard
              icon={<FileQuestion size={16} />}
              label="Questions"
              value={String(test.totalQuestions)}
            />

            <DetailCard
              icon={<CheckCircle2 size={16} />}
              label="Total Points"
              value={String(test.totalPoints)}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#101b25] p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function InstructionCard({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#101b25] p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-lime-400">
        {icon}
      </div>

      <h3 className="text-sm font-black text-white">{title}</h3>

      <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
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
    <div className="rounded-2xl border border-slate-700 bg-[#101b25] p-4">
      <h3 className="mb-3 text-sm font-black text-white">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
      <CheckCircle2 size={15} className="shrink-0 text-lime-400" />
      <span>{text}</span>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#172533] px-3 py-2">
      <span className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-xs font-black text-white">{value}</span>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#101b25] p-3.5">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[11px] font-black uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

function getAvailabilityState(
  test: CodeConnectScheduledTest,
  nowMs: number,
): AvailabilityState {
  const from = new Date(test.availableFrom).getTime();
  const until = new Date(test.availableUntil).getTime();

  if (Number.isNaN(from) || Number.isNaN(until)) {
    return "closed";
  }

  if (nowMs < from) {
    return "upcoming";
  }

  if (nowMs > until) {
    return "closed";
  }

  return "available";
}

function getCategoryLabel(category: CodeConnectScheduledTest["category"]) {
  return categoryLabel[category] ?? "Practice";
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}