import { Check, Clipboard, Terminal } from "lucide-react";
import { useMemo, useState } from "react";

type OutputConsoleProps = {
  output: string;
  title?: string;
  status?: "idle" | "running" | "success" | "error";
};

export function OutputConsole({
  output,
  title = "Output Console",
  status = "idle",
}: OutputConsoleProps) {
  const [copied, setCopied] = useState(false);

  const hasOutput = output.trim().length > 0;

  const statusConfig = useMemo(() => {
    if (status === "running") {
      return {
        label: "running",
        dot: "bg-yellow-400",
        badge: "bg-yellow-400/10 text-yellow-300",
      };
    }

    if (status === "success") {
      return {
        label: "success",
        dot: "bg-emerald-400",
        badge: "bg-emerald-400/10 text-emerald-300",
      };
    }

    if (status === "error") {
      return {
        label: "error",
        dot: "bg-red-400",
        badge: "bg-red-400/10 text-red-300",
      };
    }

    return {
      label: "console",
      dot: "bg-slate-400",
      badge: "bg-slate-700/70 text-slate-300",
    };
  }, [status]);

  const handleCopyOutput = async () => {
    if (!hasOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-700/80 bg-[#020617] shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-[#0F172A] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-800 text-emerald-400">
            <Terminal aria-hidden="true" size={18} strokeWidth={2.5} />
          </span>

          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-extrabold text-slate-100">
              {title}
            </h3>

            <p className="mt-0.5 text-[11px] font-bold text-slate-500">
              Program execution result
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold ${statusConfig.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>

          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded-xl bg-slate-800 px-3 text-[11px] font-extrabold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleCopyOutput}
            disabled={!hasOutput}
          >
            {copied ? (
              <Check aria-hidden="true" size={14} strokeWidth={2.5} />
            ) : (
              <Clipboard aria-hidden="true" size={14} strokeWidth={2.5} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="max-h-[260px] min-h-32 overflow-y-auto bg-[#020617] px-4 py-4">
        {hasOutput ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-slate-200">
            {output}
          </pre>
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 text-center">
            <div>
              <p className="text-[13px] font-extrabold text-slate-300">
                No output yet
              </p>

              <p className="mt-1 text-[12px] font-bold text-slate-500">
                Run your code to see the result here.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}