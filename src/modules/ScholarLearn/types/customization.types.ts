export type InstituteAttendanceSetting = {
  allowLateMarking: boolean;
  attendanceSettingId?: number;
  attendanceType: string;
  instituteId: number;
  lateMarkingMinutes: number;
  minimumAttendancePercentage: number;
};

export type InstituteDashboardSetting = {
  dashboardSettingId?: number;
  hiddenWidgets: string;
  instituteId: number;
  roleName: string;
  visibleWidgets: string;
};

export type InstituteFeatureSetting = {
  configJson?: string;
  enabled: boolean;
  featureId?: number;
  featureName: string;
  instituteId: number;
};

export type InstituteFormSetting = {
  fieldName: string;
  formName: string;
  formSettingId?: number;
  instituteId: number;
  labelName: string;
  required: boolean;
  validationRule?: string;
  visible: boolean;
};

export type InstituteGradingSetting = {
  gradeName: string;
  gradingSettingId?: number;
  instituteId: number;
  maxPercentage: number;
  minPercentage: number;
};

export type InstituteTestSetting = {
  allowNegativeMarking: boolean;
  allowReattempt: boolean;
  codingAllowedLanguages: string;
  instituteId: number;
  maxAttempts: number;
  negativeMarkPerQuestion: number;
  passingPercentage: number;
  showResultImmediately: boolean;
  testSettingId?: number;
};

export type CustomizationBundle = {
  attendance: InstituteAttendanceSetting[];
  dashboard: InstituteDashboardSetting[];
  features: InstituteFeatureSetting[];
  forms: InstituteFormSetting[];
  grading: InstituteGradingSetting[];
  tests: InstituteTestSetting[];
};
