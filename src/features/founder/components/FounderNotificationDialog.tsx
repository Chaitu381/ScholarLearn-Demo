import { useState } from "react";
import { Bell, CheckCircle2, XCircle } from "lucide-react";
import type { ApprovalStatus, FounderApprovalRequest } from "../../../lib/demoAuth";

export function FounderNotificationDialog({
  approvalRequests,
  onApprove,
  onClose,
  onDeny,
  open,
}: {
  approvalRequests: FounderApprovalRequest[];
  onApprove: (approvalId: string) => void;
  onClose: () => void;
  onDeny: (approvalId: string) => void;
  open: boolean;
}) {
  const [selectedRequestId, setSelectedRequestId] = useState("");

  if (!open) return null;

  const selectedRequest = approvalRequests.find((request) => request.id === selectedRequestId) ?? null;

  return (
    <section
      className="absolute right-0 top-12 z-50 w-[min(23rem,calc(100vw-2rem))] rounded-3xl border border-border bg-surface p-4 shadow-card"
      role="dialog"
      aria-label="Founder approval notifications"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
            <Bell aria-hidden="true" size={20} strokeWidth={2.5} />
          </span>
          <div>
            <h2 className="text-[17px] font-extrabold text-text-primary">Pending approvals</h2>
            <p className="text-[12px] font-bold text-text-secondary">Last 24 hours only</p>
          </div>
        </div>
        <button
          type="button"
          className="h-8 rounded-xl border border-border bg-surface px-3 text-[12px] font-extrabold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {approvalRequests.length ? (
          approvalRequests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-border bg-surface-soft p-3">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => setSelectedRequestId((currentId) => (currentId === request.id ? "" : request.id))}
                >
                  <p className="truncate text-[14px] font-extrabold text-text-primary hover:text-primary-dark">
                    {request.firstName} {request.lastName}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] font-bold text-text-secondary">{request.email}</p>
                  <p className="mt-0.5 text-[11px] font-extrabold uppercase text-text-muted">
                    Requested role: {formatRole(request.requestedRole)}
                  </p>
                </button>
                <span className="shrink-0 rounded-full bg-yellow-soft px-2.5 py-1 text-[11px] font-extrabold text-orange">
                  Pending
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <ApprovalActionButton label="Approve" onClick={() => onApprove(request.id)} status="APPROVED" />
                <ApprovalActionButton label="Deny" onClick={() => onDeny(request.id)} status="DENIED" />
              </div>

              {selectedRequest?.id === request.id ? <RegistrationDetails request={request} /> : null}
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-surface-soft p-4 text-center">
            <p className="text-[14px] font-extrabold text-text-primary">No new approval requests</p>
            <p className="mt-1 text-[12px] font-semibold leading-5 text-text-secondary">
              Requests older than 24 hours stay in approvals history, but are hidden here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ApprovalActionButton({
  label,
  onClick,
  status,
}: {
  label: string;
  onClick: () => void;
  status: Extract<ApprovalStatus, "APPROVED" | "DENIED">;
}) {
  const isApprove = status === "APPROVED";
  const Icon = isApprove ? CheckCircle2 : XCircle;

  return (
    <button
      type="button"
      className={
        isApprove
          ? "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-[12px] font-extrabold text-white transition hover:bg-primary-dark"
          : "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-soft px-3 text-[12px] font-extrabold text-red transition hover:bg-red hover:text-white"
      }
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function RegistrationDetails({ request }: { request: FounderApprovalRequest }) {
  const detailRows = [
    { label: "First name", value: request.firstName },
    { label: "Last name", value: request.lastName },
    { label: "Email", value: request.email },
    { label: "Phone number", value: request.phoneNumber },
    { label: "Requested role", value: formatRole(request.requestedRole) },
    { label: "Institute name", value: request.instituteName },
    { label: "Approval status", value: request.approvalStatus },
    { label: "Registered date", value: formatRequestedAt(request.requestedAt) },
    { label: "Course", value: request.course },
    { label: "Batch", value: request.batch },
    { label: "Subject / Department", value: request.subjectOrDepartment },
  ].filter((row) => row.value);

  return (
    <div className="mt-3 rounded-2xl border border-border bg-surface p-3">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">Registration details</p>
      <div className="mt-2 grid gap-2">
        {detailRows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3 text-[12px]">
            <span className="font-bold text-text-secondary">{row.label}</span>
            <span className="max-w-[58%] break-words text-right font-extrabold text-text-primary">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRequestedAt(value: string) {
  const requestedDate = new Date(value);
  if (Number.isNaN(requestedDate.getTime())) {
    return "Recently";
  }

  return requestedDate.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRole(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
