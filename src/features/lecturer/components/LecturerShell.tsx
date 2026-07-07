import type { PropsWithChildren } from "react";
import { isLecturerPath } from "../routes/lecturerRoutes";
import type { LecturerRouteKey } from "../types/lecturer.types";
import { LecturerHeader } from "./LecturerHeader";
import "../lecturerTheme.css";

type LecturerShellProps = PropsWithChildren<{
  activeRouteKey: LecturerRouteKey;
}>;

const lecturerDashboardPath = "/lecturer/dashboard";
const lecturerNavigationStack: string[] = [];
const maxLecturerNavigationStackItems = 40;

export function LecturerShell({ activeRouteKey, children }: LecturerShellProps) {
  return (
    <div className="lecturer-light-theme min-h-screen bg-background text-text-primary">
      <LecturerHeader activeRouteKey={activeRouteKey} onNavigate={navigateToLecturerPath} />
      <main className="mx-auto min-h-[calc(100vh-80px)] max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function navigateToLecturerPath(path: string) {
  const currentPath = getCurrentPath();
  const nextPath = path || lecturerDashboardPath;

  if (currentPath === nextPath) {
    return;
  }

  if (isLecturerNavigationPath(currentPath)) {
    lecturerNavigationStack.push(currentPath);
    if (lecturerNavigationStack.length > maxLecturerNavigationStackItems) {
      lecturerNavigationStack.shift();
    }
  }

  window.history.pushState({}, "", nextPath);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function navigateBackInLecturer(fallbackPath = lecturerDashboardPath) {
  const currentPath = getCurrentPath();

  while (lecturerNavigationStack.length) {
    const previousPath = lecturerNavigationStack.pop();

    if (previousPath && previousPath !== currentPath && isLecturerNavigationPath(previousPath)) {
      window.history.pushState({}, "", previousPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }
  }

  const nextPath = fallbackPath || lecturerDashboardPath;
  if (currentPath === nextPath) {
    return;
  }

  window.history.pushState({}, "", nextPath);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function isLecturerNavigationPath(path: string) {
  const pathname = new URL(path, window.location.origin).pathname;
  return isLecturerPath(pathname);
}
