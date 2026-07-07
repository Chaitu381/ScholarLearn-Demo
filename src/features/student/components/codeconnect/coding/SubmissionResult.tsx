import { CheckCircle2, Clock, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CodingExecutionResult } from "../../../types/codeconnect.types";

type SubmissionResultProps = {
  result: CodingExecutionResult;
};

export function SubmissionResult({ result }: SubmissionResultProps) {
  const accepted = result.status === "Accepted";

  return (
    <section className={accepted ? "rounded-2xl border border-primary bg-primary-soft p-4 text-primary-dark" : "rounded-2xl border border-border bg-surface-soft p-4"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={accepted ? "grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-white" : "grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue"}>
            <CheckCircle2 aria-hidden="true" size={21} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-[16px] font-extrabold">{result.status}</p>
            <p className="mt-1 text-[13px] font-bold">
              Test cases passed: {result.passed}/{result.total}
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Metric icon={Clock} label="Runtime" value={result.runtime} />
          <Metric icon={Cpu} label="Memory" value={result.memory} />
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-text-primary">
      <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
      <span className="text-[12px] font-bold text-text-secondary">{label}</span>
      <strong className="text-[12px]">{value}</strong>
    </div>
  );
}
