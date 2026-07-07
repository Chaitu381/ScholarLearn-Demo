export type DemoUserRole =
  | "STUDENT"
  | "LECTURER"
  | "JUNIOR_LECTURER"
  | "ADMIN"
  | "INSTITUTE_FOUNDER"
  | "ATTENDANCE_MARKER"
  | "JOB_MANAGER"
  | "SCHOLARLEARN";

export type ApprovalStatus = "APPROVED" | "DENIED" | "PENDING_APPROVAL";
export type DemoApprovalStatus = Extract<ApprovalStatus, "APPROVED">;

export type PendingApprovalRole =
  | "STUDENT"
  | "LECTURER"
  | "JUNIOR_LECTURER"
  | "ADMIN"
  | "INSTITUTE_FOUNDER"
  | "ATTENDANCE_MARKER"
  | "JOB_MANAGER";

export type PendingApprovalStatus = Extract<ApprovalStatus, "PENDING_APPROVAL">;

export type PendingApprovalUser = {
  approvalStatus: PendingApprovalStatus;
  batch?: string;
  course?: string;
  email: string;
  firstName: string;
  instituteName?: string;
  lastName: string;
  phoneNumber: string;
  requestedAt: string;
  requestedRole: PendingApprovalRole;
  subjectOrDepartment?: string;
};

export type FounderApprovalRequest = Omit<PendingApprovalUser, "approvalStatus"> & {
  approvalStatus: ApprovalStatus;
  approvalRecipient?: "FOUNDER" | "SCHOLARLEARN";
  id: string;
};

export type FounderApprovalHistoryAction = Extract<ApprovalStatus, "APPROVED" | "DENIED">;

export type FounderApprovalHistoryRecord = {
  action: FounderApprovalHistoryAction;
  actionAt: string;
  actionBy: "Founder" | "ScholarLearn";
  id: string;
  requestedRole: PendingApprovalRole;
  userEmail: string;
  userId: string;
  userName: string;
};

export type DemoUser = {
  approvalStatus: DemoApprovalStatus;
  displayName: string;
  email: string;
  password: string;
  redirect: string;
  role: DemoUserRole;
};

export type DemoAuthSession = Omit<DemoUser, "password"> & {
  loggedInAt: string;
};

export const pendingApprovalStorageKey = "scholarlearn-pending-approval-user";
export const founderApprovalRequestsStorageKey = "scholarlearn-founder-approval-requests";
export const founderApprovalHistoryStorageKey = "scholarlearn-founder-approval-history";
export const scholarLearnApprovalRequestsStorageKey = "scholarlearn-platform-approval-requests";
export const scholarLearnApprovalHistoryStorageKey = "scholarlearn-platform-approval-history";

// TODO: TEMPORARY demo-only users for local testing. Remove this file when real backend auth is connected.
export const demoUsers: DemoUser[] = [
  {
    approvalStatus: "APPROVED",
    displayName: "Student",
    email: "student@fengari.me",
    password: "student",
    redirect: "/student/dashboard",
    role: "STUDENT",
  },
  {
    approvalStatus: "APPROVED",
    displayName: "Senior Lecturer",
    email: "lecture@fengari.me",
    password: "lecture",
    redirect: "/lecturer/dashboard",
    role: "LECTURER",
  },
  {
    approvalStatus: "APPROVED",
    displayName: "Junior Lecturer",
    email: "jrlecture@fengari.me",
    password: "jrlecture",
    redirect: "/lecturer/dashboard",
    role: "JUNIOR_LECTURER",
  },
  {
    approvalStatus: "APPROVED",
    displayName: "Admin",
    email: "admin@fengari.me",
    password: "admin",
    redirect: "/admin/dashboard",
    role: "ADMIN",
  },
  {
    approvalStatus: "APPROVED",
    displayName: "Founder",
    email: "founder@fengari.me",
    password: "founder",
    redirect: "/founder/dashboard",
    role: "INSTITUTE_FOUNDER",
  },
  {
    approvalStatus: "APPROVED",
    displayName: "Founder",
    email: "institutefounder@fengari.me",
    password: "institutefounder",
    redirect: "/founder/dashboard",
    role: "INSTITUTE_FOUNDER",
  },
  {
    approvalStatus: "APPROVED",
    displayName: "Attendance Marker",
    email: "attendance@fengari.me",
    password: "attendance",
    redirect: "/attendance-marker/dashboard",
    role: "ATTENDANCE_MARKER",
  },
  {
    approvalStatus: "APPROVED",
    displayName: "Job Manager",
    email: "jobmanager@fengari.me",
    password: "jobmanager",
    redirect: "/job-manager/dashboard",
    role: "JOB_MANAGER",
  },
  {
    approvalStatus: "APPROVED",
    displayName: "ScholarLearn Platform Owner",
    email: "scholarlearn@fengari.me",
    password: "ScholarLearn",
    redirect: "/scholarlearn/dashboard",
    role: "SCHOLARLEARN",
  },
];

