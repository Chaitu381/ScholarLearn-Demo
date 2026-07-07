export type FounderRouteKey =
  | "batch-details"
  | "batches"
  | "dashboard"
  | "history"
  | "lecture-assignments"
  | "lecture-batches"
  | "lecture-dashboard"
  | "lecture-tests"
  | "lectures"
  | "profile"
  | "settings";

export type FounderRoute = {
  key: FounderRouteKey;
  params: {
    batchId?: string;
    lecturerId?: string;
  };
};

const founderRoutePatterns: Array<{
  key: FounderRouteKey;
  match: RegExp;
}> = [
  { key: "dashboard", match: /^\/founder\/dashboard\/?$/ },
  { key: "lectures", match: /^\/founder\/lectures\/?$/ },
  { key: "lecture-dashboard", match: /^\/founder\/lectures\/([^/]+)\/dashboard\/?$/ },
  { key: "lecture-batches", match: /^\/founder\/lectures\/([^/]+)\/batches\/?$/ },
  { key: "lecture-tests", match: /^\/founder\/lectures\/([^/]+)\/tests\/?$/ },
  { key: "lecture-assignments", match: /^\/founder\/lectures\/([^/]+)\/assignments\/?$/ },
  { key: "batches", match: /^\/founder\/batches\/?$/ },
  { key: "batch-details", match: /^\/founder\/batches\/([^/]+)\/?$/ },
  { key: "history", match: /^\/founder\/history\/?$/ },
  { key: "profile", match: /^\/founder\/profile\/?$/ },
  { key: "settings", match: /^\/founder\/settings\/?$/ },
];

export function isFounderPath(pathname: string) {
  return pathname === "/founder" || pathname.startsWith("/founder/");
}

export function resolveFounderRoute(pathname: string): FounderRoute {
  if (pathname === "/founder") {
    return { key: "dashboard", params: {} };
  }

  for (const routePattern of founderRoutePatterns) {
    const match = pathname.match(routePattern.match);

    if (match) {
      if (routePattern.key === "batch-details") {
        return { key: routePattern.key, params: { batchId: match[1] } };
      }

      if (isLectureWorkspaceRouteKey(routePattern.key)) {
        return { key: routePattern.key, params: { lecturerId: match[1] } };
      }

      return { key: routePattern.key, params: {} };
    }
  }

  return { key: "dashboard", params: {} };
}

function isLectureWorkspaceRouteKey(key: FounderRouteKey) {
  return key === "lecture-dashboard" || key === "lecture-batches" || key === "lecture-tests" || key === "lecture-assignments";
}
