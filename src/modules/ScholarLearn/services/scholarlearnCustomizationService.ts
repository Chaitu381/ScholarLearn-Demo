import type {
  CustomizationBundle,
  InstituteAttendanceSetting,
  InstituteDashboardSetting,
  InstituteFeatureSetting,
  InstituteFormSetting,
  InstituteGradingSetting,
  InstituteTestSetting,
} from "../types/customization.types";
import { scholarLearnApiRequest } from "./scholarLearnApi";

export async function getCustomizationBundle(instituteId: number): Promise<CustomizationBundle> {
  const [features, attendance, dashboard, tests, grading, forms] = await Promise.all([
    getInstituteFeatureSettings(instituteId),
    getInstituteAttendanceSettings(),
    getInstituteDashboardSettings(),
    getInstituteTestSettings(),
    getInstituteGradingSettings(),
    getInstituteFormSettings(),
  ]);

  return {
    attendance: filterByInstituteId(attendance, instituteId),
    dashboard: filterByInstituteId(dashboard, instituteId),
    features: filterByInstituteId(features, instituteId),
    forms: filterByInstituteId(forms, instituteId),
    grading: filterByInstituteId(grading, instituteId),
    tests: filterByInstituteId(tests, instituteId),
  };
}

export async function getInstituteAttendanceSettings() {
  return readListResponse<InstituteAttendanceSetting>(
    await scholarLearnApiRequest<unknown>("/institute-attendance-settings"),
  );
}

export async function createInstituteAttendanceSetting(payload: InstituteAttendanceSetting) {
  return scholarLearnApiRequest<InstituteAttendanceSetting>("/institute-attendance-settings", {
    body: payload,
    method: "POST",
  });
}

export async function updateInstituteAttendanceSetting(id: number, payload: InstituteAttendanceSetting) {
  return scholarLearnApiRequest<InstituteAttendanceSetting>(`/institute-attendance-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PUT",
  });
}

export async function patchInstituteAttendanceSetting(id: number, payload: Partial<InstituteAttendanceSetting>) {
  return scholarLearnApiRequest<InstituteAttendanceSetting>(`/institute-attendance-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PATCH",
  });
}

export async function deleteInstituteAttendanceSetting(id: number) {
  return scholarLearnApiRequest<void>(`/institute-attendance-settings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getInstituteDashboardSettings() {
  return readListResponse<InstituteDashboardSetting>(
    await scholarLearnApiRequest<unknown>("/institute-dashboard-settings"),
  );
}

export async function createInstituteDashboardSetting(payload: InstituteDashboardSetting) {
  return scholarLearnApiRequest<InstituteDashboardSetting>("/institute-dashboard-settings", {
    body: payload,
    method: "POST",
  });
}

export async function updateInstituteDashboardSetting(id: number, payload: InstituteDashboardSetting) {
  return scholarLearnApiRequest<InstituteDashboardSetting>(`/institute-dashboard-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PUT",
  });
}

