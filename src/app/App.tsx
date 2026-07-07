import { type ReactNode, useEffect, useState } from "react";
import { ApprovalDeniedPage } from "../features/auth/pages/ApprovalDeniedPage";
import { ApprovalPendingPage } from "../features/auth/pages/ApprovalPendingPage";
import { ScholarLearnAuthPage } from "../features/auth/pages/ScholarLearnAuthPage";
import { FounderApp } from "../features/founder/FounderApp";
import { isFounderPath } from "../features/founder/routes/founderRoutes";
import { LecturerApp } from "../features/lecturer/LecturerApp";
import { isLecturerPath } from "../features/lecturer/routes/lecturerRoutes";
import { StudentTestAttempt } from "../features/student/pages/StudentTestAttempt";
import { StudentTestResult } from "../features/student/pages/StudentTestResult";
import { StudentTestStart } from "../features/student/pages/StudentTestStart";
import { getActiveStoredStudentTestAttempt } from "../features/student/services/studentTestAttemptStorage";
import {
  getCurrentAppPath,
  getAuthSession,
  getAuthApprovalStatus,
  getRoleDashboardPath,
  type AuthSession,
  isRoleAllowedForPath,
  redirectToLogin,
  redirectToPath,
  saveLastVisitedPath,
  saveRequestedPath,
  type AuthRole,
} from "../lib/authSession";
import { ScholarLearnApp } from "../modules/ScholarLearn";
import { PageShell } from "../shared/components/layout/PageShell";
import { getStudentPageFeature, InstituteFeatureAccessProvider, useInstituteFeatureAccess } from "../shared/feature-flags/InstituteFeatureAccess";
import { LockedFeatureMessage } from "../shared/feature-flags/LockedFeatureMessage";
import { scrollToPageTop } from "../shared/utils/scrollToTop";
import { StudentNavigationProvider, useStudentNavigation } from "./providers/StudentNavigationProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

function StudentAppContent() {
  const { activePage } = useStudentNavigation();
  const { isFeatureEnabled } = useInstituteFeatureAccess();
  const ActivePage = activePage.component;
  const activePageFeature = getStudentPageFeature(activePage.key);
  const studentPortalEnabled = isFeatureEnabled("STUDENT_PORTAL");
  const activePageEnabled = studentPortalEnabled && (!activePageFeature || isFeatureEnabled(activePageFeature));
  const isCodeConnectFullscreen = activePage.path === "coding-practice" && activePageEnabled;

  return (
    <PageShell fullPage={isCodeConnectFullscreen}>
      {activePageEnabled ? (
        <ActivePage />
      ) : (
        <LockedFeatureMessage featureName={studentPortalEnabled ? activePageFeature ?? "STUDENT_PORTAL" : "STUDENT_PORTAL"} />
      )}
    </PageShell>
  );
}

function matchStudentTestRoute(pathname: string) {
  const match = pathname.match(/^\/student\/tests\/([^/]+)\/(start|attempt|result)$/);

  if (!match) {
    return null;
  }

  return {
    mode: match[2] as "attempt" | "result" | "start",
    testId: decodeURIComponent(match[1]),
  };
}

