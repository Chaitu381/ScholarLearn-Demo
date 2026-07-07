import { useMemo, useState } from "react";
import { FounderApprovalCard } from "../components/FounderApprovalCard";
import {
  getFounderApprovalRequests,
  updateFounderApprovalRequestStatus,
  type ApprovalStatus,
  type FounderApprovalRequest,
} from "../../../lib/demoAuth";
import type { FounderApproval } from "../types/founder.types";

const approvals: FounderApproval[] = [
  { email: "student@fengari.me", id: "approval-1", name: "Student Applicant", requestedAt: "Today", role: "STUDENT", status: "Pending" },
  { email: "lecture@fengari.me", id: "approval-2", name: "Lecturer Applicant", requestedAt: "Yesterday", role: "LECTURER", status: "Pending" },
];

export function FounderApprovals() {
  const [approvalRequests, setApprovalRequests] = useState<FounderApprovalRequest[]>(() => getFounderApprovalRequests());
  const [fallbackApprovals, setFallbackApprovals] = useState(approvals);
  const displayedApprovals = useMemo(
    () =>
      approvalRequests.length
        ? approvalRequests.map(mapApprovalRequestToFounderApproval)
        : fallbackApprovals,
    [approvalRequests, fallbackApprovals],
  );

  const handleApprovalStatusChange = (approvalId: string, approvalStatus: ApprovalStatus) => {
    if (approvalRequests.some((approvalRequest) => approvalRequest.id === approvalId)) {
      setApprovalRequests(updateFounderApprovalRequestStatus(approvalId, approvalStatus));
      return;
    }

    setFallbackApprovals((currentApprovals) =>
      currentApprovals.map((approval) =>
        approval.id === approvalId
          ? {
              ...approval,
              status: approvalStatus === "APPROVED" ? "Approved" : approvalStatus === "DENIED" ? "Rejected" : "Pending",
            }
          : approval,
      ),
    );
  };

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[30px] font-extrabold text-text-primary">Approvals</h1>
            <p className="mt-2 text-[15px] text-text-secondary">Review pending institute account requests.</p>
          </div>
          <span className="inline-flex h-9 items-center rounded-2xl bg-primary-soft px-4 text-[12px] font-extrabold text-primary-dark">
            {displayedApprovals.filter((approval) => approval.status === "Pending").length} pending
          </span>
        </div>
      </header>
      <div className="space-y-4">
        {displayedApprovals.map((approval) => (
          <FounderApprovalCard
            key={approval.id}
            approval={approval}
            onApprove={(approvalId) => handleApprovalStatusChange(approvalId, "APPROVED")}
            onReject={(approvalId) => handleApprovalStatusChange(approvalId, "DENIED")}
          />
        ))}
      </div>
    </section>
  );
}

function mapApprovalRequestToFounderApproval(request: FounderApprovalRequest): FounderApproval {
  return {
    email: request.email,
    id: request.id,
    name: `${request.firstName} ${request.lastName}`.trim() || request.email,
    requestedAt: formatRequestedAt(request.requestedAt),
    role: request.requestedRole,
    status: request.approvalStatus === "APPROVED" ? "Approved" : request.approvalStatus === "DENIED" ? "Rejected" : "Pending",
  };
}

function formatRequestedAt(value: string) {
  const requestedDate = new Date(value);
  if (Number.isNaN(requestedDate.getTime())) {
    return "Recently";
  }

  return requestedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
