import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardCheck,
  GraduationCap,
  History,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { logoutScholarLearnSession } from "../../../lib/logoutSession";

const scholarLearnNavItems: Array<{ icon: LucideIcon; label: string; path: string }> = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/scholarlearn/dashboard" },
  { icon: Building2, label: "Institutes", path: "/scholarlearn/institutes" },
  { icon: IndianRupee, label: "Revenue / Plans", path: "/scholarlearn/revenue-plans" },
  { icon: BarChart3, label: "Analysis", path: "/scholarlearn/analytics" },
  { icon: ClipboardCheck, label: "Approvals", path: "/scholarlearn/approvals" },
];

function reloadCurrentPage() {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

export function ScholarLearnHeader({
  activePath = "/scholarlearn/dashboard",
  hasPendingApprovalNotifications = false,
  notificationDialog,
}: {
  activePath?: string;
  hasPendingApprovalNotifications?: boolean;
  notificationDialog?: ReactNode | ((onClose: () => void) => ReactNode);
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [shortcutMenuOpen, setShortcutMenuOpen] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const shortcutMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen && !profileMenuOpen && !shortcutMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (notificationsOpen && !notificationMenuRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileMenuOpen && !profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (shortcutMenuOpen && !shortcutMenuRef.current?.contains(event.target as Node)) {
        setShortcutMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileMenuOpen(false);
        setShortcutMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen, profileMenuOpen, shortcutMenuOpen]);

  const handleProfileMenuSelect = (path: string) => {
    setProfileMenuOpen(false);
    navigateToScholarLearnPath(path);
  };

  const handleShortcutSelect = (path: string) => {
    setShortcutMenuOpen(false);
    navigateToScholarLearnPath(path);
  };

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-header">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:min-h-20 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <button
          type="button"
          className="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-2 py-1 text-left transition hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary/30"
          onClick={reloadCurrentPage}
          aria-label="Reload current ScholarLearn platform page"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-white">
            <GraduationCap aria-hidden="true" size={22} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-extrabold text-text-primary">ScholarLearn</p>
            <p className="hidden truncate text-[12px] font-semibold text-text-secondary sm:block">Platform Owner</p>
          </div>
        </button>

        <nav
          aria-label="ScholarLearn platform navigation"
          className="scrollbar-none hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto xl:flex"
        >
          {scholarLearnNavItems.map((item) => (
            <ScholarLearnNavButton
              key={item.path}
              active={activePath === item.path}
              icon={item.icon}
              label={item.label}
              onClick={() => navigateToScholarLearnPath(item.path)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div ref={shortcutMenuRef} className="relative xl:hidden">
            <button
              type="button"
              className={`inline-flex h-10 items-center gap-2 rounded-lg border bg-surface px-3 text-[13px] font-extrabold transition ${
                shortcutMenuOpen
                  ? "border-primary text-primary"
                  : "border-border text-text-secondary hover:border-primary hover:text-primary"
              }`}
              aria-expanded={shortcutMenuOpen}
              aria-label="Open ScholarLearn shortcuts"
              onClick={() => setShortcutMenuOpen((open) => !open)}
            >
              <Menu aria-hidden="true" size={18} strokeWidth={2.4} />
              Menu
            </button>
            {shortcutMenuOpen ? (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-3xl border border-border bg-surface p-2 shadow-card">
                {scholarLearnNavItems.map((item) => (
                  <ScholarLearnShortcutMenuButton
                    key={item.path}
                    active={activePath === item.path}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => handleShortcutSelect(item.path)}
                  />
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="hidden h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-text-secondary transition hover:border-primary hover:text-primary sm:grid"
            aria-label="Search platform records"
          >
            <Search aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
          <div ref={notificationMenuRef} className="relative">
            <button
              type="button"
              className={`relative grid h-10 w-10 place-items-center rounded-lg border bg-surface transition ${
                notificationsOpen ? "border-primary text-primary" : "border-border text-text-secondary hover:border-primary hover:text-primary"
              }`}
              aria-label="Platform notifications"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell aria-hidden="true" size={18} strokeWidth={2.4} />
              {hasPendingApprovalNotifications ? (
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-red" />
              ) : null}
            </button>
            {notificationsOpen ? renderNotificationDialog(notificationDialog, () => setNotificationsOpen(false)) : null}
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
              aria-label="Open ScholarLearn profile menu"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              SL
            </button>

            {profileMenuOpen ? (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-3xl border border-border bg-surface p-2 shadow-card">
                <ScholarLearnProfileMenuButton
                  icon={UserRound}
                  label="Profile"
                  onClick={() => handleProfileMenuSelect("/scholarlearn/profile")}
                />
                <ScholarLearnProfileMenuButton
                  icon={History}
                  label="History"
                  onClick={() => handleProfileMenuSelect("/scholarlearn/history")}
                />
                <ScholarLearnProfileMenuButton
                  icon={ClipboardCheck}
                  label="Approval"
                  onClick={() => handleProfileMenuSelect("/scholarlearn/approvals")}
                />
                <ScholarLearnProfileMenuButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => handleProfileMenuSelect("/scholarlearn/settings")}
                />
                <ScholarLearnProfileMenuButton
                  icon={LogOut}
                  label="Logout"
                  onClick={logoutScholarLearnSession}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function renderNotificationDialog(
  notificationDialog: ReactNode | ((onClose: () => void) => ReactNode) | undefined,
  onClose: () => void,
) {
  if (typeof notificationDialog === "function") {
    return notificationDialog(onClose);
  }

  return notificationDialog ?? <ScholarLearnNotificationDialog />;
}

function ScholarLearnNavButton({
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

function ScholarLearnProfileMenuButton({
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

function ScholarLearnShortcutMenuButton({
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
          ? "flex h-11 w-full items-center gap-3 rounded-2xl bg-primary-soft px-3 text-left text-[13px] font-extrabold text-primary-dark"
          : "flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-[13px] font-extrabold text-text-secondary transition hover:bg-primary-soft hover:text-primary-dark"
      }
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function ScholarLearnNotificationDialog() {
  return (
    <div className="absolute right-14 top-12 z-50 w-[320px] rounded-3xl border border-border bg-surface p-4 shadow-card">
      <p className="text-[15px] font-extrabold text-text-primary">Platform notifications</p>
      <div className="mt-3 space-y-2">
        <NotificationItem title="7 Founder approvals pending" meta="Review account access requests" />
        <NotificationItem title="1 institute expires soon" meta="Fengari Pune has 41 days remaining" />
      </div>
    </div>
  );
}

function NotificationItem({ meta, title }: { meta: string; title: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-3">
      <p className="text-[13px] font-extrabold text-text-primary">{title}</p>
      <p className="mt-1 text-[12px] font-semibold text-text-secondary">{meta}</p>
    </article>
  );
}

function navigateToScholarLearnPath(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
