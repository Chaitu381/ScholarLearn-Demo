import { useEffect, useRef, useState } from "react";
import { Bell, CalendarClock, Clock, GraduationCap, PlayCircle, Search, Settings, UserRound } from "lucide-react";
import { useStudentNavigation } from "../../../app/providers/StudentNavigationProvider";
import {
  scholarLearnHeaderTestNotifications,
  type ScholarLearnHeaderTestNotification,
} from "../../../features/student/data/scholarLearnHeaderNotifications";
import { cn } from "../../utils/cn";
import { MobileTopTabs } from "./MobileTopTabs";

const notificationStatusStyles: Record<
  ScholarLearnHeaderTestNotification["status"],
  { className: string; label: string }
> = {
  live: {
    className: "bg-red-soft text-red",
    label: "Live Now",
  },
  "starts-soon": {
    className: "bg-orange-soft text-orange",
    label: "Starts Soon",
  },
  upcoming: {
    className: "bg-blue-soft text-blue",
    label: "Upcoming",
  },
};

function reloadCurrentPage() {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

export function TopHeader() {
  const { activePageKey, pages, setActivePage } = useStudentNavigation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigationPages = pages.filter((page) => page.showInNavigation !== false);
  const notificationCount = scholarLearnHeaderTestNotifications.length;

  useEffect(() => {
    if (!notificationsOpen && !profileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (notificationsOpen && !notificationMenuRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen, profileMenuOpen]);

  const handleProfileMenuSelect = (pageKey: "profile" | "settings") => {
    setActivePage(pageKey);
    setProfileMenuOpen(false);
  };

  const handleOpenNotification = (notification: ScholarLearnHeaderTestNotification) => {
    setActivePage(notification.targetPage);
    setNotificationsOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-header">
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto] items-center gap-3 px-4 md:h-[76px] md:grid-cols-[18%_minmax(0,1fr)_auto] md:px-6 lg:h-20 lg:px-8">
        <button
          type="button"
          className="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-2 py-1 text-left transition hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Reload current ScholarLearn page"
          onClick={reloadCurrentPage}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-white">
            <GraduationCap aria-hidden="true" size={22} strokeWidth={2.5} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-extrabold leading-tight text-text-primary lg:text-[17px]">
              Student Tracker
            </span>
            <span className="hidden truncate text-[12px] font-semibold text-text-secondary sm:block">
              Java Full Stack
            </span>
          </span>
        </button>

        <nav
          aria-label="Primary student pages"
          className="scrollbar-none hidden min-w-0 items-center gap-2 overflow-x-auto md:flex"
        >
          {navigationPages.map((page) => {
            const Icon = page.icon;
            const isActive = page.key === activePageKey;

            return (
              <button
                key={page.key}
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-bold transition lg:px-4",
                  isActive
                    ? "bg-primary-soft text-primary-dark"
                    : "text-text-secondary hover:bg-surface-soft hover:text-text-primary",
                )}
                onClick={() => setActivePage(page.key)}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
                <span className="whitespace-nowrap">{page.label}</span>
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
          <div ref={notificationMenuRef} className="relative">
            <button
              type="button"
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              aria-label={`Notifications: ${notificationCount}`}
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-lg border bg-surface transition",
                notificationsOpen
                  ? "border-primary text-primary"
                  : "border-border text-text-secondary hover:border-primary hover:text-primary",
              )}
              title="Notifications"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell aria-hidden="true" size={18} strokeWidth={2.4} />
              {notificationCount ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full border-2 border-surface bg-red px-1 text-[10px] font-extrabold leading-none text-white">
                  {notificationCount}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <ScholarLearnNotificationPanel
                notifications={scholarLearnHeaderTestNotifications}
                onClose={() => setNotificationsOpen(false)}
                onOpenNotification={handleOpenNotification}
              />
            ) : null}
          </div>
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              aria-label="Open profile menu"
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold transition",
                activePageKey === "profile" || activePageKey === "settings" || profileMenuOpen
                  ? "bg-blue text-white"
                  : "bg-blue-soft text-blue hover:bg-blue hover:text-white",
              )}
              title="Profile menu"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              C
            </button>

            {profileMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-border bg-surface p-2 shadow-card"
              >
                <ProfileMenuButton
                  icon={UserRound}
                  label="Profile"
                  onClick={() => handleProfileMenuSelect("profile")}
                />
                <ProfileMenuButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => handleProfileMenuSelect("settings")}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <MobileTopTabs />
    </header>
  );
}

function ScholarLearnNotificationPanel({
  notifications,
  onClose,
  onOpenNotification,
}: {
  notifications: ScholarLearnHeaderTestNotification[];
  onClose: () => void;
  onOpenNotification: (notification: ScholarLearnHeaderTestNotification) => void;
}) {
  return (
    <section
      className="fixed left-2 right-2 top-16 z-50 rounded-3xl border border-border bg-surface p-3 shadow-card sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(22rem,calc(100vw-1rem))]"
      role="dialog"
      aria-label="ScholarLearn test notifications"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
            <Bell aria-hidden="true" size={18} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-extrabold text-text-primary">Notifications</h2>
            <p className="truncate text-[12px] font-bold text-text-secondary">Upcoming tests and practice</p>
          </div>
        </div>
        <button
          type="button"
          className="h-8 shrink-0 rounded-xl border border-border bg-surface px-3 text-[12px] font-extrabold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
        {notifications.length ? (
          notifications.map((notification) => (
            <ScholarLearnNotificationCard
              key={notification.id}
              notification={notification}
              onOpenNotification={onOpenNotification}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-surface-soft p-3 text-center">
            <p className="text-[13px] font-extrabold text-text-primary">No test notifications</p>
            <p className="mt-1 text-[12px] font-semibold text-text-secondary">You are all caught up.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ScholarLearnNotificationCard({
  notification,
  onOpenNotification,
}: {
  notification: ScholarLearnHeaderTestNotification;
  onOpenNotification: (notification: ScholarLearnHeaderTestNotification) => void;
}) {
  const statusStyle = notificationStatusStyles[notification.status];

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-2.5">
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
            getTestTypeIconClassName(notification.testType),
          )}
        >
          <CalendarClock aria-hidden="true" size={15} strokeWidth={2.5} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-extrabold text-text-secondary">
              {notification.testType}
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold", statusStyle.className)}>
              {statusStyle.label}
            </span>
          </div>

          <h3 className="mt-1.5 truncate text-[13px] font-extrabold leading-5 text-text-primary">
            {notification.testName}
          </h3>

          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1 text-[11px] font-bold text-text-secondary">
              <Clock aria-hidden="true" className="shrink-0" size={12} strokeWidth={2.5} />
              <span className="truncate">{notification.startTime}</span>
            </span>

            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-2.5 text-[11px] font-extrabold text-white transition hover:bg-primary-dark"
              onClick={() => onOpenNotification(notification)}
            >
              <PlayCircle aria-hidden="true" size={13} strokeWidth={2.5} />
              Open Test
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function getTestTypeIconClassName(testType: ScholarLearnHeaderTestNotification["testType"]) {
  if (testType === "Coding") {
    return "bg-blue-soft text-blue";
  }

  if (testType === "Final") {
    return "bg-red-soft text-red";
  }

  if (testType === "Monthly") {
    return "bg-orange-soft text-orange";
  }

  return "bg-primary-soft text-primary-dark";
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
