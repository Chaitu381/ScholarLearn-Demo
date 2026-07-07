import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { AuthSession } from "../../lib/authSession";
import { getInstituteFeatureSettings } from "../../modules/ScholarLearn/services/scholarlearnCustomizationService";

export type InstituteFeatureName =
  | "ANALYTICS"
  | "ASSIGNMENTS"
  | "ATTENDANCE"
  | "CERTIFICATES"
  | "CODING"
  | "GAMIFICATION"
  | "JOB_PORTAL"
  | "LEADERBOARD"
  | "STUDENT_PORTAL"
  | "TESTS";

type InstituteFeatureAccessContextValue = {
  error: string;
  features: Record<InstituteFeatureName, boolean>;
  isFeatureEnabled: (featureName: InstituteFeatureName) => boolean;
  loading: boolean;
  roleCanBypassFeatureLocks: boolean;
};

const instituteFeatureNames: InstituteFeatureName[] = [
  "STUDENT_PORTAL",
  "ATTENDANCE",
  "TESTS",
  "CODING",
  "ANALYTICS",
  "JOB_PORTAL",
  "ASSIGNMENTS",
  "CERTIFICATES",
  "LEADERBOARD",
  "GAMIFICATION",
];

const enabledFeatures = createEnabledFeatureMap();

const InstituteFeatureAccessContext = createContext<InstituteFeatureAccessContextValue>({
  error: "",
  features: enabledFeatures,
  isFeatureEnabled: () => true,
  loading: false,
  roleCanBypassFeatureLocks: false,
});

export function InstituteFeatureAccessProvider({
  children,
  session,
}: PropsWithChildren<{ session: AuthSession | null }>) {
  const [features, setFeatures] = useState<Record<InstituteFeatureName, boolean>>(enabledFeatures);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const roleCanBypassFeatureLocks = session?.role === "SCHOLARLEARN";
  const instituteId = getNumericInstituteId(session);

  useEffect(() => {
    let active = true;

    if (!session || roleCanBypassFeatureLocks || instituteId === null) {
      setFeatures(enabledFeatures);
      setLoading(false);
      setError("");
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");

    getInstituteFeatureSettings(instituteId)
      .then((settings) => {
        if (!active) {
          return;
        }

        setFeatures(settings.length ? createFeatureMapFromSettings(settings) : enabledFeatures);
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }

        setError(requestError instanceof Error ? requestError.message : "Unable to load institute feature settings.");
        setFeatures(enabledFeatures);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [instituteId, roleCanBypassFeatureLocks, session]);

  const value = useMemo<InstituteFeatureAccessContextValue>(
    () => ({
      error,
      features,
      isFeatureEnabled: (featureName) => roleCanBypassFeatureLocks || features[featureName] !== false,
      loading,
      roleCanBypassFeatureLocks,
    }),
    [error, features, loading, roleCanBypassFeatureLocks],
  );

  return <InstituteFeatureAccessContext.Provider value={value}>{children}</InstituteFeatureAccessContext.Provider>;
}

export function useInstituteFeatureAccess() {
  return useContext(InstituteFeatureAccessContext);
}

export function getStudentPageFeature(pageKey: string): InstituteFeatureName | null {
  if (pageKey === "analytics") return "ANALYTICS";
  if (pageKey === "coding") return "CODING";
  if (pageKey === "gamification") return "GAMIFICATION";
  if (pageKey === "leaderboard") return "LEADERBOARD";
  if (pageKey === "tests") return "TESTS";
  return null;
}

export function getLecturerRouteFeature(routeKey: string): InstituteFeatureName | null {
  if (routeKey === "assignments" || routeKey === "create-assignment") return "ASSIGNMENTS";
  if (routeKey === "tests" || routeKey === "create-test" || routeKey === "test-detail") return "TESTS";
  return null;
}

export function getFounderRouteFeature(routeKey: string): InstituteFeatureName | null {
  if (routeKey === "lecture-assignments") return "ASSIGNMENTS";
  if (routeKey === "lecture-tests") return "TESTS";
  return null;
}

function createFeatureMapFromSettings(
  settings: Array<{ enabled: boolean; featureName: string }>,
): Record<InstituteFeatureName, boolean> {
  return settings.reduce((featureMap, setting) => {
    if (isInstituteFeatureName(setting.featureName)) {
      featureMap[setting.featureName] = setting.enabled;
    }

    return featureMap;
  }, createEnabledFeatureMap());
}

function createEnabledFeatureMap(): Record<InstituteFeatureName, boolean> {
  return instituteFeatureNames.reduce(
    (featureMap, featureName) => ({
      ...featureMap,
      [featureName]: true,
    }),
    {} as Record<InstituteFeatureName, boolean>,
  );
}

function getNumericInstituteId(session: AuthSession | null) {
  const rawInstituteId = session?.instituteId ?? readString(session?.user.instituteId);
  const numericInstituteId = Number(rawInstituteId);
  return Number.isInteger(numericInstituteId) && numericInstituteId > 0 ? numericInstituteId : null;
}

function isInstituteFeatureName(value: string): value is InstituteFeatureName {
  return instituteFeatureNames.includes(value as InstituteFeatureName);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