export function authenticateDemoUser(email: string, password: string): DemoAuthSession | null {
  const normalizedEmail = email.trim().toLowerCase();
  const user = demoUsers.find(
    (demoUser) => demoUser.email === normalizedEmail && demoUser.password === password,
  );

  if (!user) {
    return null;
  }

  const { password: _demoPassword, ...sessionUser } = user;

  return {
    ...sessionUser,
    loggedInAt: new Date().toISOString(),
  };
}

export function savePendingApprovalUser(user: Omit<PendingApprovalUser, "approvalStatus" | "requestedAt">) {
  const pendingUser: PendingApprovalUser = {
    ...user,
    approvalStatus: "PENDING_APPROVAL",
    requestedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(pendingApprovalStorageKey, JSON.stringify(pendingUser));
  if (pendingUser.requestedRole === "INSTITUTE_FOUNDER") {
    saveScholarLearnApprovalRequest(pendingUser);
  } else {
    saveFounderApprovalRequest(pendingUser);
  }
  return pendingUser;
}

export function getPendingApprovalUser(): PendingApprovalUser | null {
  const storedUser = window.localStorage.getItem(pendingApprovalStorageKey);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as PendingApprovalUser;
  } catch {
    return null;
  }
}

export function getFounderApprovalRequests(): FounderApprovalRequest[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedRequests = window.localStorage.getItem(founderApprovalRequestsStorageKey);

  if (!storedRequests) {
    return [];
  }

  try {
    const parsedRequests = JSON.parse(storedRequests);
    return Array.isArray(parsedRequests)
      ? parsedRequests.filter(isFounderApprovalRequest).filter((request) => request.requestedRole !== "INSTITUTE_FOUNDER")
      : [];
  } catch {
    return [];
  }
}

export function updateFounderApprovalRequestStatus(requestId: string, approvalStatus: ApprovalStatus) {
  if (typeof window === "undefined") {
    return [];
  }

  const existingRequests = getFounderApprovalRequests();
  const currentRequest = existingRequests.find((request) => request.id === requestId);
  const updatedRequests = existingRequests.map((request) =>
    request.id === requestId ? { ...request, approvalStatus } : request,
  );

  window.localStorage.setItem(founderApprovalRequestsStorageKey, JSON.stringify(updatedRequests));

  if (
    currentRequest &&
    currentRequest.approvalStatus !== approvalStatus &&
    (approvalStatus === "APPROVED" || approvalStatus === "DENIED")
  ) {
    saveApprovalHistoryRecord(currentRequest, approvalStatus, "Founder", founderApprovalHistoryStorageKey);
  }

  syncLatestPendingUserAfterApprovalUpdate(updatedRequests);

  return updatedRequests;
}

export function getScholarLearnApprovalRequests(): FounderApprovalRequest[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedRequests = window.localStorage.getItem(scholarLearnApprovalRequestsStorageKey);

  if (!storedRequests) {
    return [];
  }

  try {
    const parsedRequests = JSON.parse(storedRequests);
    return Array.isArray(parsedRequests)
      ? parsedRequests.filter(isFounderApprovalRequest).filter((request) => request.requestedRole === "INSTITUTE_FOUNDER")
      : [];
  } catch {
    return [];
  }
}

export function updateScholarLearnApprovalRequestStatus(requestId: string, approvalStatus: ApprovalStatus) {
  if (typeof window === "undefined") {
    return [];
  }

  const existingRequests = getScholarLearnApprovalRequests();
  const currentRequest = existingRequests.find((request) => request.id === requestId);
  const updatedRequests = existingRequests.map((request) =>
    request.id === requestId ? { ...request, approvalStatus } : request,
  );

  window.localStorage.setItem(scholarLearnApprovalRequestsStorageKey, JSON.stringify(updatedRequests));

  if (
    currentRequest &&
    currentRequest.approvalStatus !== approvalStatus &&
    (approvalStatus === "APPROVED" || approvalStatus === "DENIED")
  ) {
    saveApprovalHistoryRecord(currentRequest, approvalStatus, "ScholarLearn", scholarLearnApprovalHistoryStorageKey);
  }

  syncLatestPendingUserAfterApprovalUpdate(updatedRequests);

  return updatedRequests;
}

export function getFounderApprovalHistory(): FounderApprovalHistoryRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedHistory = window.localStorage.getItem(founderApprovalHistoryStorageKey);

  if (!storedHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(storedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory.filter(isFounderApprovalHistoryRecord) : [];
  } catch {
    return [];
  }
}

export function getScholarLearnApprovalHistory(): FounderApprovalHistoryRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedHistory = window.localStorage.getItem(scholarLearnApprovalHistoryStorageKey);

  if (!storedHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(storedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory.filter(isFounderApprovalHistoryRecord) : [];
  } catch {
    return [];
  }
}

