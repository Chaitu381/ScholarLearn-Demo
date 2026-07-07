import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  BarChart3,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  createInstituteAttendanceSetting,
  createInstituteDashboardSetting,
  createInstituteFeatureSetting,
  createInstituteFormSetting,
  createInstituteGradingSetting,
  createInstituteTestSetting,
  getCustomizationBundle,
  getInstituteAttendanceSettings,
  getInstituteDashboardSettings,
  getInstituteFeatureSettings,
  getInstituteFormSettings,
  getInstituteGradingSettings,
  getInstituteTestSettings,
  patchInstituteAttendanceSetting,
  patchInstituteDashboardSetting,
  patchInstituteFeatureSetting,
  patchInstituteFormSetting,
  patchInstituteGradingSetting,
  patchInstituteTestSetting,
  deleteInstituteGradingSetting,
} from "../services/scholarlearnCustomizationService";
import type {
  InstituteAttendanceSetting,
  InstituteDashboardSetting,
  InstituteFeatureSetting,
  InstituteFormSetting,
  InstituteGradingSetting,
  InstituteTestSetting,
} from "../types/customization.types";
import type { ScholarLearnInstitute } from "../types/scholarLearn.types";

type ScholarLearnInstituteCustomizeDialogProps = {
  institute: ScholarLearnInstitute;
};

type CustomizationTab = "attendance" | "dashboard" | "features" | "forms" | "grading" | "tests";
type ToastState = { message: string; type: "error" | "success" } | null;

const customizationTabs: Array<{ icon: LucideIcon; label: string; value: CustomizationTab }> = [
  { icon: Settings2, label: "Features", value: "features" },
  { icon: ClipboardCheck, label: "Attendance", value: "attendance" },
  { icon: BarChart3, label: "Dashboard", value: "dashboard" },
  { icon: FileText, label: "Tests", value: "tests" },
  { icon: GraduationCap, label: "Grading", value: "grading" },
  { icon: ShieldCheck, label: "Forms", value: "forms" },
];

const dashboardRoles = [
  "INSTITUTE_ADMIN",
  "ADMIN",
  "SENIOR_LECTURER",
  "JUNIOR_LECTURER",
  "ATTENDANCE_MARKER",
  "JOB_MANAGER",
  "STUDENT",
];

const dashboardWidgets = [
  "ATTENDANCE_CARD",
  "TEST_SCORE_CARD",
  "CODING_CARD",
  "ANALYTICS_GRAPH",
  "LEADERBOARD",
  "ASSIGNMENTS",
  "JOBS",
  "CERTIFICATES",
  "BATCH_PERFORMANCE",
  "WEAK_TOPICS",
  "RECENT_ACTIVITY",
];

const formNames = ["REGISTER", "STUDENT_PROFILE", "LECTURER_PROFILE", "JOB_APPLICATION"];

const defaultRegisterFields = ["firstName", "lastName", "email", "phoneNumber", "roleName", "instituteId"];

const featureDefinitions: Array<{ description: string; featureName: string; label: string }> = [
  {
    description: "Allow students to access their learning dashboard and profile workspace.",
    featureName: "STUDENT_PORTAL",
    label: "Student Portal",
  },
  {
    description: "Enable attendance tracking, status marking, and attendance reports.",
    featureName: "ATTENDANCE",
    label: "Attendance",
  },
  {
    description: "Enable tests, exams, test attempts, and result workflows.",
    featureName: "TESTS",
    label: "Tests",
  },
  {
    description: "Enable coding practice, coding tests, and coding submissions.",
    featureName: "CODING",
    label: "Coding",
  },
  {
    description: "Enable institute, batch, student, and performance analytics.",
    featureName: "ANALYTICS",
    label: "Analytics",
  },
  {
    description: "Enable job posts, applications, and placement workflows.",
    featureName: "JOB_PORTAL",
    label: "Job Portal",
  },
  {
    description: "Enable assignment creation, submission, review, and tracking.",
    featureName: "ASSIGNMENTS",
    label: "Assignments",
  },
  {
    description: "Enable certificates and completion credential visibility.",
    featureName: "CERTIFICATES",
    label: "Certificates",
  },
  {
    description: "Enable rankings, leaderboard summaries, and competitive progress views.",
    featureName: "LEADERBOARD",
    label: "Leaderboard",
  },
  {
    description: "Enable XP, badges, streaks, and gamified learner motivation.",
    featureName: "GAMIFICATION",
    label: "Gamification",
  },
];

