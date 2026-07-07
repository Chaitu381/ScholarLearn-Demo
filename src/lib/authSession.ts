import type { ApprovalStatus, DemoUserRole } from "./demoAuth";

export type AuthRole = DemoUserRole;

export type AuthUser = {
  adminId?: string;
  displayName?: string;
  email: string;
  id?: string;
  instituteId?: string;
  lecturerId?: string;
  name?: string;
  role?: AuthRole;
  studentId?: string;
  [key: string]: unknown;
};

export type AuthSession = {
  adminId?: string;
  authToken: string;
  instituteId?: string;
  lastVisitedPath?: string;
  lecturerId?: string;
  loginTimestamp: string;
  refreshToken?: string;
  role: AuthRole;
  studentId?: string;
  user: AuthUser;
};

type SaveAuthSessionInput = {
  adminId?: string;
  authToken?: string;
  instituteId?: string;
  lastVisitedPath?: string;
  lecturerId?: string;
  refreshToken?: string;
  role: AuthRole;
  studentId?: string;
  user: AuthUser;
};

const authSessionStorageKey = "scholarlearn-auth-session";
const legacyDemoAuthStorageKey = "scholarlearn-demo-auth";
const lastVisitedPathStorageKey = "lastVisitedPath";
const requestedPathStorageKey = "requestedPath";

const validRoles: AuthRole[] = [
  "ADMIN",
  "ATTENDANCE_MARKER",
  "INSTITUTE_FOUNDER",
  "JOB_MANAGER",
  "JUNIOR_LECTURER",
  "LECTURER",
  "SCHOLARLEARN",
  "STUDENT",
];

const directStorageKeys = [
  "authToken",
  "accessToken",
  "scholarlearn-token",
  "refreshToken",
  "user",
  "role",
  "instituteId",
  "studentId",
  "lecturerId",
  "adminId",
  "loginTimestamp",
  lastVisitedPathStorageKey,
  requestedPathStorageKey,
  "scholarlearn-auth",
  "scholarlearn-session",
  "auth",
  "authUser",
  "session",
];

export function saveAuthSession(input: SaveAuthSessionInput) {
  const loginTimestamp = new Date().toISOString();
  const user = sanitizeUser({
    ...input.user,
    role: input.role,
  });
  const session: AuthSession = {
    adminId: input.adminId ?? readString(user.adminId),
    authToken: input.authToken?.trim() || createLocalDemoToken(input.role, user.email),
    instituteId: input.instituteId ?? readString(user.instituteId),
    lastVisitedPath: input.lastVisitedPath ?? getLastVisitedPath() ?? getRoleDashboardPath(input.role),
    lecturerId: input.lecturerId ?? readString(user.lecturerId),
    loginTimestamp,
    refreshToken: input.refreshToken,
    role: input.role,
    studentId: input.studentId ?? readString(user.studentId),
    user,
  };

  if (typeof window === "undefined") {
    return session;
  }

  window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session));
  window.localStorage.setItem("authToken", session.authToken);
  window.localStorage.setItem("user", JSON.stringify(session.user));
  window.localStorage.setItem("role", session.role);
  window.localStorage.setItem("loginTimestamp", session.loginTimestamp);
  window.localStorage.setItem(lastVisitedPathStorageKey, session.lastVisitedPath ?? getRoleDashboardPath(session.role));

  writeOptionalStorageValue("refreshToken", session.refreshToken);
  writeOptionalStorageValue("instituteId", session.instituteId);
  writeOptionalStorageValue("studentId", session.studentId);
  writeOptionalStorageValue("lecturerId", session.lecturerId);
  writeOptionalStorageValue("adminId", session.adminId);

  return session;
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = readAuthSession(window.localStorage.getItem(authSessionStorageKey));
  if (storedSession) {
    return storedSession;
  }

  const directSession = readDirectStorageSession();
  if (directSession) {
    return directSession;
  }

  const legacySession = readLegacyDemoSession();
  if (legacySession) {
    saveAuthSession(legacySession);
    return getAuthSession();
  }

  return null;
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(authSessionStorageKey);
  window.localStorage.removeItem(legacyDemoAuthStorageKey);
  directStorageKeys.forEach((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  });
}

export function logout() {
  clearAuthSession();
  redirectToLogin();
}

export function isAuthenticated() {
  return Boolean(getAuthSession()?.authToken);
}

