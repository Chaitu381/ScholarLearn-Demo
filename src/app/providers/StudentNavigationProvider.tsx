import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getStudentPageByKey,
  studentPageRegistry,
  type StudentPageDefinition,
  type StudentPageKey,
} from "../routes/studentPageRegistry";
import { getStudentPageFeature, useInstituteFeatureAccess } from "../../shared/feature-flags/InstituteFeatureAccess";
import { scrollToPageTop } from "../../shared/utils/scrollToTop";

type StudentNavigationContextValue = {
  activePage: StudentPageDefinition;
  activePageKey: StudentPageKey;
  pages: StudentPageDefinition[];
  setActivePage: (pageKey: StudentPageKey) => void;
};

const StudentNavigationContext = createContext<StudentNavigationContextValue | undefined>(undefined);

function resolvePageFromHash(): StudentPageKey {
  if (typeof window === "undefined") {
    return "dashboard";
  }

  const hashValue = window.location.hash.replace("#", "");
  if (window.location.pathname.startsWith("/student/tests/")) {
    return "tests";
  }

  const matchingPage = studentPageRegistry.find(
    (page) => page.path === hashValue || page.key === hashValue,
  );

  return matchingPage?.key ?? "dashboard";
}

export function StudentNavigationProvider({ children }: PropsWithChildren) {
  const [activePageKey, setActivePageKey] = useState<StudentPageKey>(resolvePageFromHash);
  const { isFeatureEnabled } = useInstituteFeatureAccess();
  const availablePages = useMemo(
    () =>
      studentPageRegistry.filter((page) => {
        const pageFeature = getStudentPageFeature(page.key);
        return page.key === "dashboard" || page.key === "profile" || page.key === "settings" || !pageFeature || isFeatureEnabled(pageFeature);
      }),
    [isFeatureEnabled],
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePageKey(resolvePageFromHash());
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    scrollToPageTop();
  }, [activePageKey]);

  const setActivePage = useCallback((pageKey: StudentPageKey) => {
    const page = getStudentPageByKey(pageKey);

    if (!page) {
      return;
    }

    const pageFeature = getStudentPageFeature(page.key);
    if (pageFeature && !isFeatureEnabled(pageFeature)) {
      return;
    }

    setActivePageKey(pageKey);
    scrollToPageTop();

    if (typeof window !== "undefined" && window.location.hash !== `#${page.path}`) {
      if (window.location.pathname.startsWith("/student/tests/")) {
        window.history.pushState({}, "", `/#${page.path}`);
        window.dispatchEvent(new PopStateEvent("popstate"));
        return;
      }

      window.location.hash = page.path;
    }
  }, [isFeatureEnabled]);

  const activePage = getStudentPageByKey(activePageKey) ?? studentPageRegistry[0];

  const value = useMemo(
    () => ({
      activePage,
      activePageKey,
      pages: availablePages,
      setActivePage,
    }),
    [activePage, activePageKey, availablePages, setActivePage],
  );

  return (
    <StudentNavigationContext.Provider value={value}>
      {children}
    </StudentNavigationContext.Provider>
  );
}

export function useStudentNavigation() {
  const context = useContext(StudentNavigationContext);

  if (!context) {
    throw new Error("useStudentNavigation must be used within StudentNavigationProvider");
  }

  return context;
}
