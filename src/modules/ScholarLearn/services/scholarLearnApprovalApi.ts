import type { ApprovalStatus, FounderApprovalRequest } from "../../../lib/demoAuth";
import {
  getScholarLearnApprovalRequests,
  updateScholarLearnApprovalRequestStatus,
} from "../../../lib/demoAuth";
import type { ScholarLearnApprovalHistoryRecord } from "../types/scholarLearn.types";
import { ScholarLearnApiError, scholarLearnApiRequest } from "./scholarLearnApi";

export async function getRecentScholarLearnApprovalNotifications() {
  try {
    const requests = await scholarLearnApiRequest<FounderApprovalRequest[]>("/scholarlearn/approvals/notifications/recent");
    return requests.filter(isRecentPendingInstituteFounderApproval);
  } catch {
    return getScholarLearnApprovalRequests().filter(isRecentPendingInstituteFounderApproval);
  }
}

export async function getScholarLearnApprovalDetails(approvalId: string) {
  try {
    return await scholarLearnApiRequest<FounderApprovalRequest>(`/scholarlearn/approvals/${encodeURIComponent(approvalId)}`);
  } catch {
    const request = getScholarLearnApprovalRequests().find((approvalRequest) => approvalRequest.id === approvalId);
    if (!request) throw new ScholarLearnApiError("Approval request not found.", 404);
    return request;
  }
}

export async function approveScholarLearnApprovalRequest(approvalId: string) {
  return updateScholarLearnApproval(approvalId, "APPROVED");
}

export async function denyScholarLearnApprovalRequest(approvalId: string) {
  return updateScholarLearnApproval(approvalId, "DENIED");
}

export async function getScholarLearnApprovalHistory() {
  const response = await scholarLearnApiRequest<unknown>("/scholarlearn/approvals/history");
  return normalizeApprovalHistoryResponse(response);
}

async function updateScholarLearnApproval(approvalId: string, approvalStatus: Exclude<ApprovalStatus, "PENDING_APPROVAL">) {
  try {
    const endpointStatus = approvalStatus === "APPROVED" ? "approve" : "deny";
    return await scholarLearnApiRequest<FounderApprovalRequest>(
      `/scholarlearn/approvals/${encodeURIComponent(approvalId)}/${endpointStatus}`,
      { method: "POST" },
    );
  } catch {
    // Demo-only fallback. Real approval and permanent history must be persisted by the backend.
    const updatedRequests = updateScholarLearnApprovalRequestStatus(approvalId, approvalStatus);
    const request = updatedRequests.find((approvalRequest) => approvalRequest.id === approvalId);
    if (!request) throw new ScholarLearnApiError("Approval request not found.", 404);
    return request;
  }
}

function isRecentPendingInstituteFounderApproval(request: FounderApprovalRequest) {
  if (request.requestedRole !== "INSTITUTE_FOUNDER" || request.approvalStatus !== "PENDING_APPROVAL") {
    return false;
  }

  const requestedAt = new Date(request.requestedAt).getTime();
  if (Number.isNaN(requestedAt)) {
    return false;
  }

  return Date.now() - requestedAt <= 24 * 60 * 60 * 1000;
}

function normalizeApprovalHistoryResponse(response: unknown): ScholarLearnApprovalHistoryRecord[] {
  if (Array.isArray(response)) {
    return response.map(normalizeApprovalHistoryRecord).filter(isApprovalHistoryRecord);
  }

  if (isRecord(response)) {
    const possibleLists = [response.records, response.items, response.data, response.content, response.history];
    const list = possibleLists.find(Array.isArray);
    if (Array.isArray(list)) {
      return list.map(normalizeApprovalHistoryRecord).filter(isApprovalHistoryRecord);
    }
  }

  return [];
}

function normalizeApprovalHistoryRecord(value: unknown): ScholarLearnApprovalHistoryRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const action = readAction(value.action ?? value.status ?? value.approvalStatus);
  const userName =
    readString(value.userName) ??
    readString(value.name) ??
    [readString(value.firstName), readString(value.lastName)].filter(Boolean).join(" ").trim();
  const userEmail = readString(value.userEmail) ?? readString(value.email);
  const requestedRole = readString(value.requestedRole) ?? readString(value.role);
  const actionAt =
    readString(value.actionAt) ??
    readString(value.actionDate) ??
    readString(value.updatedAt) ??
    readString(value.createdAt) ??
    readString(value.registeredAt);

  if (!action || !userName || !userEmail || !requestedRole || !actionAt) {
    return null;
  }

  return {
    action,
    actionAt,
    actionBy: readString(value.actionBy) ?? readString(value.approvedBy) ?? readString(value.deniedBy) ?? "ScholarLearn",
    id: readString(value.id) ?? readString(value.historyId) ?? `${userEmail}-${actionAt}`,
    instituteName: readString(value.instituteName) ?? readString(value.institute),
    reason: readString(value.reason) ?? readString(value.denyReason) ?? readString(value.rejectionReason),
    requestedRole,
    userEmail,
    userId: readString(value.userId),
    userName,
  };
}

function readAction(value: unknown): ScholarLearnApprovalHistoryRecord["action"] | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();
  if (normalizedValue === "APPROVED" || normalizedValue === "ACTIVE") return "APPROVED";
  if (normalizedValue === "DENIED" || normalizedValue === "REJECTED") return "DENIED";
  if (normalizedValue === "PENDING" || normalizedValue === "PENDING_APPROVAL") return "PENDING";
  return null;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApprovalHistoryRecord(value: ScholarLearnApprovalHistoryRecord | null): value is ScholarLearnApprovalHistoryRecord {
  return value !== null;
}
