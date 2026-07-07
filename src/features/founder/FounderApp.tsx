import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FounderNotificationDialog } from "./components/FounderNotificationDialog";
import { FounderTopbar } from "./components/FounderTopbar";
import { FounderBatchDetails } from "./pages/FounderBatchDetails";
import { FounderBatches } from "./pages/FounderBatches";
import { FounderDashboard } from "./pages/FounderDashboard";
import { FounderHistory } from "./pages/FounderHistory";
import { FounderLectures } from "./pages/FounderLectures";
import { FounderLectureWorkspace, type FounderLectureWorkspaceView } from "./pages/FounderLectureWorkspace";
import { FounderProfile } from "./pages/FounderProfile";
import { FounderSettings } from "./pages/FounderSettings";
import { resolveFounderRoute, type FounderRoute } from "./routes/founderRoutes";
import {
  getFounderApprovalRequests,
  updateFounderApprovalRequestStatus,
  type FounderApprovalRequest,
} from "../../lib/demoAuth";
import {
  approveInstituteUserApprovalRequest,
  denyInstituteUserApprovalRequest,
  getRecentInstituteUserApprovalNotifications,
} from "./services/founderApprovalApi";
import { getFounderRouteFeature, useInstituteFeatureAccess } from "../../shared/feature-flags/InstituteFeatureAccess";
import { LockedFeatureMessage } from "../../shared/feature-flags/LockedFeatureMessage";

type FounderAppProps = {
  pathname: string;
};

export function FounderApp({ pathname }: FounderAppProps) {
  const route = resolveFounderRoute(pathname);
  const { isFeatureEnabled } = useInstituteFeatureAccess();
  const routeFeature = getFounderRouteFeature(route.key);
  const routeEnabled = !routeFeature || isFeatureEnabled(routeFeature);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [approvalRequests, setApprovalRequests] = useState<FounderApprovalRequest[]>([]);
  const recentPendingApprovalRequests = approvalRequests.filter(isRecentPendingApprovalRequest);

  useEffect(() => {
    let active = true;

    getRecentInstituteUserApprovalNotifications().then((requests) => {
      if (active) {
        setApprovalRequests(requests);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const openNotifications = () => {
    getRecentInstituteUserApprovalNotifications()
      .then(setApprovalRequests)
      .catch(() => setApprovalRequests(getFounderApprovalRequests()));
    setNotificationsOpen((isOpen) => !isOpen);
  };

  const handleApproveRequest = async (approvalId: string) => {
    try {
      await approveInstituteUserApprovalRequest(approvalId);
      setApprovalRequests((requests) => requests.filter((request) => request.id !== approvalId));
    } catch {
      setApprovalRequests(updateFounderApprovalRequestStatus(approvalId, "APPROVED"));
    }
  };

  const handleDenyRequest = async (approvalId: string) => {
    try {
      await denyInstituteUserApprovalRequest(approvalId);
      setApprovalRequests((requests) => requests.filter((request) => request.id !== approvalId));
    } catch {
      setApprovalRequests(updateFounderApprovalRequestStatus(approvalId, "DENIED"));
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <FounderTopbar
        activePath={getFounderActiveNavPath(route)}
        hasPendingApprovalNotifications={recentPendingApprovalRequests.length > 0}
        notificationDialog={
          <FounderNotificationDialog
            approvalRequests={recentPendingApprovalRequests}
            onApprove={handleApproveRequest}
            onClose={() => setNotificationsOpen(false)}
            onDeny={handleDenyRequest}
            open={notificationsOpen}
          />
        }
        notificationsOpen={notificationsOpen}
        onOpenNotifications={openNotifications}
        selectedLectureMode={getFounderLectureMode(route)}
        selectedLecturerId={getFounderSelectedLecturerId(route)}
      />

      <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
        {route.key !== "dashboard" ? <FounderBackButton route={route} /> : null}
        {!routeEnabled && routeFeature ? (
          <LockedFeatureMessage featureName={routeFeature} roleLabel="this institute" />
        ) : (
          <>
            {route.key === "dashboard" ? <FounderDashboard /> : null}
            {route.key === "lectures" ? <FounderLectures /> : null}
            {isFounderLectureWorkspaceRoute(route) ? (
              <FounderLectureWorkspace lecturerId={route.params.lecturerId} view={getFounderLectureMode(route) ?? "dashboard"} />
            ) : null}
            {route.key === "batches" ? <FounderBatches /> : null}
            {route.key === "batch-details" ? <FounderBatchDetails batchId={route.params.batchId} /> : null}
            {route.key === "history" ? <FounderHistory /> : null}
            {route.key === "profile" ? <FounderProfile /> : null}
            {route.key === "settings" ? <FounderSettings /> : null}
          </>
        )}
      </main>
    </div>
  );
}

function FounderBackButton({ route }: { route: FounderRoute }) {
  const backPath = getFounderBackPath(route);

  return (
    <button
      type="button"
      className="mb-5 inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-secondary shadow-card transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
      onClick={() => navigateToFounderPath(backPath)}
    >
      <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.5} />
      Back
    </button>
  );
}

function getFounderActiveNavPath(route: FounderRoute) {
  if (route.key === "batches" || route.key === "batch-details") return "/founder/batches";
  if (route.key === "lectures") return "/founder/lectures";
  if (isFounderLectureWorkspaceRoute(route)) return "/founder/lecture-workspace";
  return "/founder/dashboard";
}

function getFounderBackPath(route: FounderRoute) {
  if (route.key === "batch-details") return "/founder/batches";
  if (route.key === "batches") return "/founder/dashboard";
  if (route.key === "lectures") return "/founder/dashboard";
  if (route.key === "lecture-dashboard") return "/founder/lectures";
  if (route.key === "lecture-batches" || route.key === "lecture-tests" || route.key === "lecture-assignments") {
    return `/founder/lectures/${encodeURIComponent(route.params.lecturerId ?? "")}/dashboard`;
  }
  return "/founder/dashboard";
}

function getFounderSelectedLecturerId(route: FounderRoute) {
  return isFounderLectureWorkspaceRoute(route) ? route.params.lecturerId : undefined;
}

function getFounderLectureMode(route: FounderRoute): FounderLectureWorkspaceView | undefined {
  if (route.key === "lecture-dashboard") return "dashboard";
  if (route.key === "lecture-batches") return "batches";
  if (route.key === "lecture-tests") return "tests";
  if (route.key === "lecture-assignments") return "assignments";
  return undefined;
}

function isFounderLectureWorkspaceRoute(route: FounderRoute) {
  return route.key === "lecture-dashboard" || route.key === "lecture-batches" || route.key === "lecture-tests" || route.key === "lecture-assignments";
}

function isRecentPendingApprovalRequest(request: FounderApprovalRequest) {
  if (request.requestedRole === "INSTITUTE_FOUNDER" || request.approvalStatus !== "PENDING_APPROVAL") {
    return false;
  }

  const requestedAt = new Date(request.requestedAt).getTime();
  if (Number.isNaN(requestedAt)) {
    return false;
  }

  return Date.now() - requestedAt <= 24 * 60 * 60 * 1000;
}

function navigateToFounderPath(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
