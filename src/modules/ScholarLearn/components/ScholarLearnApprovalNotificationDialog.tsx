import { useState } from "react";
import type { ApprovalStatus, FounderApprovalRequest } from "../../../lib/demoAuth";

export function ScholarLearnApprovalNotificationDialog({
  approvalRequests,
  errorMessage = "",
  onApprove,
  onClose,
  onDeny,
}: {
  approvalRequests: FounderApprovalRequest[];
  errorMessage?: string;
  onApprove: (approvalId: string) => void | Promise<void>;
  onClose?: () => void;
  onDeny: (approvalId: string) => void | Promise<void>;
}) {
  const [selectedRequest, setSelectedRequest] = useState<FounderApprovalRequest | null>(null);

  return (
    <>
      <div className="absolute right-14 top-12 z-50 w-[360px] rounded-3xl border border-border bg-surface p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-extrabold text-text-primary">Institute Founder approvals</p>
            <p className="mt-1 text-[12px] font-semibold text-text-secondary">
              Recent pending requests from the last 24 hours.
            </p>
          </div>
          {onClose ? (
            <button
              type="button"
              className="rounded-xl border border-border bg-surface-soft px-2.5 py-1.5 text-[11px] font-extrabold text-text-secondary transition hover:border-primary hover:text-primary-dark"
              onClick={onClose}
            >
              Close
            </button>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="mt-3 rounded-2xl border border-red-soft bg-red-soft px-3 py-2 text-[12px] font-extrabold text-red">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {approvalRequests.length ? (
            approvalRequests.map((request) => (
              <ApprovalItem
                key={request.id}
                request={request}
                onApprove={onApprove}
                onDeny={onDeny}
                onOpenDetails={setSelectedRequest}
              />
            ))
          ) : (
            <article className="rounded-2xl border border-border bg-surface-soft p-3">
              <p className="text-[13px] font-extrabold text-text-primary">No new approval requests</p>
              <p className="mt-1 text-[12px] font-semibold text-text-secondary">
                Older requests stay in History, but are hidden here after 24 hours.
              </p>
            </article>
          )}
        </div>
      </div>

      {selectedRequest ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-text-primary/30 p-4" role="dialog" aria-modal="true">
          <article className="max-h-[86vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-extrabold uppercase text-text-muted">Registration details</p>
                <h2 className="mt-1 text-[24px] font-extrabold text-text-primary">
                  {getRequestName(selectedRequest)}
                </h2>
                <p className="mt-1 text-[13px] font-semibold text-text-secondary">{selectedRequest.email}</p>
              </div>
              <button
                type="button"
                className="rounded-2xl border border-border bg-surface-soft px-3 py-2 text-[12px] font-extrabold text-text-secondary transition hover:border-primary hover:text-primary-dark"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {buildRegistrationDetails(selectedRequest).map((detail) => (
                <div key={detail.label} className="rounded-2xl border border-border bg-surface-soft p-3">
                  <p className="text-[11px] font-extrabold uppercase text-text-muted">{detail.label}</p>
                  <p className="mt-1 break-words text-[14px] font-extrabold text-text-primary">{detail.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <ActionButton
                label="Approve"
                onClick={() => {
                  void onApprove(selectedRequest.id);
                  setSelectedRequest(null);
                }}
                status="APPROVED"
              />
              <ActionButton
                label="Deny"
                onClick={() => {
                  void onDeny(selectedRequest.id);
                  setSelectedRequest(null);
                }}
                status="DENIED"
              />
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}

function buildRegistrationDetails(request: FounderApprovalRequest) {
  const details = [
    { label: "First name", value: request.firstName },
    { label: "Last name", value: request.lastName },
    { label: "Email", value: request.email },
    { label: "Phone", value: request.phoneNumber },
    { label: "Requested role", value: formatRole(request.requestedRole) },
    { label: "Approval status", value: request.approvalStatus },
    { label: "Submitted date", value: formatDateTime(request.requestedAt) },
  ];

  if (request.course) details.push({ label: "Course", value: request.course });
  if (request.batch) details.push({ label: "Batch", value: request.batch });
  if (request.subjectOrDepartment) details.push({ label: "Subject / Department", value: request.subjectOrDepartment });
  if (request.instituteName) {
    details.push({ label: "Institute name", value: request.instituteName });
  }

  return details;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRole(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRequestName(request: FounderApprovalRequest) {
  return `${request.firstName} ${request.lastName}`.trim() || request.email;
}

function ApprovalItem({
  onApprove,
  onDeny,
  onOpenDetails,
  request,
}: {
  onApprove: (approvalId: string) => void | Promise<void>;
  onDeny: (approvalId: string) => void | Promise<void>;
  onOpenDetails: (request: FounderApprovalRequest) => void;
  request: FounderApprovalRequest;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-3">
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onOpenDetails(request)}
      >
        <p className="text-[13px] font-extrabold text-text-primary">
          {getRequestName(request)}
        </p>
        <p className="mt-1 truncate text-[12px] font-semibold text-text-secondary">{request.email}</p>
        <p className="mt-1 text-[11px] font-extrabold uppercase text-text-muted">
          Requested role: {formatRole(request.requestedRole)}
        </p>
      </button>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ActionButton label="Approve" onClick={() => onApprove(request.id)} status="APPROVED" />
        <ActionButton label="Deny" onClick={() => onDeny(request.id)} status="DENIED" />
      </div>
    </article>
  );
}

function ActionButton({
  label,
  onClick,
  status,
}: {
  label: string;
  onClick: () => void;
  status: Exclude<ApprovalStatus, "PENDING_APPROVAL">;
}) {
  return (
    <button
      type="button"
      className={
        status === "APPROVED"
          ? "h-9 rounded-xl bg-primary px-3 text-[12px] font-extrabold text-white transition hover:bg-primary-dark"
          : "h-9 rounded-xl bg-red-soft px-3 text-[12px] font-extrabold text-red transition hover:bg-red hover:text-white"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}