export default function App() {
  const [locationState, setLocationState] = useState(() =>
    typeof window === "undefined"
      ? { hash: "", pathname: "", search: "" }
      : { hash: window.location.hash, pathname: window.location.pathname, search: window.location.search },
  );
  const [authState, setAuthState] = useState<{ loading: boolean; session: AuthSession | null }>({
    loading: true,
    session: null,
  });
  const { hash: hashValue, pathname } = locationState;
  const isAuthPage = hashValue === "#auth" || hashValue === "#login" || hashValue === "#register";
  const isAccessDeniedPage = pathname === "/access-denied";
  const isApprovalPendingPage = pathname === "/approval-pending";
  const isFounderPage = isFounderPath(pathname);
  const isLecturerPage = isLecturerPath(pathname);
  const isScholarLearnPage = pathname.startsWith("/scholarlearn");
  const studentTestRoute = matchStudentTestRoute(pathname);
  const authSession = authState.session;
  const authRole = authSession?.role ?? null;
  const authToken = authSession?.authToken ?? "";
  const authLoading = authState.loading;
  const authApprovalStatus = authSession ? getAuthApprovalStatus(authSession) : null;
  const isPendingSession = authApprovalStatus === "PENDING_APPROVAL";
  const isDeniedSession = authApprovalStatus === "DENIED";
  const isApprovedSession = authApprovalStatus === "APPROVED";
  const isPublicPage = isAuthPage || isApprovalPendingPage || isAccessDeniedPage;
  const hasValidSession = Boolean(authToken && authRole);
  const canAccessCurrentPath = authSession && isApprovedSession ? isRoleAllowedForPath(authSession.role, pathname, hashValue) : false;

  useEffect(() => {
    const handleLocationChange = () => {
      setLocationState({ hash: window.location.hash, pathname: window.location.pathname, search: window.location.search });
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    setAuthState({
      loading: false,
      session: getAuthSession(),
    });
  }, [hashValue, pathname, locationState.search]);

  useEffect(() => {
    scrollToPageTop();
  }, [hashValue, pathname, locationState.search]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isApprovalPendingPage) {
      if (hasValidSession && authSession && isApprovedSession) {
        redirectToPath(getRoleDashboardPath(authSession.role));
        return;
      }

      if (hasValidSession && isDeniedSession) {
        redirectToPath("/access-denied");
        return;
      }

      return;
    }

    if (isAccessDeniedPage) {
      if (hasValidSession && authSession && isApprovedSession) {
        redirectToPath(getRoleDashboardPath(authSession.role));
        return;
      }

      if (hasValidSession && isPendingSession) {
        redirectToPath("/approval-pending");
        return;
      }

      return;
    }

    if (isAuthPage) {
      if (hasValidSession && authSession) {
        if (isPendingSession) {
          redirectToPath("/approval-pending");
          return;
        }

        if (isDeniedSession) {
          redirectToPath("/access-denied");
          return;
        }

        redirectToPath(getRoleDashboardPath(authSession.role));
      }
      return;
    }

    if (!hasValidSession) {
      saveRequestedPath(getCurrentAppPath());
      redirectToLogin();
      return;
    }

    if (authSession && isPendingSession) {
      redirectToPath("/approval-pending");
      return;
    }

    if (authSession && isDeniedSession) {
      redirectToPath("/access-denied");
      return;
    }

    if (authSession && !canAccessCurrentPath) {
      redirectToPath(getRoleDashboardPath(authSession.role));
      return;
    }

    if (authSession?.role === "STUDENT" && canAccessCurrentPath) {
      const activeTestAttempt = getActiveStoredStudentTestAttempt();
      const activeAttemptPath = activeTestAttempt ? `/student/tests/${activeTestAttempt.testId}/attempt` : "";

      if (activeAttemptPath && pathname !== activeAttemptPath) {
        redirectToPath(activeAttemptPath);
        return;
      }
    }

    if (authSession && canAccessCurrentPath && !isPublicPage) {
      saveLastVisitedPath(getCurrentAppPath());
    }
  }, [
    authLoading,
    authRole,
    authToken,
    canAccessCurrentPath,
    hasValidSession,
    isAccessDeniedPage,
    isApprovalPendingPage,
    isApprovedSession,
    isAuthPage,
    isDeniedSession,
    isFounderPage,
    isPendingSession,
    isPublicPage,
    pathname,
  ]);

  const shouldShowLogin = !authLoading && !isPublicPage && !hasValidSession;
  const shouldWaitForRedirect = Boolean(
    !authLoading && !isPublicPage && hasValidSession && authSession && isApprovedSession && !canAccessCurrentPath,
  );

  return (
    <ThemeProvider>
      <InstituteFeatureAccessProvider session={authSession}>
        {authLoading ? (
          <AuthLoadingScreen />
        ) : isAccessDeniedPage || isDeniedSession ? (
          <ApprovalDeniedPage session={authSession} />
        ) : isApprovalPendingPage || isPendingSession ? (
          <ApprovalPendingPage session={authSession} />
        ) : isAuthPage || shouldShowLogin ? (
          <ScholarLearnAuthPage />
        ) : shouldWaitForRedirect ? null : isFounderPage ? (
          <FounderApp pathname={pathname} />
        ) : isLecturerPage ? (
          <LecturerApp pathname={pathname} />
        ) : isScholarLearnPage ? (
          <ScholarLearnApp pathname={pathname} />
        ) : authSession && isStandaloneRoleDashboardPath(pathname, authSession.role) ? (
          <RoleDashboardPlaceholder role={authSession.role} />
        ) : studentTestRoute?.mode === "attempt" ? (
          <StudentTestFeatureGate fullPage>
            <StudentTestAttempt testId={studentTestRoute.testId} />
          </StudentTestFeatureGate>
        ) : studentTestRoute ? (
          <StudentNavigationProvider>
            <StudentTestFeatureGate>
              {studentTestRoute.mode === "start" ? <StudentTestStart testId={studentTestRoute.testId} /> : null}
              {studentTestRoute.mode === "result" ? <StudentTestResult testId={studentTestRoute.testId} /> : null}
            </StudentTestFeatureGate>
          </StudentNavigationProvider>
        ) : (
          <StudentNavigationProvider>
            <StudentAppContent />
          </StudentNavigationProvider>
        )}
      </InstituteFeatureAccessProvider>
    </ThemeProvider>
  );
}

function StudentTestFeatureGate({ children, fullPage = false }: { children: ReactNode; fullPage?: boolean }) {
  const { isFeatureEnabled } = useInstituteFeatureAccess();
  const testsEnabled = isFeatureEnabled("STUDENT_PORTAL") && isFeatureEnabled("TESTS");

  return (
    <PageShell fullPage={fullPage}>
      {testsEnabled ? children : <LockedFeatureMessage featureName={!isFeatureEnabled("STUDENT_PORTAL") ? "STUDENT_PORTAL" : "TESTS"} />}
    </PageShell>
  );
}

function AuthLoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4 text-text-primary">
      <div className="rounded-3xl border border-border bg-surface px-5 py-4 text-[14px] font-extrabold text-text-secondary shadow-card">
        Restoring session...
      </div>
    </main>
  );
}

function isStandaloneRoleDashboardPath(pathname: string, role: AuthRole) {
  return pathname === getRoleDashboardPath(role) && role !== "STUDENT" && role !== "LECTURER" && role !== "JUNIOR_LECTURER";
}

function RoleDashboardPlaceholder({ role }: { role: AuthRole }) {
  return (
    <main className="min-h-screen bg-background p-4 text-text-primary sm:p-6 lg:p-8">
      <section className="mx-auto max-w-4xl rounded-3xl border border-border bg-surface p-6 shadow-card">
        <p className="text-[12px] font-extrabold uppercase text-text-muted">Authenticated workspace</p>
        <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-text-primary">{formatRoleLabel(role)} Dashboard</h1>
        <p className="mt-3 text-[15px] leading-7 text-text-secondary">
          Your login session is active and will persist after refresh. This role dashboard route is ready for its module UI.
        </p>
      </section>
    </main>
  );
}

function formatRoleLabel(role: AuthRole) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