function saveFounderApprovalRequest(pendingUser: PendingApprovalUser) {
  if (pendingUser.requestedRole === "INSTITUTE_FOUNDER") {
    return;
  }

  const existingRequests = getFounderApprovalRequests();
  const request: FounderApprovalRequest = {
    ...pendingUser,
    approvalRecipient: "FOUNDER",
    id: createApprovalRequestId(pendingUser),
  };
  const matchingRequestIndex = existingRequests.findIndex((existingRequest) => existingRequest.email === request.email);
  const updatedRequests =
    matchingRequestIndex >= 0
      ? existingRequests.map((existingRequest, index) => (index === matchingRequestIndex ? request : existingRequest))
      : [request, ...existingRequests];

  window.localStorage.setItem(founderApprovalRequestsStorageKey, JSON.stringify(updatedRequests));
}

function saveScholarLearnApprovalRequest(pendingUser: PendingApprovalUser) {
  if (pendingUser.requestedRole !== "INSTITUTE_FOUNDER") {
    return;
  }

  const existingRequests = getScholarLearnApprovalRequests();
  const request: FounderApprovalRequest = {
    ...pendingUser,
    approvalRecipient: "SCHOLARLEARN",
    id: createApprovalRequestId(pendingUser),
  };
  const matchingRequestIndex = existingRequests.findIndex((existingRequest) => existingRequest.email === request.email);
  const updatedRequests =
    matchingRequestIndex >= 0
      ? existingRequests.map((existingRequest, index) => (index === matchingRequestIndex ? request : existingRequest))
      : [request, ...existingRequests];

  window.localStorage.setItem(scholarLearnApprovalRequestsStorageKey, JSON.stringify(updatedRequests));
}

function createApprovalRequestId(user: PendingApprovalUser) {
  return `approval-${user.email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
}

function saveApprovalHistoryRecord(
  request: FounderApprovalRequest,
  action: FounderApprovalHistoryAction,
  actionBy: "Founder" | "ScholarLearn",
  storageKey: string,
) {
  const historyRecord: FounderApprovalHistoryRecord = {
    action,
    actionAt: new Date().toISOString(),
    actionBy,
    id: `history-${request.id}-${action.toLowerCase()}-${Date.now()}`,
    requestedRole: request.requestedRole,
    userEmail: request.email,
    userId: request.id,
    userName: `${request.firstName} ${request.lastName}`.trim() || request.email,
  };
  const updatedHistory = [historyRecord, ...getApprovalHistoryFromStorage(storageKey)];

  window.localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
}

function getApprovalHistoryFromStorage(storageKey: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const storedHistory = window.localStorage.getItem(storageKey);

  if (!storedHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(storedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory.filter(isFounderApprovalHistoryRecord) : [];
  } catch {
    return [];
  }
}

function syncLatestPendingUserAfterApprovalUpdate(updatedRequests: FounderApprovalRequest[]) {
  const latestPendingUser = getPendingApprovalUser();
  const updatedLatestRequest = updatedRequests.find(
    (request) => latestPendingUser && request.email === latestPendingUser.email && request.requestedAt === latestPendingUser.requestedAt,
  );

  if (!updatedLatestRequest) {
    return;
  }

  if (updatedLatestRequest.approvalStatus === "PENDING_APPROVAL") {
    window.localStorage.setItem(
      pendingApprovalStorageKey,
      JSON.stringify({
        ...latestPendingUser,
        approvalStatus: "PENDING_APPROVAL",
      }),
    );
  } else {
    window.localStorage.removeItem(pendingApprovalStorageKey);
  }
}

function isFounderApprovalRequest(value: unknown): value is FounderApprovalRequest {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const request = value as FounderApprovalRequest;
  return (
    typeof request.id === "string" &&
    typeof request.email === "string" &&
    typeof request.firstName === "string" &&
    typeof request.lastName === "string" &&
    typeof request.phoneNumber === "string" &&
    typeof request.requestedAt === "string" &&
    isApprovalStatus(request.approvalStatus)
  );
}

function isApprovalStatus(value: unknown): value is ApprovalStatus {
  return value === "APPROVED" || value === "DENIED" || value === "PENDING_APPROVAL";
}

function isFounderApprovalHistoryRecord(value: unknown): value is FounderApprovalHistoryRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as FounderApprovalHistoryRecord;
  return (
    (record.action === "APPROVED" || record.action === "DENIED") &&
    (record.actionBy === "Founder" || record.actionBy === "ScholarLearn") &&
    typeof record.actionAt === "string" &&
    typeof record.id === "string" &&
    typeof record.userEmail === "string" &&
    typeof record.userId === "string" &&
    typeof record.userName === "string"
  );
}
