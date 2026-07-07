import type { LecturerRoute, LecturerRouteKey } from "../types/lecturer.types";

const lecturerRoutePatterns: Array<{
  key: LecturerRouteKey;
  match: RegExp;
}> = [
  { key: "dashboard", match: /^\/lecturer\/dashboard\/?$/ },
  { key: "profile", match: /^\/lecturer\/profile\/?$/ },
  { key: "settings", match: /^\/lecturer\/settings\/?$/ },
  { key: "batches", match: /^\/lecturer\/batches\/?$/ },
  { key: "batch-detail", match: /^\/lecturer\/batches\/([^/]+)\/?$/ },
  { key: "student-profile", match: /^\/lecturer\/batches\/([^/]+)\/students\/([^/]+)\/?$/ },
  { key: "tests", match: /^\/lecturer\/tests\/?$/ },
  { key: "create-test", match: /^\/lecturer\/tests\/create\/?$/ },
  { key: "test-detail", match: /^\/lecturer\/tests\/([^/]+)\/?$/ },
  { key: "assignments", match: /^\/lecturer\/assignments\/?$/ },
  { key: "create-assignment", match: /^\/lecturer\/assignments\/create\/?$/ },
];

export function isLecturerPath(pathname: string) {
  return pathname === "/lecturer" || pathname.startsWith("/lecturer/");
}

export function resolveLecturerRoute(pathname: string): LecturerRoute {
  if (pathname === "/lecturer") {
    return { key: "dashboard", params: {} };
  }

  for (const routePattern of lecturerRoutePatterns) {
    const match = pathname.match(routePattern.match);

    if (match) {
      if (routePattern.key === "batch-detail") {
        return { key: routePattern.key, params: { batchId: match[1] } };
      }

      if (routePattern.key === "student-profile") {
        return { key: routePattern.key, params: { batchId: match[1], studentId: match[2] } };
      }

      if (routePattern.key === "test-detail") {
        return { key: routePattern.key, params: { testId: match[1] } };
      }

      return { key: routePattern.key, params: {} };
    }
  }

  return { key: "dashboard", params: {} };
}
