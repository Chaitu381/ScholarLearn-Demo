import {
  CheckCircle2,
  Clock,
  Cpu,
  FileInput,
  Play,
  Send,
  Sparkles,
  TestTube2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  CodingExecutionResult,
  CodingProblem,
  CodingTestCase,
} from "../../../types/codeconnect.types";
import { OutputConsole } from "./OutputConsole";
import { SubmissionResult } from "./SubmissionResult";

type OutputPanelProps = {
  customInputDefault: string;
  onRun: () => void;
  onSubmit: () => void;
  problem: CodingProblem;
  result: CodingExecutionResult;
};

type ConsoleStatus = "idle" | "running" | "success" | "error";

export function OutputPanel({
  customInputDefault,
  onRun,
  onSubmit,
  problem,
  result,
}: OutputPanelProps) {
  const [customInput, setCustomInput] = useState(customInputDefault);

  useEffect(() => {
    setCustomInput(customInputDefault);
  }, [customInputDefault]);

  const consoleStatus = getConsoleStatus(result);
  const hasResult = result.status !== "Ready";

  const progressPercent = useMemo(() => {
    if (!result.total) {
      return 0;
    }

    return Math.round((result.passed / result.total) * 100);
  }, [result.passed, result.total]);

  return (
    <section className="relative z-0 w-full overflow-hidden rounded-[2rem] border border-border bg-surface shadow-card">
      <div className="border-b border-border bg-surface px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface/90 px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark shadow-sm">
              <Sparkles aria-hidden="true" size={14} strokeWidth={2.6} />
              Output & Tests
            </div>

            <h2 className="mt-3 text-[22px] font-extrabold leading-7 text-text-primary">
              Run against sample cases
            </h2>

            {/* <p className="mt-1 max-w-[720px] text-[14px] font-bold leading-6 text-text-secondary">
              Test your solution with custom input, review the output, and
              submit for a mock verdict.
            </p> */}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-surface px-5 text-[14px] font-extrabold text-text-primary shadow-sm transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark active:scale-[0.98]"
              onClick={onRun}
            >
              <Play aria-hidden="true" size={16} strokeWidth={2.6} />
              Run Code
            </button>

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white shadow-card transition hover:bg-primary-dark active:scale-[0.98]"
              onClick={onSubmit}
            >
              <Send aria-hidden="true" size={16} strokeWidth={2.6} />
              Submit
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.68fr)]">
        <section className="overflow-hidden rounded-3xl border border-border bg-surface-soft shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue">
                <FileInput aria-hidden="true" size={17} strokeWidth={2.5} />
              </span>

              <div className="min-w-0">
                <label
                  className="block truncate text-[14px] font-extrabold text-text-primary"
                  htmlFor="custom-input"
                >
                  Custom input
                </label>

                <p className="text-[11px] font-bold text-text-muted">
                  Local session only
                </p>
              </div>
            </div>

            <span className="rounded-full bg-surface-soft px-3 py-1 text-[11px] font-extrabold text-text-secondary">
              Editable
            </span>
          </div>

          <div className="p-4">
            <textarea
              id="custom-input"
              className="h-44 w-full resize-none rounded-2xl border border-border bg-surface p-4 font-mono text-[13px] leading-6 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary-soft"
              value={customInput}
              onChange={(event) => setCustomInput(event.target.value)}
              placeholder="Enter custom input here..."
              spellCheck={false}
            />

            <p className="mt-3 rounded-2xl bg-surface px-3 py-2 text-[12px] font-bold leading-5 text-text-secondary">
              This input is stored only in the current UI state. Connect it to
              your backend judge later when the real execution API is ready.
            </p>
          </div>
        </section>

        <section className="min-w-0 space-y-4">
          <SubmissionResult result={result} />

          <SubmissionSummary result={result} />

          <OutputConsole
            output={result.output}
            status={consoleStatus}
            title={hasResult ? "Execution Output" : "Output Console"}
          />
        </section>
      </div>

      <div className="px-5 pb-5">
        <section className="overflow-hidden rounded-3xl border border-border bg-surface-soft shadow-sm">
          {/* <div className="border-b border-border bg-surface px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                  <TestTube2 aria-hidden="true" size={18} strokeWidth={2.5} />
                </span>

                <div className="min-w-0">
                  <h3 className="truncate text-[16px] font-extrabold text-text-primary">
                    Test cases result list
                  </h3>

                  <p className="mt-1 text-[13px] font-bold text-text-secondary">
                    {result.status === "Ready"
                      ? "Run code to populate results."
                      : `${result.passed}/${result.total} checks passed`}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden h-2 w-28 overflow-hidden rounded-full bg-surface-soft sm:block">
                  <span
                    className={
                      result.status === "Accepted"
                        ? "block h-full rounded-full bg-primary"
                        : "block h-full rounded-full bg-blue"
                    }
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <span className={getStatusBadgeClass(result.status)}>
                  {result.status}
                </span>
              </div>
            </div>
          </div> */}

          <TestCaseResultList problem={problem} result={result} />
        </section>
      </div>
    </section>
  );
}

