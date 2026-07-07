import { clearAuthSession, getAuthToken, redirectToLogin } from "../../../lib/authSession";
import type {
  ScholarLearnDashboardData,
  ScholarLearnInstitute,
  ScholarLearnInstituteCustomizationSettings,
  ScholarLearnInstituteSubscriptionUpdate,
  ScholarLearnSubscriptionPlan,
} from "../types/scholarLearn.types";
import { scholarLearnDemoDashboardData } from "./scholarLearnDemoData";

const scholarLearnApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  import.meta.env.VITE_API_URL ??
  "";
const customizationSettingsStorageKey = "scholarlearn-institute-customization-settings";

type RequestMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

type RequestOptions = {
  body?: unknown;
  method?: RequestMethod;
};

export class ScholarLearnApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ScholarLearnApiError";
    this.status = status;
  }
}

export async function getScholarLearnDashboardData() {
  try {
    return await scholarLearnApiRequest<ScholarLearnDashboardData>("/scholarlearn/dashboard");
  } catch {
    return scholarLearnDemoDashboardData;
  }
}

export async function getScholarLearnInstitutes() {
  try {
    return await scholarLearnApiRequest<ScholarLearnInstitute[]>("/scholarlearn/institutes");
  } catch {
    return scholarLearnDemoDashboardData.institutes;
  }
}

export async function getScholarLearnSubscriptionPlans() {
  try {
    const response = await scholarLearnApiRequest<unknown>("/scholarlearn/subscription-plans");
    const plans = normalizeSubscriptionPlans(response);
    return plans.length ? plans : getFallbackSubscriptionPlans();
  } catch {
    return getFallbackSubscriptionPlans();
  }
}

export async function updateScholarLearnInstituteAccess(instituteId: string, disabled: boolean) {
  try {
    return await scholarLearnApiRequest<ScholarLearnInstitute>(`/scholarlearn/institutes/${encodeURIComponent(instituteId)}/access`, {
      body: { disabled },
      method: "PATCH",
    });
  } catch {
    const institute = scholarLearnDemoDashboardData.institutes.find((item) => item.id === instituteId);
    if (!institute) throw new ScholarLearnApiError("Institute not found.", 404);
    return {
      ...institute,
      disabled,
      status: disabled ? "Disabled" : institute.activeRemainingDays <= 0 ? "Expired" : "Active",
    } satisfies ScholarLearnInstitute;
  }
}

export async function updateScholarLearnInstitutePlan(
  instituteId: string,
  plan: ScholarLearnInstitute["plan"],
) {
  try {
    return await scholarLearnApiRequest<ScholarLearnInstitute>(`/scholarlearn/institutes/${encodeURIComponent(instituteId)}/plan`, {
      body: { plan },
      method: "PATCH",
    });
  } catch {
    const institute = scholarLearnDemoDashboardData.institutes.find((item) => item.id === instituteId);
    if (!institute) throw new ScholarLearnApiError("Institute not found.", 404);
    return { ...institute, plan };
  }
}

export async function updateScholarLearnInstituteSubscription(
  instituteId: string,
  payload: ScholarLearnInstituteSubscriptionUpdate,
) {
  try {
    return await scholarLearnApiRequest<ScholarLearnInstitute>(
      `/scholarlearn/institutes/${encodeURIComponent(instituteId)}/subscription`,
      {
        body: payload,
        method: "PATCH",
      },
    );
  } catch {
    const institute = scholarLearnDemoDashboardData.institutes.find((item) => item.id === instituteId);
    if (!institute) throw new ScholarLearnApiError("Institute not found.", 404);

    const activeRemainingDays = calculateRemainingDays(payload.expiryDate);

    return {
      ...institute,
      ...payload,
      activeRemainingDays,
      status: payload.disabled ? "Disabled" : activeRemainingDays <= 0 ? "Expired" : payload.plan === "Trial" ? "Trial" : "Active",
    } satisfies ScholarLearnInstitute;
  }
}

export async function getScholarLearnInstituteCustomizationSettings(instituteId: string) {
  try {
    return await scholarLearnApiRequest<ScholarLearnInstituteCustomizationSettings>(
      `/scholarlearn/institutes/${encodeURIComponent(instituteId)}/customization-settings`,
    );
  } catch {
    return getLocalInstituteCustomizationSettings(instituteId);
  }
}

export async function updateScholarLearnInstituteCustomizationSettings(
  instituteId: string,
  settings: ScholarLearnInstituteCustomizationSettings,
) {
  try {
    return await scholarLearnApiRequest<ScholarLearnInstituteCustomizationSettings>(
      `/scholarlearn/institutes/${encodeURIComponent(instituteId)}/customization-settings`,
      {
        body: settings,
        method: "PATCH",
      },
    );
  } catch {
    // TODO: Remove this local placeholder persistence when backend institute
    // customization DTOs/settings APIs are connected end-to-end.
    saveLocalInstituteCustomizationSettings(instituteId, settings);
    return settings;
  }
}