export function getCurrentUser() {
  return getAuthSession()?.user ?? null;
}

export function getCurrentRole() {
  return getAuthSession()?.role ?? null;
}

export function getAuthToken() {
  return getAuthSession()?.authToken ?? "";
}

export function getAuthApprovalStatus(session: AuthSession | null = getAuthSession()): ApprovalStatus {
  if (!session) {
    return "DENIED";
  }

  const approvalStatus = session.user.approvalStatus;

  if (approvalStatus === "PENDING_APPROVAL" || approvalStatus === "APPROVED" || approvalStatus === "DENIED") {
    return approvalStatus;
  }

  return "APPROVED";
}

export function saveLastVisitedPath(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPath = normalizeAppPath(path);
  if (!normalizedPath || isPublicAuthPath(normalizedPath)) {
    return;
  }

  window.localStorage.setItem(lastVisitedPathStorageKey, normalizedPath);

  const session = readAuthSession(window.localStorage.getItem(authSessionStorageKey));
  if (session) {
    const updatedSession: AuthSession = {
      ...session,
      lastVisitedPath: normalizedPath,
    };
    window.localStorage.setItem(authSessionStorageKey, JSON.stringify(updatedSession));
  }
}

export function getLastVisitedPath() {
  if (typeof window === "undefined") {
    return "";
  }

  return normalizeAppPath(window.localStorage.getItem(lastVisitedPathStorageKey) ?? "");
}

export function saveRequestedPath(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPath = normalizeAppPath(path);
  if (!normalizedPath || isPublicAuthPath(normalizedPath)) {
    return;
  }

  window.localStorage.setItem(requestedPathStorageKey, normalizedPath);
}

export function getRequestedPath() {
  if (typeof window === "undefined") {
    return "";
  }

  return normalizeAppPath(window.localStorage.getItem(requestedPathStorageKey) ?? "");
}

export function clearRequestedPath() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(requestedPathStorageKey);
}

export function resolvePostLoginRedirect(role: AuthRole) {
  const requestedPath = getRequestedPath();
  const lastVisitedPath = getLastVisitedPath();
  const redirectPath = isPathAllowedForRole(role, requestedPath)
    ? requestedPath
    : isPathAllowedForRole(role, lastVisitedPath)
      ? lastVisitedPath
      : getRoleDashboardPath(role);

  clearRequestedPath();
  saveLastVisitedPath(redirectPath);
  return redirectPath;
}

export function getRoleDashboardPath(role: AuthRole) {
  if (role === "STUDENT") return "/student/dashboard";
  if (role === "LECTURER" || role === "JUNIOR_LECTURER") return "/lecturer/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "INSTITUTE_FOUNDER") return "/founder/dashboard";
  if (role === "ATTENDANCE_MARKER") return "/attendance-marker/dashboard";
  if (role === "JOB_MANAGER") return "/job-manager/dashboard";
  return "/scholarlearn/dashboard";
}

export function isValidAuthRole(value: unknown): value is AuthRole {
  return typeof value === "string" && validRoles.includes(value as AuthRole);
}

export function isRoleAllowedForPath(role: AuthRole, pathname: string, hash: string) {
  if (pathname.startsWith("/lecturer")) {
    return role === "LECTURER" || role === "JUNIOR_LECTURER";
  }

  if (pathname.startsWith("/admin")) return role === "ADMIN";
  if (pathname.startsWith("/founder")) return role === "INSTITUTE_FOUNDER";
  if (pathname.startsWith("/scholarlearn")) return role === "SCHOLARLEARN";
  if (pathname.startsWith("/attendance-marker")) return role === "ATTENDANCE_MARKER";
  if (pathname.startsWith("/job-manager")) return role === "JOB_MANAGER";

  if (pathname.startsWith("/student") || pathname === "/" || hash) {
    return role === "STUDENT";
  }

  return true;
}

export function isPathAllowedForRole(role: AuthRole, path: string) {
  const parsedPath = parseAppPath(path);

  if (!parsedPath || isPublicAuthPath(parsedPath.fullPath)) {
    return false;
  }

  return isRoleAllowedForPath(role, parsedPath.pathname, parsedPath.hash);
}

