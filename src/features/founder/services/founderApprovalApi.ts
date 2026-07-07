import type {
  FounderApprovalRequest as LocalFounderApprovalRequest,
  FounderApprovalHistoryRecord as LocalFounderApprovalHistoryRecord,
} from "../../../lib/demoAuth";
import {
  getFounderApprovalHistory as getLocalFounderApprovalHistory,
  getFounderApprovalRequests,
  updateFounderApprovalRequestStatus,
} from "../../../lib/demoAuth";
import type {
  FounderApproval,
  FounderApprovalDetails,
  FounderApprovalHistoryRecord,
  FounderApprovalNotification,
} from "../types/founder.types";
import { founderApiRequest } from "./founderApi";

export function getPendingApprovals() {
  return founderApiRequest<FounderApproval[]>("/founder/approvals/pending");
}

export function getRecentApprovalNotifications() {
  return founderApiRequest<FounderApprovalNotification[]>("/founder/approvals/notifications/recent");
}

export async function getRecentInstituteUserApprovalNotifications() {
  try {
    const requests = await founderApiRequest<LocalFounderApprovalRequest[]>("/founder/approvals/notifications/recent");
    return requests.filter(isRecentPendingInstituteUserApproval);
  } catch {
    return getFounderApprovalRequests().filter(isRecentPendingInstituteUserApproval);
  }
}

export function getApprovalDetails(userId: string) {
  return founderApiRequest<FounderApprovalDetails>(`/founder/approvals/${encodeURIComponent(userId)}`);
}

export function approveUser(userId: string) {
  return founderApiRequest<FounderApproval>(`/founder/approvals/${encodeURIComponent(userId)}/approve`, {
    method: "POST",
  });
}

export function denyUser(userId: string) {
  return founderApiRequest<FounderApproval>(`/founder/approvals/${encodeURIComponent(userId)}/deny`, {
    method: "POST",
  });
}

export async function approveInstituteUserApprovalRequest(approvalId: string) {
  try {
    await approveUser(approvalId);
    return approvalId;
  } catch {
    updateFounderApprovalRequestStatus(approvalId, "APPROVED");
    return approvalId;
  }
}

export async function denyInstituteUserApprovalRequest(approvalId: string) {
  try {
    await denyUser(approvalId);
    return approvalId;
  } catch {
    updateFounderApprovalRequestStatus(approvalId, "DENIED");
    return approvalId;
  }
}

export async function getApprovalHistory() {
  try {
    return await founderApiRequest<FounderApprovalHistoryRecord[]>("/founder/approvals/history");
  } catch {
    return getLocalFounderApprovalHistory().map(mapLocalHistoryRecordToFounderHistoryRecord);
  }
}

export const founderApprovalApi = {
  approveUser,
  denyUser,
  getApprovalDetails,
  getApprovalHistory,
  getPendingApprovals,
  getRecentApprovalNotifications,
  getRecentInstituteUserApprovalNotifications,
  approveInstituteUserApprovalRequest,
  denyInstituteUserApprovalRequest,
  approveApproval(approvalId: string) {
    return approveInstituteUserApprovalRequest(approvalId);
  },
  getApprovals() {
    return getPendingApprovals();
  },
  rejectApproval(approvalId: string) {
    return denyInstituteUserApprovalRequest(approvalId);
  },
};

function isRecentPendingInstituteUserApproval(request: LocalFounderApprovalRequest) {
  if (request.requestedRole === "INSTITUTE_FOUNDER" || request.approvalStatus !== "PENDING_APPROVAL") {
    return false;
  }

  const requestedAt = new Date(request.requestedAt).getTime();
  if (Number.isNaN(requestedAt)) {
    return false;
  }

  return Date.now() - requestedAt <= 24 * 60 * 60 * 1000;
}

function mapLocalHistoryRecordToFounderHistoryRecord(record: LocalFounderApprovalHistoryRecord): FounderApprovalHistoryRecord {
  return {
    action: record.action,
    actionAt: record.actionAt,
    actionBy: record.actionBy,
    id: record.id,
    requestedRole: record.requestedRole,
    userEmail: record.userEmail,
    userId: record.userId,
    userName: record.userName,
  };
}