export function ScholarLearnInstituteCustomizeDialog({ institute }: ScholarLearnInstituteCustomizeDialogProps) {
  const [activeTab, setActiveTab] = useState<CustomizationTab>("features");
  const [attendanceDraft, setAttendanceDraft] = useState<InstituteAttendanceSetting | null>(null);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [dashboardRole, setDashboardRole] = useState("INSTITUTE_ADMIN");
  const [dashboardSettings, setDashboardSettings] = useState<InstituteDashboardSetting[]>([]);
  const [featureMessage, setFeatureMessage] = useState("");
  const [featureSettings, setFeatureSettings] = useState<InstituteFeatureSetting[]>([]);
  const [formMessage, setFormMessage] = useState("");
  const [formName, setFormName] = useState("REGISTER");
  const [formSettings, setFormSettings] = useState<InstituteFormSetting[]>([]);
  const [gradingMessage, setGradingMessage] = useState("");
  const [gradingRows, setGradingRows] = useState<InstituteGradingSetting[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingDashboard, setSavingDashboard] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [savingFormRowIndex, setSavingFormRowIndex] = useState<number | null>(null);
  const [savingGradingRowIndex, setSavingGradingRowIndex] = useState<number | null>(null);
  const [savingTest, setSavingTest] = useState(false);
  const [deletingGradingRowId, setDeletingGradingRowId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [testDraft, setTestDraft] = useState<InstituteTestSetting | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const backendInstituteId = getBackendInstituteId(institute.id);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const showToast = (type: "error" | "success", message: string) => {
    setToast({ message, type });
  };

  const applyCustomizationBundle = async (instituteId: number) => {
    const customizationBundle = await getCustomizationBundle(instituteId);

    setFeatureSettings(customizationBundle.features);
    setAttendanceDraft(customizationBundle.attendance[0] ?? createDefaultAttendanceSetting(instituteId));
    setDashboardSettings(customizationBundle.dashboard);
    setTestDraft(customizationBundle.tests[0] ?? createDefaultTestSetting(instituteId));
    setGradingRows(
      customizationBundle.grading.length
        ? customizationBundle.grading
        : createDefaultGradingRows(instituteId),
    );
    setFormSettings(ensureRegisterFormRows(customizationBundle.forms, instituteId));
  };

  const resetLocalChanges = async () => {
    if (!backendInstituteId) {
      showToast("error", "A numeric backend instituteId is required before settings can be reset.");
      return;
    }

    setLoading(true);
    clearSectionMessages({
      setAttendanceMessage,
      setDashboardMessage,
      setFeatureMessage,
      setFormMessage,
      setGradingMessage,
      setMessage,
      setTestMessage,
    });

    try {
      await applyCustomizationBundle(backendInstituteId);
      showToast("success", "Local customization changes reset.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to reset customization data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    setLoading(true);
    setAttendanceDraft(null);
    setAttendanceMessage("");
    setDashboardMessage("");
    setDashboardRole("INSTITUTE_ADMIN");
    setDashboardSettings([]);
    setFeatureMessage("");
    setFeatureSettings([]);
    setFormMessage("");
    setFormName("REGISTER");
    setFormSettings([]);
    setGradingMessage("");
    setGradingRows([]);
    setMessage("");
    setTestDraft(null);
    setTestMessage("");

    async function loadCustomizationSettings() {
      if (!backendInstituteId) {
        if (active) {
          setAttendanceMessage("Attendance settings need a numeric backend instituteId before they can be saved.");
          setDashboardMessage("Dashboard settings need a numeric backend instituteId before they can be saved.");
          setFeatureMessage("Feature settings need a numeric backend instituteId before they can be saved.");
          setFormMessage("Form settings need a numeric backend instituteId before they can be saved.");
          setGradingMessage("Grading settings need a numeric backend instituteId before they can be saved.");
          setTestMessage("Test settings need a numeric backend instituteId before they can be saved.");
          setLoading(false);
        }
        return;
      }

      try {
        const loadedFeatures = await getInstituteFeatureSettings(backendInstituteId);
        if (active) {
          setFeatureSettings(loadedFeatures.filter((feature) => feature.instituteId === backendInstituteId));
        }
      } catch (error) {
        if (active) {
          const errorMessage = error instanceof Error ? error.message : "Unable to load feature settings.";
          setFeatureMessage(errorMessage);
          showToast("error", errorMessage);
        }
      }

      try {
        const loadedAttendanceSettings = await getInstituteAttendanceSettings();
        const instituteAttendanceSetting =
          loadedAttendanceSettings.find((attendanceSetting) => attendanceSetting.instituteId === backendInstituteId) ??
          createDefaultAttendanceSetting(backendInstituteId);

        if (active) {
          setAttendanceDraft(instituteAttendanceSetting);
        }
      } catch (error) {
        if (active) {
          const errorMessage = error instanceof Error ? error.message : "Unable to load attendance settings.";
          setAttendanceMessage(errorMessage);
          showToast("error", errorMessage);
        }
      }

      try {
        const loadedDashboardSettings = await getInstituteDashboardSettings();
        if (active) {
          setDashboardSettings(
            loadedDashboardSettings.filter((dashboardSetting) => dashboardSetting.instituteId === backendInstituteId),
          );
        }
      } catch (error) {
        if (active) {
          const errorMessage = error instanceof Error ? error.message : "Unable to load dashboard settings.";
          setDashboardMessage(errorMessage);
          showToast("error", errorMessage);
        }
      }

      try {
        const loadedTestSettings = await getInstituteTestSettings();
        const instituteTestSetting =
          loadedTestSettings.find((testSetting) => testSetting.instituteId === backendInstituteId) ??
          createDefaultTestSetting(backendInstituteId);

        if (active) {
          setTestDraft(instituteTestSetting);
        }
      } catch (error) {
        if (active) {
          const errorMessage = error instanceof Error ? error.message : "Unable to load test settings.";
          setTestMessage(errorMessage);
          showToast("error", errorMessage);
        }
      }

      try {
        const loadedGradingSettings = await getInstituteGradingSettings();
        const instituteGradingSettings = loadedGradingSettings.filter(
          (gradingSetting) => gradingSetting.instituteId === backendInstituteId,
        );

        if (active) {
          setGradingRows(
            instituteGradingSettings.length
              ? instituteGradingSettings
              : createDefaultGradingRows(backendInstituteId),
          );
        }
      } catch (error) {
        if (active) {
          const errorMessage = error instanceof Error ? error.message : "Unable to load grading settings.";
          setGradingMessage(errorMessage);
          showToast("error", errorMessage);
        }
      }

      try {
        const loadedFormSettings = await getInstituteFormSettings();
        const instituteFormSettings = loadedFormSettings.filter(
          (formSetting) => formSetting.instituteId === backendInstituteId,
        );

        if (active) {
          setFormSettings(ensureRegisterFormRows(instituteFormSettings, backendInstituteId));
        }
      } catch (error) {
        if (active) {
          const errorMessage = error instanceof Error ? error.message : "Unable to load form settings.";
          setFormMessage(errorMessage);
          showToast("error", errorMessage);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCustomizationSettings();

    return () => {
      active = false;
    };
  }, [backendInstituteId, institute.id, open]);

  const handleFeatureToggle = (featureName: string, enabled: boolean) => {
    if (!backendInstituteId) {
      setFeatureMessage("Feature settings need a numeric backend instituteId before they can be saved.");
      return;
    }

    setFeatureSettings((currentFeatures) => {
      const existingFeature = currentFeatures.find((feature) => feature.featureName === featureName);
      const nextFeature: InstituteFeatureSetting = {
        ...existingFeature,
        enabled,
        featureName,
        instituteId: backendInstituteId,
      };

      return existingFeature
        ? currentFeatures.map((feature) => (feature.featureName === featureName ? nextFeature : feature))
        : [nextFeature, ...currentFeatures];
    });
    setFeatureMessage("Feature changes are local until you click Save Feature Settings.");
  };

  const saveFeatureSettings = async () => {
    if (!backendInstituteId) {
      const errorMessage = "Feature settings need a numeric backend instituteId before they can be saved.";
      setFeatureMessage(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    setFeatureMessage("");
    setSavingFeatures(true);

    try {
      await Promise.all(
        featureSettings.map((feature) =>
          feature.featureId !== undefined
            ? patchInstituteFeatureSetting(backendInstituteId, feature.featureId, feature)
            : createInstituteFeatureSetting(backendInstituteId, {
                enabled: feature.enabled,
                featureName: feature.featureName,
                instituteId: backendInstituteId,
                configJson: feature.configJson,
              }),
        ),
      );
      await applyCustomizationBundle(backendInstituteId);
      setFeatureMessage("Feature settings saved.");
      showToast("success", "Feature settings saved.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save feature settings.";
      setFeatureMessage(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setSavingFeatures(false);
    }
  };

  const saveTestSettings = async () => {
    if (!backendInstituteId) {
      const errorMessage = "Test settings need a numeric backend instituteId before they can be saved.";
      setTestMessage(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    if (!testDraft) {
      return;
    }

    const payload: InstituteTestSetting = {
      ...testDraft,
      instituteId: backendInstituteId,
      maxAttempts: testDraft.allowReattempt ? Number(testDraft.maxAttempts) : 0,
      negativeMarkPerQuestion: testDraft.allowNegativeMarking ? Number(testDraft.negativeMarkPerQuestion) : 0,
      passingPercentage: Number(testDraft.passingPercentage),
    };

    setSavingTest(true);
    setTestMessage("");

    try {
      const savedTestSetting =
        payload.testSettingId !== undefined
          ? await patchInstituteTestSetting(payload.testSettingId, payload)
          : await createInstituteTestSetting(payload);

      await applyCustomizationBundle(backendInstituteId);
      setTestDraft({
        ...payload,
        ...savedTestSetting,
        instituteId: backendInstituteId,
      });
      setTestMessage("Test settings saved.");
      showToast("success", "Test settings saved.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save test settings.";
      setTestMessage(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setSavingTest(false);
    }
  };

  const handleDashboardWidgetToggle = (widgetName: string, visible: boolean) => {
    if (!backendInstituteId) {
      setDashboardMessage("Dashboard settings need a numeric backend instituteId before they can be saved.");
      return;
    }

    const currentDraft = getDashboardDraft(dashboardSettings, dashboardRole, backendInstituteId);
    const visibleWidgets = parseCommaSeparatedValues(currentDraft.visibleWidgets);
    const hiddenWidgets = parseCommaSeparatedValues(currentDraft.hiddenWidgets);
    const nextVisibleWidgets = visible ? addUniqueValue(visibleWidgets, widgetName) : removeValue(visibleWidgets, widgetName);
    const nextHiddenWidgets = visible ? removeValue(hiddenWidgets, widgetName) : addUniqueValue(hiddenWidgets, widgetName);

    setDashboardSettings((currentSettings) =>
      upsertDashboardDraft(currentSettings, {
        ...currentDraft,
        hiddenWidgets: stringifyCommaSeparatedValues(nextHiddenWidgets),
        visibleWidgets: stringifyCommaSeparatedValues(nextVisibleWidgets),
      }),
    );
  };

  const saveDashboardSettings = async () => {
    if (!backendInstituteId) {
      const errorMessage = "Dashboard settings need a numeric backend instituteId before they can be saved.";
      setDashboardMessage(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    const dashboardDraft = getDashboardDraft(dashboardSettings, dashboardRole, backendInstituteId);
    const payload: InstituteDashboardSetting = {
      dashboardSettingId: dashboardDraft.dashboardSettingId,
      hiddenWidgets: dashboardDraft.hiddenWidgets,
      instituteId: backendInstituteId,
      roleName: dashboardRole,
      visibleWidgets: dashboardDraft.visibleWidgets,
    };

    setDashboardMessage("");
    setSavingDashboard(true);

    try {
      const savedDashboard =
        payload.dashboardSettingId !== undefined
          ? await patchInstituteDashboardSetting(payload.dashboardSettingId, payload)
          : await createInstituteDashboardSetting(payload);

      await applyCustomizationBundle(backendInstituteId);
      setDashboardSettings((currentSettings) =>
        upsertDashboardDraft(currentSettings, {
          ...payload,
          ...savedDashboard,
          instituteId: backendInstituteId,
          roleName: dashboardRole,
        }),
      );
      setDashboardMessage("Dashboard settings saved.");
      showToast("success", "Dashboard settings saved.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save dashboard settings.";
      setDashboardMessage(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setSavingDashboard(false);
    }
  };

  const saveAttendanceSettings = async () => {
    if (!backendInstituteId) {
      const errorMessage = "Attendance settings need a numeric backend instituteId before they can be saved.";
      setAttendanceMessage(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    if (!attendanceDraft) {
      return;
    }

    const payload: InstituteAttendanceSetting = {
      ...attendanceDraft,
      instituteId: backendInstituteId,
      lateMarkingMinutes: attendanceDraft.allowLateMarking ? Number(attendanceDraft.lateMarkingMinutes) : 0,
      minimumAttendancePercentage: Number(attendanceDraft.minimumAttendancePercentage),
    };

    setAttendanceMessage("");
    setSavingAttendance(true);

    try {
      const savedAttendance =
        payload.attendanceSettingId !== undefined
          ? await patchInstituteAttendanceSetting(payload.attendanceSettingId, payload)
          : await createInstituteAttendanceSetting(payload);

      await applyCustomizationBundle(backendInstituteId);
      setAttendanceDraft({
        ...payload,
        ...savedAttendance,
        instituteId: backendInstituteId,
      });
      setAttendanceMessage("Attendance settings saved.");
      showToast("success", "Attendance settings saved.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save attendance settings.";
      setAttendanceMessage(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setSavingAttendance(false);
    }
  };

  const updateGradingRow = (rowIndex: number, row: InstituteGradingSetting) => {
    setGradingRows((currentRows) => currentRows.map((currentRow, index) => (index === rowIndex ? row : currentRow)));
  };

  const addGradingRow = () => {
    if (!backendInstituteId) {
      setGradingMessage("Grading settings need a numeric backend instituteId before they can be saved.");
      return;
    }

    setGradingRows((currentRows) => [
      ...currentRows,
      {
        gradeName: "",
        instituteId: backendInstituteId,
        maxPercentage: 0,
        minPercentage: 0,
      },
    ]);
    setGradingMessage("Add the grade name and percentage range, then save the row.");
  };

  const saveGradingRow = async (rowIndex: number) => {
    if (!backendInstituteId) {
      const errorMessage = "Grading settings need a numeric backend instituteId before they can be saved.";
      setGradingMessage(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    const row = gradingRows[rowIndex];
    if (!row) {
      return;
    }

    const validationMessage = validateGradingRow(row, gradingRows, rowIndex);
    if (validationMessage) {
      setGradingMessage(validationMessage);
      showToast("error", validationMessage);
      return;
    }

    const payload: InstituteGradingSetting = {
      gradeName: row.gradeName.trim(),
      gradingSettingId: row.gradingSettingId,
      instituteId: backendInstituteId,
      maxPercentage: Number(row.maxPercentage),
      minPercentage: Number(row.minPercentage),
    };

    setGradingMessage("");
    setSavingGradingRowIndex(rowIndex);

    try {
      const savedRow =
        payload.gradingSettingId !== undefined
          ? await patchInstituteGradingSetting(payload.gradingSettingId, payload)
          : await createInstituteGradingSetting(payload);

      await applyCustomizationBundle(backendInstituteId);
      setGradingRows((currentRows) =>
        currentRows.map((currentRow, index) =>
          index === rowIndex
            ? {
                ...payload,
                ...savedRow,
                instituteId: backendInstituteId,
              }
            : currentRow,
        ),
      );
      setGradingMessage(`${payload.gradeName} saved.`);
      showToast("success", `${payload.gradeName} saved.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save grading setting.";
      setGradingMessage(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setSavingGradingRowIndex(null);
    }
  };

  const deleteGradingRow = async (rowIndex: number) => {
    const row = gradingRows[rowIndex];
    if (!row) {
      return;
    }

    if (row.gradingSettingId === undefined) {
      setGradingRows((currentRows) => currentRows.filter((_, index) => index !== rowIndex));
      setGradingMessage(`${row.gradeName || "Grade row"} removed.`);
      showToast("success", `${row.gradeName || "Grade row"} removed locally.`);
      return;
    }

    setDeletingGradingRowId(row.gradingSettingId);
    setGradingMessage("");

    try {
      await deleteInstituteGradingSetting(row.gradingSettingId);
      if (backendInstituteId) {
        await applyCustomizationBundle(backendInstituteId);
      }
      setGradingRows((currentRows) => currentRows.filter((_, index) => index !== rowIndex));
      setGradingMessage(`${row.gradeName || "Grade row"} deleted.`);
      showToast("success", `${row.gradeName || "Grade row"} deleted.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to delete grading setting.";
      setGradingMessage(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setDeletingGradingRowId(null);
    }
  };

  const updateFormRow = (selectedFormName: string, rowIndex: number, row: InstituteFormSetting) => {
    setFormSettings((currentRows) => replaceFormRow(currentRows, selectedFormName, rowIndex, row));
  };

  const addFormRow = () => {
    if (!backendInstituteId) {
      setFormMessage("Form settings need a numeric backend instituteId before they can be saved.");
      return;
    }

    setFormSettings((currentRows) => [
      ...currentRows,
      {
        fieldName: "",
        formName,
        instituteId: backendInstituteId,
        labelName: "",
        required: false,
        validationRule: "",
        visible: true,
      },
    ]);
    setFormMessage("Add the field name and label, then save the row.");
  };

  const saveFormRow = async (selectedFormName: string, rowIndex: number) => {
    if (!backendInstituteId) {
      const errorMessage = "Form settings need a numeric backend instituteId before they can be saved.";
      setFormMessage(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    const row = getFormRows(formSettings, selectedFormName, backendInstituteId)[rowIndex];
    if (!row) {
      return;
    }

    const validationMessage = validateFormRow(row);
    if (validationMessage) {
      setFormMessage(validationMessage);
      showToast("error", validationMessage);
      return;
    }

    const payload: InstituteFormSetting = {
      fieldName: row.fieldName.trim(),
      formName: selectedFormName,
      formSettingId: row.formSettingId,
      instituteId: backendInstituteId,
      labelName: row.labelName.trim(),
      required: row.required,
      validationRule: row.validationRule?.trim() ?? "",
      visible: row.visible,
    };

    setFormMessage("");
    setSavingFormRowIndex(rowIndex);

    try {
      const savedRow =
        payload.formSettingId !== undefined
          ? await patchInstituteFormSetting(payload.formSettingId, payload)
          : await createInstituteFormSetting(payload);

      await applyCustomizationBundle(backendInstituteId);
      setFormSettings((currentRows) =>
        replaceFormRow(currentRows, selectedFormName, rowIndex, {
          ...payload,
          ...savedRow,
          formName: selectedFormName,
          instituteId: backendInstituteId,
        }),
      );
      setFormMessage(`${payload.labelName} saved.`);
      showToast("success", `${payload.labelName} saved.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save form setting.";
      setFormMessage(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setSavingFormRowIndex(null);
    }
  };

  const activeSaveBusy =
    savingAttendance ||
    savingDashboard ||
    savingFeatures ||
    savingFormRowIndex !== null ||
    savingGradingRowIndex !== null ||
    savingTest;
  const activeSaveDisabled =
    loading ||
    activeSaveBusy ||
    backendInstituteId === null ||
    deletingGradingRowId !== null ||
    (activeTab === "attendance" && attendanceDraft === null) ||
    (activeTab === "tests" && testDraft === null) ||
    (activeTab === "grading" && gradingRows.length === 0) ||
    (activeTab === "forms" && getFormRows(formSettings, formName, backendInstituteId).length === 0);

  const saveActiveCustomization = async () => {
    if (activeTab === "features") {
      await saveFeatureSettings();
      return;
    }

    if (activeTab === "attendance") {
      await saveAttendanceSettings();
      return;
    }

    if (activeTab === "dashboard") {
      await saveDashboardSettings();
      return;
    }

    if (activeTab === "tests") {
      await saveTestSettings();
      return;
    }

    if (activeTab === "grading") {
      for (let rowIndex = 0; rowIndex < gradingRows.length; rowIndex += 1) {
        await saveGradingRow(rowIndex);
      }
      return;
    }

    const visibleFormRows = getFormRows(formSettings, formName, backendInstituteId);
    for (let rowIndex = 0; rowIndex < visibleFormRows.length; rowIndex += 1) {
      await saveFormRow(formName, rowIndex);
    }
  };

  return (
    <>
      <button
        type="button"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <SlidersHorizontal aria-hidden="true" size={15} strokeWidth={2.5} />
        Customize
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden bg-slate-900/35 p-3 sm:p-4"
          role="presentation"
          onClick={(event) => event.stopPropagation()}
        >
          {toast ? <CustomizationToast onClose={() => setToast(null)} toast={toast} /> : null}
          <section
            aria-label={`${institute.name} customization`}
            aria-modal="true"
            className="flex max-h-[90vh] w-full max-w-[min(1400px,90vw)] flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
            role="dialog"
          >
            <header className="shrink-0 border-b border-border bg-surface/95 p-5 backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
                    INSTITUTE CUSTOMIZATION
                  </span>
                  <h2 className="mt-3 text-[28px] font-extrabold leading-tight text-text-primary sm:text-[34px]">
                    {institute.name}
                  </h2>
                  <p className="mt-2 max-w-4xl text-[14px] font-semibold leading-6 text-text-secondary">
                    Customize feature access, attendance rules, dashboard widgets, tests, grading, and forms for this
                    institute.
                  </p>
                </div>
                <button
                  type="button"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-surface-soft text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                  aria-label="Close customization dialog"
                  onClick={() => setOpen(false)}
                >
                  <X aria-hidden="true" size={18} strokeWidth={2.5} />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6">
              {loading ? (
                <p className="rounded-2xl border border-border bg-surface-soft p-4 text-[13px] font-extrabold text-text-secondary">
                  Loading customization settings...
                </p>
              ) : (
                <div>
                  <div className="w-full overflow-x-auto overflow-y-hidden pb-1 lg:overflow-x-visible">
                    <div className="flex w-max gap-2 rounded-3xl border border-border bg-surface-soft p-1 lg:w-full">
                      {customizationTabs.map((tab) => (
                        <CustomizationTabButton
                          key={tab.value}
                          active={activeTab === tab.value}
                          icon={tab.icon}
                          label={tab.label}
                          onClick={() => setActiveTab(tab.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    {renderCustomizationSection(activeTab, {
                      attendanceDraft,
                      attendanceMessage,
                      backendInstituteId,
                      dashboardMessage,
                      dashboardRole,
                      dashboardSettings,
                      featureMessage,
                      featureSettings,
                      formMessage,
                      formName,
                      formSettings,
                      deletingGradingRowId,
                      gradingMessage,
                      gradingRows,
                      onAddGradingRow: addGradingRow,
                      onAddFormRow: addFormRow,
                      onAttendanceDraftChange: setAttendanceDraft,
                      onDeleteGradingRow: deleteGradingRow,
                      onDashboardRoleChange: setDashboardRole,
                      onDashboardWidgetToggle: handleDashboardWidgetToggle,
                      onFormNameChange: setFormName,
                      onFormRowChange: updateFormRow,
                      onGradingRowChange: updateGradingRow,
                      onSaveAttendance: saveAttendanceSettings,
                      onSaveDashboard: saveDashboardSettings,
                      onFeatureToggle: handleFeatureToggle,
                      onSaveFeatures: saveFeatureSettings,
                      onSaveFormRow: saveFormRow,
                      onSaveGradingRow: saveGradingRow,
                      onSaveTest: saveTestSettings,
                      savingAttendance,
                      savingDashboard,
                      savingFeatures,
                      savingFormRowIndex,
                      savingGradingRowIndex,
                      savingTest,
                      testDraft,
                      testMessage,
                      onTestDraftChange: setTestDraft,
                    })}
                  </div>
                </div>
              )}

              {message ? (
                <p className="mt-4 rounded-2xl border border-border bg-surface-soft px-4 py-3 text-[13px] font-extrabold text-text-secondary">
                  {message}
                </p>
              ) : null}
            </div>

            <footer className="shrink-0 border-t border-border bg-surface/95 p-4 backdrop-blur sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="h-11 rounded-2xl border border-border bg-surface-soft px-5 text-[13px] font-extrabold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                  disabled={loading}
                  onClick={resetLocalChanges}
                >
                  Reset
                </button>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="h-11 rounded-2xl border border-border bg-surface-soft px-5 text-[13px] font-extrabold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="h-11 rounded-2xl bg-primary px-6 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={activeSaveDisabled}
                    onClick={() => void saveActiveCustomization()}
                  >
                    {activeSaveBusy ? "Saving..." : "Save customization"}
                  </button>
                </div>
              </div>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}

function CustomizeSection({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-surface-soft p-4 sm:p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>
        <h3 className="text-[17px] font-extrabold text-text-primary">{title}</h3>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function CustomizationTabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "inline-flex h-11 min-w-[132px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-surface px-4 text-[13px] font-extrabold text-primary-dark shadow-card lg:min-w-0 lg:flex-1"
          : "inline-flex h-11 min-w-[132px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 text-[13px] font-extrabold text-text-secondary transition hover:bg-surface hover:text-text-primary lg:min-w-0 lg:flex-1"
      }
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function CustomizationToast({ onClose, toast }: { onClose: () => void; toast: NonNullable<ToastState> }) {
  const isSuccess = toast.type === "success";

  return (
    <div className="fixed right-5 top-5 z-[60] w-[min(360px,calc(100vw-40px))] rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase ${
              isSuccess ? "bg-primary-soft text-primary-dark" : "bg-red-soft text-red"
            }`}
          >
            {isSuccess ? "Success" : "Error"}
          </span>
          <p className="mt-2 text-[13px] font-extrabold leading-5 text-text-primary">{toast.message}</p>
        </div>
        <button
          type="button"
          aria-label="Close notification"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl border border-border bg-surface-soft text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
          onClick={onClose}
        >
          <X aria-hidden="true" size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function renderCustomizationSection(
  activeTab: CustomizationTab,
  {
    attendanceDraft,
    attendanceMessage,
    backendInstituteId,
    dashboardMessage,
    dashboardRole,
    dashboardSettings,
    featureMessage,
    featureSettings,
    formMessage,
    formName,
    formSettings,
    deletingGradingRowId,
    gradingMessage,
    gradingRows,
    onAddGradingRow,
    onAddFormRow,
    onAttendanceDraftChange,
    onDeleteGradingRow,
    onDashboardRoleChange,
    onDashboardWidgetToggle,
    onFormNameChange,
    onFormRowChange,
    onGradingRowChange,
    onSaveAttendance,
    onSaveDashboard,
    onFeatureToggle,
    onSaveFeatures,
    onSaveFormRow,
    onSaveGradingRow,
    onSaveTest,
    onTestDraftChange,
    savingAttendance,
    savingDashboard,
    savingFeatures,
    savingFormRowIndex,
    savingGradingRowIndex,
    savingTest,
    testDraft,
    testMessage,
  }: {
    attendanceDraft: InstituteAttendanceSetting | null;
    attendanceMessage: string;
    backendInstituteId: number | null;
    dashboardMessage: string;
    dashboardRole: string;
    dashboardSettings: InstituteDashboardSetting[];
    featureMessage: string;
    featureSettings: InstituteFeatureSetting[];
    formMessage: string;
    formName: string;
    formSettings: InstituteFormSetting[];
    deletingGradingRowId: number | null;
    gradingMessage: string;
    gradingRows: InstituteGradingSetting[];
    onAddGradingRow: () => void;
    onAddFormRow: () => void;
    onAttendanceDraftChange: (attendanceDraft: InstituteAttendanceSetting) => void;
    onDeleteGradingRow: (rowIndex: number) => void | Promise<void>;
    onDashboardRoleChange: (roleName: string) => void;
    onDashboardWidgetToggle: (widgetName: string, visible: boolean) => void;
    onFormNameChange: (formName: string) => void;
    onFormRowChange: (formName: string, rowIndex: number, row: InstituteFormSetting) => void;
    onGradingRowChange: (rowIndex: number, row: InstituteGradingSetting) => void;
    onSaveAttendance: () => void | Promise<void>;
    onSaveDashboard: () => void | Promise<void>;
    onFeatureToggle: (featureName: string, enabled: boolean) => void | Promise<void>;
    onSaveFeatures: () => void | Promise<void>;
    onSaveFormRow: (formName: string, rowIndex: number) => void | Promise<void>;
    onSaveGradingRow: (rowIndex: number) => void | Promise<void>;
    onSaveTest: () => void | Promise<void>;
    onTestDraftChange: (testDraft: InstituteTestSetting) => void;
    savingAttendance: boolean;
    savingDashboard: boolean;
    savingFeatures: boolean;
    savingFormRowIndex: number | null;
    savingGradingRowIndex: number | null;
    savingTest: boolean;
    testDraft: InstituteTestSetting | null;
    testMessage: string;
  },
) {
  if (activeTab === "features") {
    return (
      <CustomizeSection icon={Settings2} title="Features">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {featureDefinitions.map((featureDefinition) => {
            const feature = featureSettings.find((item) => item.featureName === featureDefinition.featureName);
            return (
              <FeatureToggleCard
                key={featureDefinition.featureName}
                description={featureDefinition.description}
                disabled={backendInstituteId === null || savingFeatures}
                enabled={feature?.enabled ?? true}
                label={featureDefinition.label}
                loading={false}
                onToggle={(enabled) => onFeatureToggle(featureDefinition.featureName, enabled)}
              />
            );
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {featureMessage ? (
            <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
              {featureMessage}
            </p>
          ) : (
            <p className="text-[13px] font-semibold text-text-secondary">
              Toggle changes stay local until you save this section.
            </p>
          )}
          <button
            type="button"
            className="h-11 shrink-0 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={backendInstituteId === null || savingFeatures}
            onClick={onSaveFeatures}
          >
            {savingFeatures ? "Saving..." : "Save Feature Settings"}
          </button>
        </div>
      </CustomizeSection>
    );
  }

  if (activeTab === "attendance") {
    return (
      <CustomizeSection icon={ClipboardCheck} title="Attendance">
        {attendanceDraft ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block rounded-2xl border border-border bg-surface px-3 py-2">
                <span className="text-[12px] font-extrabold uppercase text-text-muted">Attendance Type</span>
                <select
                  className="mt-1 h-10 w-full bg-transparent text-[14px] font-extrabold text-text-primary outline-none"
                  onChange={(event) =>
                    onAttendanceDraftChange({
                      ...attendanceDraft,
                      attendanceType: event.target.value,
                    })
                  }
                  value={attendanceDraft.attendanceType}
                >
                  <option value="DAILY">DAILY</option>
                  <option value="SUBJECT_WISE">SUBJECT_WISE</option>
                  <option value="SESSION_WISE">SESSION_WISE</option>
                </select>
              </label>

              <NumberField
                label="Minimum Attendance Percentage"
                max={100}
                min={0}
                onChange={(value) =>
                  onAttendanceDraftChange({
                    ...attendanceDraft,
                    minimumAttendancePercentage: value,
                  })
                }
                value={attendanceDraft.minimumAttendancePercentage}
              />
            </div>

            <ToggleRow
              checked={attendanceDraft.allowLateMarking}
              label="Allow Late Marking"
              onChange={(checked) =>
                onAttendanceDraftChange({
                  ...attendanceDraft,
                  allowLateMarking: checked,
                  lateMarkingMinutes: checked ? attendanceDraft.lateMarkingMinutes : 0,
                })
              }
            />

            <NumberField
              disabled={!attendanceDraft.allowLateMarking}
              label="Late Marking Minutes"
              max={240}
              min={0}
              onChange={(value) =>
                onAttendanceDraftChange({
                  ...attendanceDraft,
                  lateMarkingMinutes: value,
                })
              }
              value={attendanceDraft.lateMarkingMinutes}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {attendanceMessage ? (
                <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
                  {attendanceMessage}
                </p>
              ) : (
                <p className="text-[13px] font-semibold text-text-secondary">
                  Attendance settings are saved directly to the backend attendance settings endpoint.
                </p>
              )}
              <button
                type="button"
                className="h-11 shrink-0 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                disabled={backendInstituteId === null || savingAttendance}
                onClick={onSaveAttendance}
              >
                {savingAttendance ? "Saving..." : "Save Attendance Settings"}
              </button>
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
            {attendanceMessage || "Attendance settings are not available yet."}
          </p>
        )}
      </CustomizeSection>
    );
  }

  if (activeTab === "dashboard") {
    const dashboardDraft = backendInstituteId
      ? getDashboardDraft(dashboardSettings, dashboardRole, backendInstituteId)
      : null;
    const visibleWidgets = dashboardDraft ? parseCommaSeparatedValues(dashboardDraft.visibleWidgets) : [];

    return (
      <CustomizeSection icon={BarChart3} title="Dashboard">
        <label className="block rounded-2xl border border-border bg-surface px-3 py-2">
          <span className="text-[12px] font-extrabold uppercase text-text-muted">Role</span>
          <select
            className="mt-1 h-10 w-full bg-transparent text-[14px] font-extrabold text-text-primary outline-none"
            onChange={(event) => onDashboardRoleChange(event.target.value)}
            value={dashboardRole}
          >
            {dashboardRoles.map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {dashboardWidgets.map((widgetName) => (
            <WidgetToggleCard
              key={widgetName}
              disabled={backendInstituteId === null || savingDashboard}
              enabled={visibleWidgets.includes(widgetName)}
              label={widgetName}
              onToggle={(visible) => onDashboardWidgetToggle(widgetName, visible)}
            />
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <WidgetListPreview label="Visible widgets" value={dashboardDraft?.visibleWidgets ?? ""} />
          <WidgetListPreview label="Hidden widgets" value={dashboardDraft?.hiddenWidgets ?? ""} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {dashboardMessage ? (
            <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
              {dashboardMessage}
            </p>
          ) : (
            <p className="text-[13px] font-semibold text-text-secondary">
              Widget selections are stored as comma-separated visibleWidgets and hiddenWidgets.
            </p>
          )}
          <button
            type="button"
            className="h-11 shrink-0 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={backendInstituteId === null || savingDashboard}
            onClick={onSaveDashboard}
          >
            {savingDashboard ? "Saving..." : "Save Dashboard Settings"}
          </button>
        </div>
      </CustomizeSection>
    );
  }

  if (activeTab === "tests") {
    return (
      <CustomizeSection icon={FileText} title="Tests">
        {testDraft ? (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleRow
                checked={testDraft.allowNegativeMarking}
                label="Allow Negative Marking"
                onChange={(checked) =>
                  onTestDraftChange({
                    ...testDraft,
                    allowNegativeMarking: checked,
                    negativeMarkPerQuestion: checked ? testDraft.negativeMarkPerQuestion : 0,
                  })
                }
              />
              <NumberField
                disabled={!testDraft.allowNegativeMarking}
                label="Negative Mark Per Question"
                max={100}
                min={0}
                onChange={(value) =>
                  onTestDraftChange({
                    ...testDraft,
                    negativeMarkPerQuestion: value,
                  })
                }
                step="0.01"
                value={testDraft.negativeMarkPerQuestion}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ToggleRow
                checked={testDraft.showResultImmediately}
                label="Show Result Immediately"
                onChange={(checked) =>
                  onTestDraftChange({
                    ...testDraft,
                    showResultImmediately: checked,
                  })
                }
              />
              <ToggleRow
                checked={testDraft.allowReattempt}
                label="Allow Reattempt"
                onChange={(checked) =>
                  onTestDraftChange({
                    ...testDraft,
                    allowReattempt: checked,
                    maxAttempts: checked ? testDraft.maxAttempts : 0,
                  })
                }
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <NumberField
                disabled={!testDraft.allowReattempt}
                label="Max Attempts"
                max={50}
                min={0}
                onChange={(value) =>
                  onTestDraftChange({
                    ...testDraft,
                    maxAttempts: value,
                  })
                }
                value={testDraft.maxAttempts}
              />
              <NumberField
                label="Passing Percentage"
                max={100}
                min={0}
                onChange={(value) =>
                  onTestDraftChange({
                    ...testDraft,
                    passingPercentage: value,
                  })
                }
                value={testDraft.passingPercentage}
              />
            </div>

            <TextField
              helper="Suggested format: JAVA,PYTHON,JAVASCRIPT,CPP"
              label="Coding Allowed Languages"
              onChange={(value) =>
                onTestDraftChange({
                  ...testDraft,
                  codingAllowedLanguages: value,
                })
              }
              value={testDraft.codingAllowedLanguages}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {testMessage ? (
                <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
                  {testMessage}
                </p>
              ) : (
                <p className="text-[13px] font-semibold text-text-secondary">
                  Test settings are saved directly to the backend test settings endpoint.
                </p>
              )}
              <button
                type="button"
                className="h-11 shrink-0 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                disabled={backendInstituteId === null || savingTest}
                onClick={onSaveTest}
              >
                {savingTest ? "Saving..." : "Save Test Settings"}
              </button>
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
            {testMessage || "Test settings are not available yet."}
          </p>
        )}
      </CustomizeSection>
    );
  }

  if (activeTab === "grading") {
    return (
      <CustomizeSection icon={GraduationCap} title="Grading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-semibold text-text-secondary">
            Configure grade ranges with backend-supported gradeName, minPercentage, and maxPercentage values.
          </p>
          <button
            type="button"
            className="h-11 shrink-0 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={backendInstituteId === null}
            onClick={onAddGradingRow}
          >
            Add Grade Row
          </button>
        </div>

        <div className="space-y-3">
          {gradingRows.map((row, rowIndex) => (
            <GradingRowCard
              key={row.gradingSettingId ?? `${row.gradeName}-${rowIndex}`}
              deleting={row.gradingSettingId !== undefined && deletingGradingRowId === row.gradingSettingId}
              disabled={backendInstituteId === null}
              onChange={(nextRow) => onGradingRowChange(rowIndex, nextRow)}
              onDelete={() => onDeleteGradingRow(rowIndex)}
              onSave={() => onSaveGradingRow(rowIndex)}
              row={row}
              saving={savingGradingRowIndex === rowIndex}
            />
          ))}
        </div>

        {gradingMessage ? (
          <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
            {gradingMessage}
          </p>
        ) : (
          <p className="text-[13px] font-semibold text-text-secondary">
            Grade rows save individually and use minPercentage and maxPercentage ranges from the backend model.
          </p>
        )}
      </CustomizeSection>
    );
  }

  const visibleFormRows = getFormRows(formSettings, formName, backendInstituteId);

  return (
    <CustomizeSection icon={ShieldCheck} title="Forms">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <label className="block rounded-2xl border border-border bg-surface px-3 py-2 lg:min-w-72">
          <span className="text-[12px] font-extrabold uppercase text-text-muted">Form</span>
          <select
            className="mt-1 h-10 w-full bg-transparent text-[14px] font-extrabold text-text-primary outline-none"
            onChange={(event) => onFormNameChange(event.target.value)}
            value={formName}
          >
            {formNames.map((availableFormName) => (
              <option key={availableFormName} value={availableFormName}>
                {availableFormName}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="h-11 shrink-0 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          disabled={backendInstituteId === null}
          onClick={onAddFormRow}
        >
          Add Field Row
        </button>
      </div>

      <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-semibold leading-5 text-text-secondary">
        This saves form customization only. Required auth fields should not be hidden from registration unless the backend supports registering without them.
      </p>

      {visibleFormRows.length ? (
        <div className="space-y-3">
          {visibleFormRows.map((row, rowIndex) => (
            <FormSettingRowCard
              key={row.formSettingId ?? `${formName}-${row.fieldName}-${rowIndex}`}
              disabled={backendInstituteId === null || savingFormRowIndex === rowIndex}
              onChange={(nextRow) => onFormRowChange(formName, rowIndex, nextRow)}
              onSave={() => onSaveFormRow(formName, rowIndex)}
              row={row}
              saving={savingFormRowIndex === rowIndex}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
          No fields configured for {formName}. Add a field row to create one.
        </p>
      )}

      {formMessage ? (
        <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] font-extrabold text-text-secondary">
          {formMessage}
        </p>
      ) : (
        <p className="text-[13px] font-semibold text-text-secondary">
          Each row saves to the institute form settings endpoint with formName, fieldName, labelName, required, visible, and validationRule.
        </p>
      )}
    </CustomizeSection>
  );
}

function FeatureToggleCard({
  description,
  disabled,
  enabled,
  label,
  loading,
  onToggle,
}: {
  description: string;
  disabled: boolean;
  enabled: boolean;
  label: string;
  loading: boolean;
  onToggle: (enabled: boolean) => void | Promise<void>;
}) {
  return (
    <article className="h-full min-h-[154px] rounded-3xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <h4 className="min-w-0 text-[15px] font-extrabold text-text-primary">{label}</h4>
        <button
          type="button"
          aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
          className={`h-7 w-12 shrink-0 rounded-full p-1 transition ${
            enabled ? "bg-primary" : "bg-border"
          } disabled:cursor-not-allowed disabled:opacity-60`}
          disabled={disabled}
          onClick={() => onToggle(!enabled)}
        >
          <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-5" : ""}`} />
        </button>
      </div>
      <p className="mt-3 text-[13px] font-semibold leading-5 text-text-secondary">{description}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
            enabled ? "bg-primary-soft text-primary-dark" : "bg-surface-soft text-text-secondary"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </span>
        {loading ? <span className="text-[11px] font-extrabold text-text-muted">Updating...</span> : null}
      </div>
    </article>
  );
}

function WidgetToggleCard({
  disabled,
  enabled,
  label,
  onToggle,
}: {
  disabled: boolean;
  enabled: boolean;
  label: string;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border bg-surface px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-60 ${
        enabled ? "border-primary bg-primary-soft/40" : "border-border hover:border-primary"
      }`}
      disabled={disabled}
      onClick={() => onToggle(!enabled)}
    >
      <span className="text-[13px] font-extrabold text-text-primary">{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${enabled ? "bg-primary" : "bg-border"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function WidgetListPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-1 break-words text-[13px] font-extrabold text-text-primary">{value || "None"}</p>
    </div>
  );
}

function GradingRowCard({
  deleting,
  disabled,
  onChange,
  onDelete,
  onSave,
  row,
  saving,
}: {
  deleting: boolean;
  disabled: boolean;
  onChange: (row: InstituteGradingSetting) => void;
  onDelete: () => void | Promise<void>;
  onSave: () => void | Promise<void>;
  row: InstituteGradingSetting;
  saving: boolean;
}) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card">
      <div className="grid gap-3 lg:grid-cols-[1fr_150px_150px_auto] lg:items-end">
        <label className="block">
          <span className="text-[12px] font-extrabold uppercase text-text-muted">Grade Name</span>
          <input
            className="mt-1 h-10 w-full rounded-2xl border border-border bg-surface-soft px-3 text-[14px] font-extrabold text-text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:text-text-muted"
            disabled={disabled || saving || deleting}
            onChange={(event) => onChange({ ...row, gradeName: event.target.value })}
            type="text"
            value={row.gradeName}
          />
        </label>

        <NumberField
          disabled={disabled || saving || deleting}
          label="Min Percentage"
          max={100}
          min={0}
          onChange={(value) => onChange({ ...row, minPercentage: value })}
          value={row.minPercentage}
        />

        <NumberField
          disabled={disabled || saving || deleting}
          label="Max Percentage"
          max={100}
          min={0}
          onChange={(value) => onChange({ ...row, maxPercentage: value })}
          value={row.maxPercentage}
        />

        <div className="flex gap-2">
          <button
            type="button"
            className="h-11 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled || saving || deleting}
            onClick={onSave}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="h-11 rounded-2xl border border-red-soft bg-red-soft px-4 text-[13px] font-extrabold text-red transition hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled || saving || deleting}
            onClick={onDelete}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function FormSettingRowCard({
  disabled,
  onChange,
  onSave,
  row,
  saving,
}: {
  disabled: boolean;
  onChange: (row: InstituteFormSetting) => void;
  onSave: () => void | Promise<void>;
  row: InstituteFormSetting;
  saving: boolean;
}) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card">
      <div className="grid gap-3 xl:grid-cols-[1fr_1.2fr_1fr_auto] xl:items-end">
        <TextField
          disabled={disabled || saving}
          helper="Backend field key"
          label="Field Name"
          onChange={(value) => onChange({ ...row, fieldName: value })}
          placeholder="firstName"
          value={row.fieldName}
        />

        <TextField
          disabled={disabled || saving}
          helper="Label shown in configured forms"
          label="Label Name"
          onChange={(value) => onChange({ ...row, labelName: value })}
          placeholder="First name"
          value={row.labelName}
        />

        <TextField
          disabled={disabled || saving}
          helper="Optional backend validation rule"
          label="Validation Rule"
          onChange={(value) => onChange({ ...row, validationRule: value })}
          placeholder="email|required"
          value={row.validationRule ?? ""}
        />

        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[320px]">
          <ToggleRow
            checked={row.required}
            disabled={disabled || saving}
            label="Required"
            onChange={(checked) => onChange({ ...row, required: checked })}
          />
          <ToggleRow
            checked={row.visible}
            disabled={disabled || saving}
            label="Visible"
            onChange={(checked) => onChange({ ...row, visible: checked })}
          />
          <button
            type="button"
            className="h-11 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled || saving}
            onClick={onSave}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}

function formatFeatureLabel(featureName: string) {
  return featureName
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBackendInstituteId(instituteId: string) {
  const numericInstituteId = Number(instituteId);
  return Number.isInteger(numericInstituteId) && numericInstituteId > 0 ? numericInstituteId : null;
}

function createDefaultAttendanceSetting(instituteId: number): InstituteAttendanceSetting {
  return {
    allowLateMarking: false,
    attendanceType: "DAILY",
    instituteId,
    lateMarkingMinutes: 0,
    minimumAttendancePercentage: 75,
  };
}

function createDefaultTestSetting(instituteId: number): InstituteTestSetting {
  return {
    allowNegativeMarking: false,
    allowReattempt: false,
    codingAllowedLanguages: "JAVA,PYTHON,JAVASCRIPT,CPP",
    instituteId,
    maxAttempts: 0,
    negativeMarkPerQuestion: 0,
    passingPercentage: 40,
    showResultImmediately: true,
  };
}

function createDefaultGradingRows(instituteId: number): InstituteGradingSetting[] {
  return [
    { gradeName: "A+", instituteId, maxPercentage: 100, minPercentage: 90 },
    { gradeName: "A", instituteId, maxPercentage: 89, minPercentage: 80 },
    { gradeName: "B+", instituteId, maxPercentage: 79, minPercentage: 70 },
    { gradeName: "B", instituteId, maxPercentage: 69, minPercentage: 60 },
    { gradeName: "C", instituteId, maxPercentage: 59, minPercentage: 50 },
    { gradeName: "F", instituteId, maxPercentage: 49, minPercentage: 0 },
  ];
}

function clearSectionMessages({
  setAttendanceMessage,
  setDashboardMessage,
  setFeatureMessage,
  setFormMessage,
  setGradingMessage,
  setMessage,
  setTestMessage,
}: {
  setAttendanceMessage: (message: string) => void;
  setDashboardMessage: (message: string) => void;
  setFeatureMessage: (message: string) => void;
  setFormMessage: (message: string) => void;
  setGradingMessage: (message: string) => void;
  setMessage: (message: string) => void;
  setTestMessage: (message: string) => void;
}) {
  setAttendanceMessage("");
  setDashboardMessage("");
  setFeatureMessage("");
  setFormMessage("");
  setGradingMessage("");
  setMessage("");
  setTestMessage("");
}

function createDefaultRegisterFormRows(instituteId: number): InstituteFormSetting[] {
  return defaultRegisterFields.map((fieldName) => ({
    fieldName,
    formName: "REGISTER",
    instituteId,
    labelName: formatFieldLabel(fieldName),
    required: ["firstName", "lastName", "email", "roleName", "instituteId"].includes(fieldName),
    validationRule: getDefaultValidationRule(fieldName),
    visible: true,
  }));
}

function ensureRegisterFormRows(rows: InstituteFormSetting[], instituteId: number) {
  return rows.some((row) => row.formName === "REGISTER") ? rows : [...createDefaultRegisterFormRows(instituteId), ...rows];
}

function getFormRows(rows: InstituteFormSetting[], formName: string, instituteId: number | null) {
  const matchingRows = rows.filter((row) => row.formName === formName);
  if (matchingRows.length) {
    return matchingRows;
  }

  return formName === "REGISTER" && instituteId ? createDefaultRegisterFormRows(instituteId) : [];
}

function replaceFormRow(
  rows: InstituteFormSetting[],
  formName: string,
  rowIndex: number,
  nextRow: InstituteFormSetting,
) {
  let seenRows = -1;
  let replaced = false;
  const nextRows = rows.map((row) => {
    if (row.formName !== formName) {
      return row;
    }

    seenRows += 1;
    if (seenRows !== rowIndex) {
      return row;
    }

    replaced = true;
    return nextRow;
  });

  return replaced ? nextRows : [...nextRows, nextRow];
}

function validateFormRow(row: InstituteFormSetting) {
  if (!row.fieldName.trim()) {
    return "Field name is required.";
  }

  if (!row.labelName.trim()) {
    return "Label name is required.";
  }

  return "";
}

function formatFieldLabel(fieldName: string) {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();
}

function getDefaultValidationRule(fieldName: string) {
  if (fieldName === "email") {
    return "email";
  }

  if (fieldName === "phoneNumber") {
    return "phone";
  }

  return "required";
}

function validateGradingRow(row: InstituteGradingSetting, rows: InstituteGradingSetting[], rowIndex: number) {
  if (!row.gradeName.trim()) {
    return "Grade name is required.";
  }

  if (!isPercentage(row.minPercentage) || !isPercentage(row.maxPercentage)) {
    return "Percentages must be between 0 and 100.";
  }

  if (Number(row.minPercentage) >= Number(row.maxPercentage)) {
    return "Minimum percentage must be less than maximum percentage.";
  }

  const overlaps = rows.some((otherRow, otherIndex) => {
    if (otherIndex === rowIndex) {
      return false;
    }

    return rangesOverlap(
      Number(row.minPercentage),
      Number(row.maxPercentage),
      Number(otherRow.minPercentage),
      Number(otherRow.maxPercentage),
    );
  });

  return overlaps ? "Grade percentage ranges cannot overlap." : "";
}

function isPercentage(value: number) {
  return Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100;
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA <= endB && startB <= endA;
}

function getDashboardDraft(
  dashboardSettings: InstituteDashboardSetting[],
  roleName: string,
  instituteId: number,
): InstituteDashboardSetting {
  return (
    dashboardSettings.find((dashboardSetting) => dashboardSetting.roleName === roleName && dashboardSetting.instituteId === instituteId) ?? {
      hiddenWidgets: stringifyCommaSeparatedValues(dashboardWidgets),
      instituteId,
      roleName,
      visibleWidgets: "",
    }
  );
}

function upsertDashboardDraft(
  dashboardSettings: InstituteDashboardSetting[],
  dashboardDraft: InstituteDashboardSetting,
) {
  const existingDraft = dashboardSettings.some(
    (dashboardSetting) =>
      dashboardSetting.instituteId === dashboardDraft.instituteId && dashboardSetting.roleName === dashboardDraft.roleName,
  );

  return existingDraft
    ? dashboardSettings.map((dashboardSetting) =>
        dashboardSetting.instituteId === dashboardDraft.instituteId && dashboardSetting.roleName === dashboardDraft.roleName
          ? dashboardDraft
          : dashboardSetting,
      )
    : [dashboardDraft, ...dashboardSettings];
}

function parseCommaSeparatedValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyCommaSeparatedValues(values: string[]) {
  return values.join(",");
}

function addUniqueValue(values: string[], value: string) {
  return values.includes(value) ? values : [...values, value];
}

function removeValue(values: string[], value: string) {
  return values.filter((item) => item !== value);
}

function ToggleRow({
  checked,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-3 text-left transition hover:border-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="text-[13px] font-extrabold text-text-primary">{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-primary" : "bg-border"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function NumberField({
  disabled = false,
  label,
  max,
  min,
  onChange,
  step = "1",
  value,
}: {
  disabled?: boolean;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step?: string;
  value: number;
}) {
  return (
    <label className="block rounded-2xl border border-border bg-surface px-3 py-2">
      <span className="text-[12px] font-extrabold uppercase text-text-muted">{label}</span>
      <input
        className="mt-1 h-8 w-full bg-transparent text-[14px] font-extrabold text-text-primary outline-none disabled:cursor-not-allowed disabled:text-text-muted"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}

function TextField({
  disabled = false,
  helper,
  label,
  onChange,
  placeholder = "JAVA,PYTHON,JAVASCRIPT,CPP",
  value,
}: {
  disabled?: boolean;
  helper?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block rounded-2xl border border-border bg-surface px-3 py-2">
      <span className="text-[12px] font-extrabold uppercase text-text-muted">{label}</span>
      <input
        className="mt-1 h-9 w-full bg-transparent text-[14px] font-extrabold text-text-primary outline-none placeholder:text-text-muted"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {helper ? <span className="mt-1 block text-[12px] font-semibold text-text-secondary">{helper}</span> : null}
    </label>
  );
}