export async function patchInstituteDashboardSetting(id: number, payload: Partial<InstituteDashboardSetting>) {
  return scholarLearnApiRequest<InstituteDashboardSetting>(`/institute-dashboard-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PATCH",
  });
}

export async function deleteInstituteDashboardSetting(id: number) {
  return scholarLearnApiRequest<void>(`/institute-dashboard-settings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getInstituteFeatureSettings(instituteId: number) {
  return readListResponse<InstituteFeatureSetting>(
    await scholarLearnApiRequest<unknown>(`/institutes/${encodeURIComponent(instituteId)}/customization/features`),
  );
}

export async function createInstituteFeatureSetting(instituteId: number, payload: InstituteFeatureSetting) {
  return scholarLearnApiRequest<InstituteFeatureSetting>(
    `/institutes/${encodeURIComponent(instituteId)}/customization/features`,
    {
      body: payload,
      method: "POST",
    },
  );
}

export async function updateInstituteFeatureSetting(
  instituteId: number,
  id: number,
  payload: InstituteFeatureSetting,
) {
  return scholarLearnApiRequest<InstituteFeatureSetting>(
    `/institutes/${encodeURIComponent(instituteId)}/customization/features/${encodeURIComponent(id)}`,
    {
      body: payload,
      method: "PUT",
    },
  );
}

export async function patchInstituteFeatureSetting(
  instituteId: number,
  id: number,
  payload: Partial<InstituteFeatureSetting>,
) {
  return scholarLearnApiRequest<InstituteFeatureSetting>(
    `/institutes/${encodeURIComponent(instituteId)}/customization/features/${encodeURIComponent(id)}`,
    {
      body: payload,
      method: "PATCH",
    },
  );
}

export async function deleteInstituteFeatureSetting(instituteId: number, id: number) {
  return scholarLearnApiRequest<void>(
    `/institutes/${encodeURIComponent(instituteId)}/customization/features/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export async function getInstituteFormSettings() {
  return readListResponse<InstituteFormSetting>(
    await scholarLearnApiRequest<unknown>("/institute-form-settings"),
  );
}

export async function createInstituteFormSetting(payload: InstituteFormSetting) {
  return scholarLearnApiRequest<InstituteFormSetting>("/institute-form-settings", {
    body: payload,
    method: "POST",
  });
}

export async function updateInstituteFormSetting(id: number, payload: InstituteFormSetting) {
  return scholarLearnApiRequest<InstituteFormSetting>(`/institute-form-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PUT",
  });
}

export async function patchInstituteFormSetting(id: number, payload: Partial<InstituteFormSetting>) {
  return scholarLearnApiRequest<InstituteFormSetting>(`/institute-form-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PATCH",
  });
}

export async function deleteInstituteFormSetting(id: number) {
  return scholarLearnApiRequest<void>(`/institute-form-settings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getInstituteGradingSettings() {
  return readListResponse<InstituteGradingSetting>(
    await scholarLearnApiRequest<unknown>("/institute-grading-settings"),
  );
}

export async function createInstituteGradingSetting(payload: InstituteGradingSetting) {
  return scholarLearnApiRequest<InstituteGradingSetting>("/institute-grading-settings", {
    body: payload,
    method: "POST",
  });
}

export async function updateInstituteGradingSetting(id: number, payload: InstituteGradingSetting) {
  return scholarLearnApiRequest<InstituteGradingSetting>(`/institute-grading-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PUT",
  });
}

export async function patchInstituteGradingSetting(id: number, payload: Partial<InstituteGradingSetting>) {
  return scholarLearnApiRequest<InstituteGradingSetting>(`/institute-grading-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PATCH",
  });
}

export async function deleteInstituteGradingSetting(id: number) {
  return scholarLearnApiRequest<void>(`/institute-grading-settings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getInstituteTestSettings() {
  return readListResponse<InstituteTestSetting>(
    await scholarLearnApiRequest<unknown>("/institute-test-settings"),
  );
}

export async function createInstituteTestSetting(payload: InstituteTestSetting) {
  return scholarLearnApiRequest<InstituteTestSetting>("/institute-test-settings", {
    body: payload,
    method: "POST",
  });
}

export async function updateInstituteTestSetting(id: number, payload: InstituteTestSetting) {
  return scholarLearnApiRequest<InstituteTestSetting>(`/institute-test-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PUT",
  });
}

export async function patchInstituteTestSetting(id: number, payload: Partial<InstituteTestSetting>) {
  return scholarLearnApiRequest<InstituteTestSetting>(`/institute-test-settings/${encodeURIComponent(id)}`, {
    body: payload,
    method: "PATCH",
  });
}

export async function deleteInstituteTestSetting(id: number) {
  return scholarLearnApiRequest<void>(`/institute-test-settings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

function filterByInstituteId<T extends { instituteId: number }>(records: T[], instituteId: number) {
  return records.filter((record) => record.instituteId === instituteId);
}

function readListResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (typeof response === "object" && response !== null) {
    const record = response as Record<string, unknown>;
    const possibleLists = [record.data, record.items, record.content, record.records];
    const list = possibleLists.find(Array.isArray);
    if (Array.isArray(list)) {
      return list as T[];
    }
  }

  return [];
}
