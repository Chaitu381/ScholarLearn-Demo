import {
  clearAuthSession,
  getAuthSession,
  getAuthToken,
  redirectToLogin,
  type AuthRole,
} from "../../lib/authSession";

export type RoleProfileKind = "founder" | "lecturer" | "student";

export type CurrentUserProfile = {
  approvalStatus?: string;
  email: string;
  firstName: string;
  fullName: string;
  instituteName?: string;
  joinedDate?: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  role: AuthRole | string;
  roleLabel: string;
};

export type UpdateCurrentUserProfilePayload = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
};

export type NotificationSettingsPayload = {
  approvalNotifications?: boolean;
  emailNotifications: boolean;
  reportNotifications?: boolean;
  testAssignmentNotifications?: boolean;
};

export type ChangePasswordPayload = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResult = {
  message: string;
  ok: boolean;
};

const profileApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  import.meta.env.VITE_API_URL ??
  "";

const profileOverridesStorageKey = "scholarlearn-profile-overrides";
const notificationSettingsStorageKey = "scholarlearn-notification-settings";

export async function getCurrentUserProfile(roleKind?: RoleProfileKind): Promise<CurrentUserProfile> {
  const fallbackProfile = buildFallbackProfile(roleKind);

  try {
    const apiProfile = await profileApiRequest<Record<string, unknown>>("/users/me/profile");
    return normalizeProfile(apiProfile, fallbackProfile, roleKind);
  } catch {
    return mergeProfileOverride(fallbackProfile);
  }
}

export async function updateCurrentUserProfile(payload: UpdateCurrentUserProfilePayload): Promise<CurrentUserProfile> {
  const fallbackProfile = buildFallbackProfile();

  try {
    const apiProfile = await profileApiRequest<Record<string, unknown>>("/users/me/profile", {
      body: payload,
      method: "PATCH",
    });
    const normalizedProfile = normalizeProfile(apiProfile, fallbackProfile);
    saveProfileOverride(normalizedProfile);
    return normalizedProfile;
  } catch {
    const updatedProfile = mergeProfileOverride({
      ...fallbackProfile,
      ...payload,
      fullName: `${payload.firstName} ${payload.lastName}`.trim(),
    });
    saveProfileOverride(updatedProfile);
    return updatedProfile;
  }
}

export async function updateProfilePicture(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("profilePicture", file);
    const response = await fetch(buildApiUrl("/users/me/profile-picture"), {
      body: formData,
      headers: buildHeaders(false),
      method: "POST",
    });

    if (response.status === 401) {
      clearAuthSession();
      redirectToLogin();
      throw new Error("Session expired.");
    }

    if (response.ok) {
      const payload = (await response.json()) as Record<string, unknown>;
      const pictureUrl = readString(payload.profilePicture ?? payload.profilePictureUrl ?? payload.url);
      if (pictureUrl) {
        saveProfileOverride({ ...buildFallbackProfile(), profilePicture: pictureUrl });
        return pictureUrl;
      }
    }
  } catch {
    // TODO: Replace this local preview fallback when the backend profile image upload endpoint is finalized.
  }

  const dataUrl = await readFileAsDataUrl(file);
  saveProfileOverride({ ...buildFallbackProfile(), profilePicture: dataUrl });
  return dataUrl;
}