export async function scholarLearnApiRequest<TResponse = unknown>(endpoint: string, options: RequestOptions = {}) {
  const response = await fetch(buildApiUrl(endpoint), {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options.body !== undefined),
    method: options.method ?? "GET",
  });

  if (response.status === 401) {
    clearAuthSession();
    redirectToLogin();
    throw new ScholarLearnApiError("Your session has expired. Please log in again.", response.status);
  }

  if (response.status === 403) {
    throw new ScholarLearnApiError("Access denied for this ScholarLearn resource.", response.status);
  }

  if (!response.ok) {
    throw new ScholarLearnApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

function buildApiUrl(endpoint: string) {
  if (!scholarLearnApiBaseUrl) return endpoint;
  return `${scholarLearnApiBaseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
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

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    if (typeof payload?.message === "string") return payload.message;
    if (typeof payload?.error === "string") return payload.error;
  } catch {
    // Fall through to generic message.
  }

  return `ScholarLearn request failed with status ${response.status}.`;
}

function normalizeSubscriptionPlans(response: unknown): ScholarLearnSubscriptionPlan[] {
  if (Array.isArray(response)) {
    return response.map(readSubscriptionPlan).filter(isSubscriptionPlan);
  }

  if (typeof response === "object" && response !== null) {
    const record = response as Record<string, unknown>;
    const possibleLists = [record.plans, record.items, record.data, record.content];
    const list = possibleLists.find(Array.isArray);
    if (Array.isArray(list)) {
      return list.map(readSubscriptionPlan).filter(isSubscriptionPlan);
    }
  }

  return [];
}

function readSubscriptionPlan(value: unknown): ScholarLearnSubscriptionPlan | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const planValue = record.value ?? record.name ?? record.code ?? record.id ?? record.label;
    if (typeof planValue === "string" && planValue.trim()) {
      return planValue.trim();
    }
  }

  return null;
}

function isSubscriptionPlan(value: ScholarLearnSubscriptionPlan | null): value is ScholarLearnSubscriptionPlan {
  return value !== null;
}

function getFallbackSubscriptionPlans(): ScholarLearnSubscriptionPlan[] {
  return ["Monthly", "Yearly", "Trial", "Custom"];
}

function calculateRemainingDays(expiryDate: string) {
  const expiryTime = new Date(`${expiryDate}T23:59:59`).getTime();
  if (Number.isNaN(expiryTime)) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24)));
}

function getLocalInstituteCustomizationSettings(instituteId: string): ScholarLearnInstituteCustomizationSettings {
  const storedSettings = readLocalCustomizationSettings();
  return storedSettings[instituteId] ?? createDefaultCustomizationSettings();
}

function saveLocalInstituteCustomizationSettings(
  instituteId: string,
  settings: ScholarLearnInstituteCustomizationSettings,
) {
  const storedSettings = readLocalCustomizationSettings();
  window.localStorage.setItem(
    customizationSettingsStorageKey,
    JSON.stringify({
      ...storedSettings,
      [instituteId]: settings,
    }),
  );
}

function readLocalCustomizationSettings(): Record<string, ScholarLearnInstituteCustomizationSettings> {
  if (typeof window === "undefined") {
    return {};
  }

  const storedSettings = window.localStorage.getItem(customizationSettingsStorageKey);
  if (!storedSettings) {
    return {};
  }

  try {
    const parsedSettings = JSON.parse(storedSettings);
    return typeof parsedSettings === "object" && parsedSettings !== null && !Array.isArray(parsedSettings)
      ? (parsedSettings as Record<string, ScholarLearnInstituteCustomizationSettings>)
      : {};
  } catch {
    return {};
  }
}

function createDefaultCustomizationSettings(): ScholarLearnInstituteCustomizationSettings {
  return {
    attendance: {
      allowAbsent: true,
      allowLate: true,
      allowPresent: true,
      lockAfterHours: 24,
      minimumAttendancePercentage: 75,
    },
    dashboard: {
      showDashboardCards: true,
      showGraphs: true,
      showLeaderboard: true,
    },
    features: {
      analytics: true,
      attendance: true,
      coding: true,
      jobPortal: false,
      studentPortal: true,
      tests: true,
    },
    forms: {
      batchRequired: true,
      courseRequired: true,
      phoneRequired: true,
      subjectRequired: false,
    },
    grading: {
      gradeScale: "PERCENTAGE",
      passPercentage: 40,
      strongSubjectThreshold: 85,
      weakSubjectThreshold: 60,
    },
    tests: {
      codingTest: true,
      finalTest: true,
      mcqTest: true,
      monthlyTest: true,
      resultVisibility: true,
      weeklyTest: true,
    },
  };
}
