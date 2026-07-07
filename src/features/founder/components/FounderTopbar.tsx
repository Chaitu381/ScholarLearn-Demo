import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpenCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  Search,
  Settings,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type FounderLectureNavMode = "assignments" | "batches" | "dashboard" | "tests";

export function FounderTopbar({
  activePath = "/founder/dashboard",
  hasPendingApprovalNotifications = false,
  notificationDialog,
  onOpenNotifications,
  notificationsOpen = false,
  selectedLectureMode,
  selectedLecturerId,
}: {
  activePath?: string;
  hasPendingApprovalNotifications?: boolean;
  notificationDialog?: ReactNode;
  notificationsOpen?: boolean;
  onOpenNotifications?: () => void;
  selectedLectureMode?: FounderLectureNavMode;
  selectedLecturerId?: string;
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const isLectureWorkspace = Boolean(selectedLecturerId && selectedLectureMode);

  useEffect(() => {
    if (!profileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  const handleProfileMenuSelect = (path: string) => {
    setProfileMenuOpen(false);
    navigateToFounderPath(path);
  };

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-header">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:min-h-20 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-white">
            <GraduationCap aria-hidden="true" size={22} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-extrabold text-text-primary">ScholarLearn Founder</p>
            <p className="hidden truncate text-[12px] font-semibold text-text-secondary sm:block">Institute Dashboard</p>
          </div>
        </div>

        <nav
          aria-label="Founder primary navigation"
          className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto lg:w-auto"
        >
          {isLectureWorkspace ? (
            <>
              <FounderNavButton
                active={activePath === "/founder/dashboard"}
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => navigateToFounderPath("/founder/dashboard")}
              />
              <div className="flex shrink-0 items-center gap-2">
                <span className="px-2 text-[13px] font-bold text-text-secondary">Lecture</span>
                <FounderNavButton
                  active={selectedLectureMode === "dashboard"}
                  icon={LayoutDashboard}
                  label="Dashboard"
                  onClick={() => navigateToFounderPath(getFounderLecturePath(selectedLecturerId, "dashboard"))}
                />
                <FounderNavButton
                  active={selectedLectureMode === "batches"}
                  icon={UsersRound}
                  label="Batches"
                  onClick={() => navigateToFounderPath(getFounderLecturePath(selectedLecturerId, "batches"))}
                />
                <FounderNavButton
                  active={selectedLectureMode === "tests"}
                  icon={ClipboardList}
                  label="Tests"
                  onClick={() => navigateToFounderPath(getFounderLecturePath(selectedLecturerId, "tests"))}
                />
                <FounderNavButton
                  active={selectedLectureMode === "assignments"}
                  icon={FileText}
                  label="Assignments"
                  onClick={() => navigateToFounderPath(getFounderLecturePath(selectedLecturerId, "assignments"))}
                />
              </div>
            </>
          ) : (
            <>
              <FounderNavButton
                active={activePath === "/founder/dashboard"}
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => navigateToFounderPath("/founder/dashboard")}
              />
              <FounderNavButton
                active={activePath === "/founder/lectures"}
                icon={BookOpenCheck}
                label="Lectures"
                onClick={() => navigateToFounderPath("/founder/lectures")}
              />
              <FounderNavButton
                active={activePath === "/founder/batches"}
                icon={UsersRound}
                label="Batches"
                onClick={() => navigateToFounderPath("/founder/batches")}
              />
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-text-secondary transition hover:border-primary hover:text-primary sm:grid"
            aria-label="Search"
          >
            <Search aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
          <div className="relative">
            <button
              type="button"
              className={`relative grid h-10 w-10 place-items-center rounded-lg border bg-surface transition ${
                notificationsOpen ? "border-primary text-primary" : "border-border text-text-secondary hover:border-primary hover:text-primary"
              }`}
              aria-expanded={notificationsOpen}
              aria-label="Notifications"
              onClick={onOpenNotifications}
            >
              <Bell aria-hidden="true" size={18} strokeWidth={2.4} />
              {hasPendingApprovalNotifications ? (
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-red" />
              ) : null}
            </button>
            {notificationDialog}
          </div>
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold transition ${
                profileMenuOpen
                  ? "bg-primary-soft text-primary-dark ring-2 ring-primary-soft"
                  : "bg-blue-soft text-blue hover:bg-primary-soft hover:text-primary-dark"
              }`}
              aria-expanded={profileMenuOpen}
              aria-label="Open Founder profile menu"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              F
            </button>

            {profileMenuOpen ? (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-3xl border border-border bg-surface p-2 shadow-card">
                <FounderProfileMenuButton
                  icon={UserRound}
                  label="Profile"
                  onClick={() => handleProfileMenuSelect("/founder/profile")}
                />
                <FounderProfileMenuButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => handleProfileMenuSelect("/founder/settings")}
                />
                <FounderProfileMenuButton
                  icon={History}
                  label="History"
                  onClick={() => handleProfileMenuSelect("/founder/history")}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function FounderNavButton({
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
          ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary-soft px-4 text-[13px] font-bold text-primary-dark"
          : "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-[13px] font-bold text-text-secondary transition hover:bg-surface-soft hover:text-text-primary"
      }
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function FounderProfileMenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-[13px] font-extrabold text-text-secondary transition hover:bg-primary-soft hover:text-primary-dark"
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function navigateToFounderPath(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function getFounderLecturePath(lecturerId: string | undefined, mode: FounderLectureNavMode) {
  return `/founder/lectures/${encodeURIComponent(lecturerId ?? "")}/${mode}`;
}