export async function updateNotificationSettings(payload: NotificationSettingsPayload) {
  try {
    await profileApiRequest("/users/me/notification-settings", {
      body: payload,
      method: "PATCH",
    });
  } catch {
    // Settings remain local until the backend notification preferences endpoint is available.
  }

  saveNotificationSettings(payload);
  return payload;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResult> {
  if (!payload.currentPassword || !payload.newPassword || payload.newPassword !== payload.confirmPassword) {
    return {
      message: "Enter the current password and matching new passwords.",
      ok: false,
    };
  }

  try {
    await profileApiRequest("/users/me/change-password", {
      body: {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      },
      method: "POST",
    });

    return {
      message: "Password updated successfully.",
      ok: true,
    };
  } catch {
    return {
      message: "Password update API is not connected yet. Your current session was not changed.",
      ok: false,
    };
  }
}

export function getNotificationSettings(roleKind: RoleProfileKind): NotificationSettingsPayload {
  const storedSettings = readStorageRecord(notificationSettingsStorageKey);
  const key = getProfileStorageKey(roleKind);
  const saved = asRecord(storedSettings[key]);

  return {
    approvalNotifications: readBoolean(saved.approvalNotifications, roleKind === "founder"),
    emailNotifications: readBoolean(saved.emailNotifications, true),
    reportNotifications: readBoolean(saved.reportNotifications, true),
    testAssignmentNotifications: readBoolean(saved.testAssignmentNotifications, roleKind !== "founder"),
  };
}

function saveNotificationSettings(payload: NotificationSettingsPayload) {
  if (typeof window === "undefined") return;

  const session = getAuthSession();
  const key = getProfileStorageKey(getRoleKind(session?.role));
  const storedSettings = readStorageRecord(notificationSettingsStorageKey);
  storedSettings[key] = payload;
  window.localStorage.setItem(notificationSettingsStorageKey, JSON.stringify(storedSettings));
}

async function profileApiRequest<TResponse = unknown>(
  endpoint: string,
  options: { body?: unknown; method?: "GET" | "PATCH" | "POST" } = {},
) {
  const response = await fetch(buildApiUrl(endpoint), {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options.body !== undefined),
    method: options.method ?? "GET",
  });

  if (response.status === 401) {
    clearAuthSession();
    redirectToLogin();
    throw new Error("Your session has expired. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error("Access denied for this profile resource.");
  }

  if (!response.ok) {
    throw new Error("Profile request failed.");
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

function buildApiUrl(endpoint: string) {
  if (!profileApiBaseUrl) return endpoint;
  return `${profileApiBaseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

function buildHeaders(hasBody: boolean) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function buildFallbackProfile(roleKind?: RoleProfileKind): CurrentUserProfile {
  const session = getAuthSession();
  const user = session?.user;
  const resolvedRoleKind = roleKind ?? getRoleKind(session?.role);
  const role = session?.role ?? getFallbackRole(resolvedRoleKind);
  const displayName = readString(user?.displayName ?? user?.name) || getFallbackName(resolvedRoleKind);
  const [firstName, ...lastNameParts] = displayName.split(" ").filter(Boolean);
  const email = readString(user?.email) || getFallbackEmail(resolvedRoleKind);
  const profilePicture = readString(user?.profilePicture ?? user?.profilePictureUrl ?? user?.avatarUrl);

  return mergeProfileOverride({
    approvalStatus: readString(user?.approvalStatus) || "APPROVED",
    email,
    firstName: readString(user?.firstName) || firstName || displayName,
    fullName: displayName,
    instituteName: readString(user?.instituteName ?? user?.institute) || "Fengari Institute",
    joinedDate: readString(user?.joinedDate ?? user?.createdAt ?? session?.loginTimestamp),
    lastName: readString(user?.lastName) || lastNameParts.join(" "),
    phone: readString(user?.phone ?? user?.phoneNumber),
    profilePicture,
    role,
    roleLabel: getRoleLabel(resolvedRoleKind, role),
  });
}

function normalizeProfile(
  payload: Record<string, unknown>,
  fallbackProfile: CurrentUserProfile,
  roleKind?: RoleProfileKind,
): CurrentUserProfile {
  const firstName = readString(payload.firstName) || fallbackProfile.firstName;
  const lastName = readString(payload.lastName) || fallbackProfile.lastName;
  const fullName = readString(payload.fullName ?? payload.displayName ?? payload.name) || `${firstName} ${lastName}`.trim();
  const role = readString(payload.role) || fallbackProfile.role;
  const resolvedRoleKind = roleKind ?? getRoleKind(role as AuthRole);

  return mergeProfileOverride({
    approvalStatus: readString(payload.approvalStatus) || fallbackProfile.approvalStatus,
    email: readString(payload.email) || fallbackProfile.email,
    firstName,
    fullName,
    instituteName: readString(payload.instituteName ?? payload.institute) || fallbackProfile.instituteName,
    joinedDate: readString(payload.joinedDate ?? payload.createdAt) || fallbackProfile.joinedDate,
    lastName,
    phone: readString(payload.phone ?? payload.phoneNumber) || fallbackProfile.phone,
    profilePicture: readString(payload.profilePicture ?? payload.profilePictureUrl ?? payload.avatarUrl) || fallbackProfile.profilePicture,
    role,
    roleLabel: readString(payload.roleLabel) || getRoleLabel(resolvedRoleKind, role),
  });
}

function mergeProfileOverride(profile: CurrentUserProfile): CurrentUserProfile {
  const overrides = readProfileOverrides();
  const key = getProfileStorageKey(getRoleKind(profile.role as AuthRole));
  const override = asRecord(overrides[key]);

  return {
    ...profile,
    ...override,
    email: readString(override.email) || profile.email,
    firstName: readString(override.firstName) || profile.firstName,
    fullName:
      readString(override.fullName) ||
      `${readString(override.firstName) || profile.firstName} ${readString(override.lastName) || profile.lastName}`.trim(),
    lastName: readString(override.lastName) || profile.lastName,
    phone: readString(override.phone) || profile.phone,
    profilePicture: readString(override.profilePicture) || profile.profilePicture,
  };
}

function saveProfileOverride(profile: Partial<CurrentUserProfile>) {
  if (typeof window === "undefined") return;

  const session = getAuthSession();
  const key = getProfileStorageKey(getRoleKind(session?.role));
  const overrides = readProfileOverrides();
  const currentOverride = asRecord(overrides[key]);
  const firstName = readString(profile.firstName) || readString(currentOverride.firstName);
  const lastName = readString(profile.lastName) || readString(currentOverride.lastName);

  overrides[key] = {
    ...currentOverride,
    ...profile,
    fullName: readString(profile.fullName) || `${firstName} ${lastName}`.trim(),
  };
  window.localStorage.setItem(profileOverridesStorageKey, JSON.stringify(overrides));
}

function readProfileOverrides() {
  return readStorageRecord(profileOverridesStorageKey);
}

function getProfileStorageKey(roleKind: RoleProfileKind, email?: string) {
  const session = getAuthSession();
  return `${roleKind}:${email ?? session?.user.email ?? "local"}`;
}

function getRoleKind(role?: AuthRole | string | null): RoleProfileKind {
  if (role === "INSTITUTE_FOUNDER") return "founder";
  if (role === "LECTURER" || role === "JUNIOR_LECTURER") return "lecturer";
  return "student";
}

function getFallbackRole(roleKind: RoleProfileKind): AuthRole {
  if (roleKind === "founder") return "INSTITUTE_FOUNDER";
  if (roleKind === "lecturer") return "LECTURER";
  return "STUDENT";
}

function getFallbackName(roleKind: RoleProfileKind) {
  if (roleKind === "founder") return "Founder";
  if (roleKind === "lecturer") return "Senior Lecturer";
  return "Chaitanya";
}

function getFallbackEmail(roleKind: RoleProfileKind) {
  if (roleKind === "founder") return "founder@fengari.me";
  if (roleKind === "lecturer") return "lecture@fengari.me";
  return "student@fengari.me";
}

function getRoleLabel(roleKind: RoleProfileKind, role: string) {
  if (roleKind === "founder") return "Founder";
  if (roleKind === "lecturer") return role === "JUNIOR_LECTURER" ? "Junior Lecturer" : "Lecturer";
  return "Student";
}

function readStorageRecord(key: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};

  try {
    return asRecord(JSON.parse(window.localStorage.getItem(key) ?? "{}"));
  } catch {
    return {};
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