export function getCurrentAppPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState({}, "", "/#login");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function redirectToPath(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function readAuthSession(value: string | null): AuthSession | null {
  if (!value) {
    return null;
  }

  try {
    return normalizeSession(JSON.parse(value));
  } catch {
    return null;
  }
}

function readDirectStorageSession(): AuthSession | null {
  const authToken =
    window.localStorage.getItem("authToken")?.trim() ||
    window.localStorage.getItem("accessToken")?.trim() ||
    window.localStorage.getItem("scholarlearn-token")?.trim();
  const role = window.localStorage.getItem("role");

  if (!authToken || !isValidAuthRole(role)) {
    return null;
  }

  return {
    adminId: readOptionalStorageValue("adminId"),
    authToken,
    instituteId: readOptionalStorageValue("instituteId"),
    lastVisitedPath: getLastVisitedPath() || undefined,
    lecturerId: readOptionalStorageValue("lecturerId"),
    loginTimestamp: window.localStorage.getItem("loginTimestamp") ?? new Date().toISOString(),
    refreshToken: readOptionalStorageValue("refreshToken"),
    role,
    studentId: readOptionalStorageValue("studentId"),
    user: readStoredUser(role),
  };
}

function readLegacyDemoSession(): SaveAuthSessionInput | null {
  const storedValue = window.localStorage.getItem(legacyDemoAuthStorageKey);

  if (!storedValue) {
    return null;
  }

  try {
    const record = asRecord(JSON.parse(storedValue));
    if (!isValidAuthRole(record.role) || typeof record.email !== "string") {
      return null;
    }

    return {
      role: record.role,
      user: sanitizeUser({
        approvalStatus: record.approvalStatus,
        displayName: record.displayName,
        email: record.email,
        role: record.role,
      }),
    };
  } catch {
    return null;
  }
}

function normalizeSession(value: unknown): AuthSession | null {
  const record = asRecord(value);
  const authToken = readString(record.authToken);
  const role = record.role;

  if (!authToken || !isValidAuthRole(role)) {
    return null;
  }

  return {
    adminId: readString(record.adminId) || undefined,
    authToken,
    instituteId: readString(record.instituteId) || undefined,
    lastVisitedPath: normalizeAppPath(readString(record.lastVisitedPath)) || getLastVisitedPath() || undefined,
    lecturerId: readString(record.lecturerId) || undefined,
    loginTimestamp: readString(record.loginTimestamp) || new Date().toISOString(),
    refreshToken: readString(record.refreshToken) || undefined,
    role,
    studentId: readString(record.studentId) || undefined,
    user: sanitizeUser(asRecord(record.user)),
  };
}

function readStoredUser(role: AuthRole): AuthUser {
  const storedUser = window.localStorage.getItem("user");

  if (!storedUser) {
    return { email: "", role };
  }

  try {
    return sanitizeUser({
      ...asRecord(JSON.parse(storedUser)),
      role,
    });
  } catch {
    return { email: "", role };
  }
}

function sanitizeUser(user: Record<string, unknown>): AuthUser {
  const { password: _password, ...safeUser } = user;
  const email = readString(safeUser.email);

  return {
    ...safeUser,
    email,
  };
}

function writeOptionalStorageValue(key: string, value: string | undefined) {
  if (value) {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.removeItem(key);
  }
}

function readOptionalStorageValue(key: string) {
  return window.localStorage.getItem(key) ?? undefined;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizeAppPath(path: string) {
  const parsedPath = parseAppPath(path);
  return parsedPath?.fullPath ?? "";
}

function parseAppPath(path: string) {
  if (!path.trim() || typeof window === "undefined") {
    return null;
  }

  try {
    const url = new URL(path, window.location.origin);
    return {
      fullPath: `${url.pathname}${url.search}${url.hash}`,
      hash: url.hash,
      pathname: url.pathname,
    };
  } catch {
    return null;
  }
}

function isPublicAuthPath(path: string) {
  const parsedPath = parseAppPath(path);
  if (!parsedPath) {
    return false;
  }

  return (
    parsedPath.pathname === "/access-denied" ||
    parsedPath.pathname === "/approval-pending" ||
    parsedPath.hash === "#auth" ||
    parsedPath.hash === "#login" ||
    parsedPath.hash === "#register"
  );
}

function createLocalDemoToken(role: AuthRole, email: string) {
  return `demo.${role.toLowerCase()}.${btoa(`${email}:${Date.now()}`)}`;
}
