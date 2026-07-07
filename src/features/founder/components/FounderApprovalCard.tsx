import { CheckCircle2, XCircle } from "lucide-react";
import type { FounderApproval } from "../types/founder.types";

export function FounderApprovalCard({
  approval,
  onApprove,
  onReject,
}: {
  approval: FounderApproval;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
}) {
  const isPending = approval.status === "Pending";

  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[18px] font-extrabold text-text-primary">{approval.name}</p>
          <p className="mt-1 text-[13px] font-bold text-text-secondary">{approval.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
              {approval.role}
            </span>
            <span className="rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-secondary">
              {approval.requestedAt}
            </span>
            <span className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${approvalStatusClass(approval.status)}`}>
              {approval.status}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isPending}
            onClick={() => onApprove?.(approval.id)}
          >
            <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2.5} />
            Approve
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-red-soft px-4 text-[13px] font-extrabold text-red transition hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isPending}
            onClick={() => onReject?.(approval.id)}
          >
            <XCircle aria-hidden="true" size={16} strokeWidth={2.5} />
            Reject
          </button>
        </div>
      </div>
    </article>
  );
}

function approvalStatusClass(status: FounderApproval["status"]) {
  if (status === "Approved") return "bg-primary-soft text-primary-dark";
  if (status === "Rejected") return "bg-red-soft text-red";
  return "bg-yellow-soft text-orange";
}
