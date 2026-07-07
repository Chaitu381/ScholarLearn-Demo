import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Search,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";
import { getLecturerRouteFeature, useInstituteFeatureAccess } from "../../../shared/feature-flags/InstituteFeatureAccess";
import { cn } from "../../../shared/utils/cn";
import type { LecturerNavItem, LecturerRouteKey } from "../types/lecturer.types";

type LecturerHeaderProps = {
  activeRouteKey: LecturerRouteKey;
  onNavigate: (path: string) => void;
};

const mainLecturerNavigation: LecturerNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/lecturer/dashboard", routeKey: "dashboard" },
  { icon: UsersRound, label: "Batches", path: "/lecturer/batches", routeKey: "batches" },
  { icon: ClipboardList, label: "Tests", path: "/lecturer/tests", routeKey: "tests" },
  { icon: FileText, label: "Assignments", path: "/lecturer/assignments", routeKey: "assignments" },
];

export function LecturerHeader({ activeRouteKey, onNavigate }: LecturerHeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { isFeatureEnabled } = useInstituteFeatureAccess();
  const visibleNavigation = mainLecturerNavigation.filter((item) => {
    const featureName = getLecturerRouteFeature(item.routeKey);
    return !featureName || isFeatureEnabled(featureName);
  });

  useEffect(() => {
    if (!profileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  const handleProfileMenuSelect = (path: string) => {
    onNavigate(path);
    setProfileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-header">
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto] items-center gap-3 px-4 md:h-[76px] md:grid-cols-[24%_minmax(0,1fr)_auto] md:px-6 lg:h-20 lg:px-8">
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 text-left"
          aria-label="Lecturer dashboard home"
          onClick={() => onNavigate("/lecturer/dashboard")}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-white">
            <GraduationCap aria-hidden="true" size={22} strokeWidth={2.5} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-extrabold leading-tight text-text-primary lg:text-[17px]">
              ScholarLearn Lecturer
            </span>
            <span className="hidden truncate text-[12px] font-semibold text-text-secondary sm:block">
              Teaching Workspace
            </span>
          </span>
        </button>

        <nav
          aria-label="Lecturer workspace pages"
          className="scrollbar-none hidden min-w-0 items-center gap-2 overflow-x-auto md:flex"
        >
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = isMainNavItemActive(activeRouteKey, item.routeKey);

            return (
              <button
                key={item.path}
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-bold transition lg:px-4",
                  isActive
                    ? "bg-primary-soft text-primary-dark"
                    : "text-text-secondary hover:bg-surface-soft hover:text-text-primary",
                )}
                onClick={() => onNavigate(item.path)}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-text-secondary transition hover:border-primary hover:text-primary sm:grid"
            title="Search"
          >
            <Search aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-text-secondary transition hover:border-primary hover:text-primary"
            title="Notifications"
          >
            <Bell aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              aria-label="Open lecturer profile menu"
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold transition",
                activeRouteKey === "profile" || activeRouteKey === "settings" || profileMenuOpen
                  ? "bg-blue text-white"
                  : "bg-blue-soft text-blue hover:bg-blue hover:text-white",
              )}
              title="Profile menu"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              L
            </button>

            {profileMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-border bg-surface p-2 shadow-card"
              >
                <ProfileMenuButton
                  icon={UserRound}
                  label="Profile"
                  onClick={() => handleProfileMenuSelect("/lecturer/profile")}
                />
                <ProfileMenuButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => handleProfileMenuSelect("/lecturer/settings")}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <nav
        aria-label="Lecturer mobile pages"
        className="scrollbar-none flex gap-2 overflow-x-auto border-t border-border bg-surface px-4 py-2 md:hidden"
      >
        <div className="flex shrink-0 gap-2">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = isMainNavItemActive(activeRouteKey, item.routeKey);

          return (
            <button
              key={item.path}
              type="button"
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-bold transition",
                isActive
                  ? "bg-primary-soft text-primary-dark"
                  : "text-text-secondary hover:bg-surface-soft hover:text-text-primary",
              )}
              onClick={() => onNavigate(item.path)}
            >
              <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
        </div>
      </nav>

    </header>
  );
}

function ProfileMenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof UserRound;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-extrabold text-text-primary transition hover:bg-primary-soft hover:text-primary-dark"
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function isMainNavItemActive(activeRouteKey: LecturerRouteKey, routeKey: LecturerRouteKey) {
  if (routeKey === "batches") {
    return activeRouteKey === "batches" || activeRouteKey === "batch-detail" || activeRouteKey === "student-profile";
  }

  if (routeKey === "tests") {
    return activeRouteKey === "tests" || activeRouteKey === "create-test" || activeRouteKey === "test-detail";
  }

  if (routeKey === "assignments") {
    return activeRouteKey === "assignments" || activeRouteKey === "create-assignment";
  }

  return activeRouteKey === routeKey;
}
