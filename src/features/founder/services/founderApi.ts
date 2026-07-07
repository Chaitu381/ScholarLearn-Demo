import { clearAuthSession, getAuthToken, redirectToLogin } from "../../../lib/authSession";
import type {
  FounderBatch,
  FounderBatchDetailsData,
  FounderBatchPerformance,
  FounderBatchStudent,
  FounderDashboardSummary,
  FounderNotification,
  FounderPerformancePoint,
  FounderStat,
} from "../types/founder.types";

const founderApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  import.meta.env.VITE_API_URL ??
  "";

type RequestMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

type RequestOptions = {
  body?: unknown;
  method?: RequestMethod;
};

export class FounderApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FounderApiError";
    this.status = status;
  }
}

export async function founderApiRequest<TResponse = unknown>(endpoint: string, options: RequestOptions = {}) {
  const response = await fetch(buildApiUrl(endpoint), {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options.body !== undefined),
    method: options.method ?? "GET",
  });

  if (response.status === 401) {
    clearAuthSession();
    redirectToLogin();
    throw new FounderApiError("Your session has expired. Please log in again.", response.status);
  }

  if (response.status === 403) {
    throw new FounderApiError("Access denied for this Founder resource.", response.status);
  }

  if (!response.ok) {
    throw new FounderApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export function getFounderDashboardSummary() {
  return founderApiRequest<FounderDashboardSummary>("/founder/dashboard/summary");
}

export function getFounderBatches() {
  return founderApiRequest<FounderBatch[]>("/founder/batches");
}

export function getFounderBatchDetails(batchId: string) {
  return founderApiRequest<FounderBatchDetailsData>(`/founder/batches/${encodeURIComponent(batchId)}`);
}

export function getFounderBatchPerformance(batchId: string) {
  return founderApiRequest<FounderBatchPerformance>(`/founder/batches/${encodeURIComponent(batchId)}/performance`);
}

export function getFounderBatchStudents(batchId: string) {
  return founderApiRequest<FounderBatchStudent[]>(`/founder/batches/${encodeURIComponent(batchId)}/students`);
}

export const founderApi = {
  getFounderBatchDetails,
  getFounderBatchPerformance,
  getFounderBatches,
  getFounderBatchStudents,
  getFounderDashboardSummary,
  getBatches() {
    return getFounderBatches();
  },
  getDashboard() {
    return founderApiRequest<{
      graphs: FounderPerformancePoint[];
      notifications: FounderNotification[];
      stats: FounderStat[];
    }>("/founder/dashboard");
  },
  getNotifications() {
    return founderApiRequest<FounderNotification[]>("/founder/notifications");
  },
};

function buildApiUrl(endpoint: string) {
  if (!founderApiBaseUrl) return endpoint;
  return `${founderApiBaseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
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

  return `Founder request failed with status ${response.status}.`;
}
