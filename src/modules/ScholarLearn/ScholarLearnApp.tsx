import { useEffect, useState } from "react";
import type { FounderApprovalRequest } from "../../lib/demoAuth";
import { ScholarLearnApprovalNotificationDialog } from "./components/ScholarLearnApprovalNotificationDialog";
import { ScholarLearnShell } from "./components/ScholarLearnShell";
import { ScholarLearnAnalytics } from "./pages/ScholarLearnAnalytics";
import { ScholarLearnApprovals } from "./pages/ScholarLearnApprovals";
import { ScholarLearnDashboard } from "./pages/ScholarLearnDashboard";
import { ScholarLearnHistory } from "./pages/ScholarLearnHistory";
import { ScholarLearnInstituteDetail } from "./pages/ScholarLearnInstituteDetail";
import { ScholarLearnInstitutes } from "./pages/ScholarLearnInstitutes";
import { ScholarLearnProfile } from "./pages/ScholarLearnProfile";
import { ScholarLearnRevenuePlans } from "./pages/ScholarLearnRevenuePlans";
import { ScholarLearnSettings } from "./pages/ScholarLearnSettings";
import {
  approveScholarLearnApprovalRequest,
  denyScholarLearnApprovalRequest,
  getRecentScholarLearnApprovalNotifications,
} from "./services/scholarLearnApprovalApi";

export function ScholarLearnApp({ pathname }: { pathname: string }) {
  const route = resolveScholarLearnRoute(pathname);
  const [approvalError, setApprovalError] = useState("");
  const [approvalRequests, setApprovalRequests] = useState<FounderApprovalRequest[]>([]);
  const pendingFounderApprovals = approvalRequests.filter((request) => request.approvalStatus === "PENDING_APPROVAL");

  useEffect(() => {
    let active = true;

    getRecentScholarLearnApprovalNotifications()
      .then((requests) => {
        if (active) {
          setApprovalRequests(requests);
          setApprovalError("");
        }
      })
      .catch((error) => {
        if (active) {
          setApprovalError(error instanceof Error ? error.message : "Unable to load approval notifications.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const approveFounder = async (approvalId: string) => {
    try {
      await approveScholarLearnApprovalRequest(approvalId);
      setApprovalRequests((requests) => requests.filter((request) => request.id !== approvalId));
      setApprovalError("");
    } catch (error) {
      setApprovalError(error instanceof Error ? error.message : "Unable to approve this request.");
    }
  };

  const denyFounder = async (approvalId: string) => {
    try {
      await denyScholarLearnApprovalRequest(approvalId);
      setApprovalRequests((requests) => requests.filter((request) => request.id !== approvalId));
      setApprovalError("");
    } catch (error) {
      setApprovalError(error instanceof Error ? error.message : "Unable to deny this request.");
    }
  };

  return (
    <ScholarLearnShell
      activePath={getScholarLearnActivePath(route)}
      hasPendingApprovalNotifications={pendingFounderApprovals.length > 0}
      notificationDialog={(onClose) => (
        <ScholarLearnApprovalNotificationDialog
          approvalRequests={pendingFounderApprovals}
          errorMessage={approvalError}
          onApprove={approveFounder}
          onDeny={denyFounder}
          onClose={onClose}
        />
      )}
    >
      {route.key === "dashboard" ? <ScholarLearnDashboard /> : null}
      {route.key === "institutes" ? <ScholarLearnInstitutes /> : null}
      {route.key === "approvals" ? <ScholarLearnApprovals /> : null}
      {route.key === "revenue-plans" ? <ScholarLearnRevenuePlans /> : null}
      {route.key === "analytics" ? <ScholarLearnAnalytics /> : null}
      {route.key === "institute-detail" ? <ScholarLearnInstituteDetail instituteId={route.params.instituteId} /> : null}
      {route.key === "institute-founder-view" ? <ScholarLearnInstituteDetail instituteId={route.params.instituteId} /> : null}
      {route.key === "profile" ? <ScholarLearnProfile /> : null}
      {route.key === "settings" ? <ScholarLearnSettings /> : null}
      {route.key === "history" ? <ScholarLearnHistory /> : null}
    </ScholarLearnShell>
  );
}

type ScholarLearnRouteKey =
  | "analytics"
  | "approvals"
  | "dashboard"
  | "history"
  | "institute-detail"
  | "institute-founder-view"
  | "institutes"
  | "profile"
  | "revenue-plans"
  | "settings";

type ScholarLearnRoute = {
  key: ScholarLearnRouteKey;
  params: {
    instituteId?: string;
  };
};

function resolveScholarLearnRoute(pathname: string): ScholarLearnRoute {
  if (pathname === "/scholarlearn" || pathname === "/scholarlearn/dashboard") {
    return { key: "dashboard", params: {} };
  }

  if (pathname === "/scholarlearn/institutes") {
    return { key: "institutes", params: {} };
  }

  if (pathname === "/scholarlearn/approvals") return { key: "approvals", params: {} };
  if (pathname === "/scholarlearn/revenue-plans") return { key: "revenue-plans", params: {} };
  if (pathname === "/scholarlearn/analytics") return { key: "analytics", params: {} };

  const founderViewMatch = pathname.match(/^\/scholarlearn\/institutes\/([^/]+)\/founder-view\/?$/);
  if (founderViewMatch) {
    return { key: "institute-founder-view", params: { instituteId: decodeURIComponent(founderViewMatch[1]) } };
  }

  const instituteDetailMatch = pathname.match(/^\/scholarlearn\/institutes\/([^/]+)\/?$/);
  if (instituteDetailMatch) {
    return { key: "institute-detail", params: { instituteId: decodeURIComponent(instituteDetailMatch[1]) } };
  }

  if (pathname === "/scholarlearn/profile") return { key: "profile", params: {} };
  if (pathname === "/scholarlearn/settings") return { key: "settings", params: {} };
  if (pathname === "/scholarlearn/history") return { key: "history", params: {} };

  return { key: "dashboard", params: {} };
}

function getScholarLearnActivePath(route: ScholarLearnRoute) {
  if (route.key === "institutes" || route.key === "institute-detail" || route.key === "institute-founder-view") {
    return "/scholarlearn/institutes";
  }
  if (route.key === "approvals") return "/scholarlearn/approvals";
  if (route.key === "revenue-plans") return "/scholarlearn/revenue-plans";
  if (route.key === "analytics") return "/scholarlearn/analytics";
  if (route.key === "settings") return "/scholarlearn/settings";
  if (route.key === "history") return "/scholarlearn/history";
  return "/scholarlearn/dashboard";
}