function SubmissionSummary({ result }: { result: CodingExecutionResult }) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <SummaryItem
        icon={CheckCircle2}
        label="Status"
        value={result.status}
        tone={result.status === "Accepted" ? "primary" : "blue"}
      />

      <SummaryItem
        icon={Clock}
        label="Runtime"
        value={result.runtime}
        tone="orange"
      />

      <SummaryItem
        icon={Cpu}
        label="Memory"
        value={result.memory}
        tone="blue"
      />
    </section>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "primary" | "blue" | "orange";
  value: string;
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-soft text-primary-dark"
      : tone === "orange"
        ? "bg-orange-soft text-orange"
        : "bg-blue-soft text-blue";

  return (
    <article className="rounded-3xl border border-border bg-surface-soft p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${toneClass}`}
        >
          <Icon aria-hidden="true" size={17} strokeWidth={2.5} />
        </span>

        <span className="min-w-0">
          <span className="block text-[11px] font-extrabold uppercase text-text-muted">
            {label}
          </span>

          <strong className="block truncate text-[14px] text-text-primary">
            {value || "-"}
          </strong>
        </span>
      </div>
    </article>
  );
}

function TestCaseResultList({
  problem,
  result,
}: {
  problem: CodingProblem;
  result: CodingExecutionResult;
}) {
  const rows = buildResultRows(problem, result);

  return (
    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={
                  row.status === "Passed"
                    ? "h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                    : "h-2.5 w-2.5 shrink-0 rounded-full bg-border"
                }
              />

              <p className="truncate text-[13px] font-extrabold text-text-primary">
                {row.label}
              </p>
            </div>

            <p className="mt-2 line-clamp-2 text-[12px] font-bold leading-5 text-text-secondary">
              {row.detail}
            </p>
          </div>

          <span
            className={
              row.status === "Passed"
                ? "shrink-0 rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark"
                : "shrink-0 rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-muted"
            }
          >
            {row.status}
          </span>
        </article>
      ))}
    </div>
  );
}

function buildResultRows(
  problem: CodingProblem,
  result: CodingExecutionResult,
) {
  const baseCases = getTestCases(problem);
  const totalCases = Math.max(result.total, baseCases.length);

  return Array.from({ length: totalCases }, (_, index) => {
    const testCase = baseCases[index % baseCases.length];
    const hiddenCaseNumber = index + 1;

    return {
      id: `${testCase.id}-${index}`,
      detail:
        index < baseCases.length
          ? testCase.input
          : `Hidden validation case ${hiddenCaseNumber}`,
      label:
        index < baseCases.length
          ? testCase.description
          : `Hidden Case ${hiddenCaseNumber}`,
      status:
        result.status === "Ready"
          ? "Pending"
          : index < result.passed
            ? "Passed"
            : "Pending",
    };
  });
}

function getTestCases(problem: CodingProblem): CodingTestCase[] {
  if (problem.testCases?.length) {
    return problem.testCases;
  }

  return [
    {
      id: `${problem.id}-sample`,
      description: "Sample case",
      input: problem.sampleInput,
      expectedOutput: problem.sampleOutput,
    },
  ];
}

function getConsoleStatus(result: CodingExecutionResult): ConsoleStatus {
  if (result.status === "Ready") {
    return "idle";
  }

  if (result.status === "Accepted") {
    return "success";
  }

  if (
    result.status.toLowerCase().includes("error") ||
    result.status.toLowerCase().includes("wrong") ||
    result.status.toLowerCase().includes("failed")
  ) {
    return "error";
  }

  return "running";
}

function getStatusBadgeClass(status: string) {
  if (status === "Accepted") {
    return "w-fit rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark";
  }

  if (status === "Ready") {
    return "w-fit rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-muted";
  }

  return "w-fit rounded-full bg-blue-soft px-3 py-1 text-[12px] font-extrabold text-blue";
}