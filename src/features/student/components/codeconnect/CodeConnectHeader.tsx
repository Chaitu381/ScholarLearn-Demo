import { ArrowLeft, GraduationCap, Network, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
import type {
  CodeConnectNotification,
  PracticeCategory,
} from "../../types/codeconnect.types";
import {
  CodeConnectNotificationBanner,
  CodeConnectNotificationBell,
  useCodeConnectNotifications,
} from "./shared/CodeConnectNotifications";

type CodeConnectHeaderProps =
  | {
      headerAction?: ReactNode;
      onReturnToStudentDashboard: () => void;
      onOpenScheduledTest?: (testId: string) => void;
      practiceXp: number;
      streakDays: number;
      variant: "dashboard";
    }
  | {
      activePracticeMode: PracticeCategory;
      backAriaLabel?: string;
      backLabel?: string;
      headerAction?: ReactNode;
      onBackToHub: () => void;
      onOpenScheduledTest?: (testId: string) => void;
      practiceXp: number;
      streakDays: number;
      variant?: "module";
    };

type HeaderRightProps = {
  forceOpenNotificationsKey?: number;
  headerAction?: ReactNode;
  notifications: CodeConnectNotification[];
  onAcceptFriendRequest: (requestId: string) => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onEnableNotificationSound: () => void;
  onOpenScheduledTest?: (testId: string) => void;
  practiceXp: number;
  soundStatus: "idle" | "enabled" | "blocked";
  streakDays: number;
};

const modeTitles: Record<PracticeCategory, string> = {
  coding: "Coding Practice",
  aptitude: "Aptitude Practice",
  reasoning: "Reasoning Practice",
  verbal: "Verbal Practice",
};

function StickyCodeConnectHeader({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-0 z-50 bg-surface shadow-header">
      {children}
    </div>
  );
}

function reloadCurrentPage() {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

export function CodeConnectHeader({
  practiceXp,
  streakDays,
  ...props
}: CodeConnectHeaderProps) {
  const [forceOpenNotificationsKey, setForceOpenNotificationsKey] = useState(0);

  const {
    acceptFriendRequest,
    declineFriendRequest,
    enableNotificationSound,
    notifications,
    pendingFriendRequestCount,
    primaryNotification,
    soundStatus,
  } = useCodeConnectNotifications();

  const headerRight = (
    <HeaderRight
      forceOpenNotificationsKey={forceOpenNotificationsKey}
      headerAction={props.headerAction}
      notifications={notifications}
      onAcceptFriendRequest={acceptFriendRequest}
      onDeclineFriendRequest={declineFriendRequest}
      onEnableNotificationSound={enableNotificationSound}
      onOpenScheduledTest={props.onOpenScheduledTest}
      practiceXp={practiceXp}
      soundStatus={soundStatus}
      streakDays={streakDays}
    />
  );

  if (props.variant === "dashboard") {
    return (
      <StickyCodeConnectHeader>
        <header className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-3 border-b border-border bg-surface px-4 sm:px-5 lg:min-h-[72px] lg:grid-cols-[28%_1fr_28%]">
          <button
            type="button"
            className="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-2 py-1 text-left transition hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary/30"
            onClick={reloadCurrentPage}
            aria-label="Reload current CodeConnect page"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-white">
              <Network aria-hidden="true" size={21} strokeWidth={2.5} />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[16px] font-extrabold text-text-primary">
                CodeConnect
              </span>
              <span className="hidden text-[12px] font-bold text-text-secondary sm:block">
                Practice dashboard
              </span>
            </span>
          </button>

          <button
            type="button"
            className="order-3 col-span-2 mx-auto inline-flex min-w-0 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-border bg-surface px-3 py-1.5 text-center shadow-sm transition hover:border-blue hover:bg-blue-soft hover:text-blue focus:outline-none focus:ring-2 focus:ring-blue/25 lg:order-none lg:col-span-1"
            onClick={() => props.onReturnToStudentDashboard()}
            aria-label="Return to ScholarLearn Student Dashboard"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue">
              <GraduationCap aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[15px] font-extrabold text-text-primary">
                ScholarLearn
              </span>
              <span className="hidden text-[11px] font-bold text-text-secondary sm:block">
                Student Dashboard
              </span>
            </span>
          </button>

          {headerRight}
        </header>

        <CodeConnectNotificationBanner
          notification={primaryNotification}
          onOpenPanel={() =>
            setForceOpenNotificationsKey((currentKey) => currentKey + 1)
          }
          onOpenScheduledTest={props.onOpenScheduledTest}
          pendingFriendRequestCount={pendingFriendRequestCount}
        />
      </StickyCodeConnectHeader>
    );
  }

  const {
    activePracticeMode,
    backAriaLabel = "Back to CodeConnect Dashboard",
    backLabel = "Back to dashboard",
    onBackToHub,
  } = props;

  return (
    <StickyCodeConnectHeader>
      <header className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-3 border-b border-border bg-surface px-4 py-2 sm:px-5 lg:min-h-[72px] lg:grid-cols-[28%_1fr_28%]">
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 rounded-2xl text-left transition hover:bg-surface-soft"
          onClick={onBackToHub}
          aria-label={backAriaLabel}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-white">
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.5} />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-[16px] font-extrabold text-text-primary">
              CodeConnect
            </span>
            <span className="hidden text-[12px] font-bold text-text-secondary sm:block">
              {backLabel}
            </span>
          </span>
        </button>

        <div className="hidden min-w-0 text-center lg:block">
          <h1 className="truncate text-[20px] font-extrabold text-text-primary">
            {modeTitles[activePracticeMode]}
          </h1>
        </div>

        {headerRight}

        <div className="col-span-2 min-w-0 pb-2 text-center lg:hidden">
          <h1 className="truncate text-[18px] font-extrabold text-text-primary">
            {modeTitles[activePracticeMode]}
          </h1>
        </div>
      </header>

      <CodeConnectNotificationBanner
        notification={primaryNotification}
        onOpenPanel={() =>
          setForceOpenNotificationsKey((currentKey) => currentKey + 1)
        }
        onOpenScheduledTest={props.onOpenScheduledTest}
        pendingFriendRequestCount={pendingFriendRequestCount}
      />
    </StickyCodeConnectHeader>
  );
}

function HeaderRight({
  forceOpenNotificationsKey,
  headerAction,
  notifications,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onEnableNotificationSound,
  onOpenScheduledTest,
  practiceXp,
  soundStatus,
  streakDays,
}: HeaderRightProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {headerAction ? (
        <div className="hidden items-center sm:flex">{headerAction}</div>
      ) : null}

      <StatPill label="Streak" value={`${streakDays}d`} />

      <StatPill label="XP" value={practiceXp.toLocaleString()} icon />

      <CodeConnectNotificationBell
        forceOpenKey={forceOpenNotificationsKey}
        notifications={notifications}
        onAcceptFriendRequest={onAcceptFriendRequest}
        onDeclineFriendRequest={onDeclineFriendRequest}
        onEnableNotificationSound={onEnableNotificationSound}
        onOpenScheduledTest={onOpenScheduledTest}
        soundStatus={soundStatus}
      />

      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-soft text-[13px] font-extrabold text-blue">
        C
      </span>
    </div>
  );
}

function StatPill({
  icon = false,
  label,
  value,
}: {
  icon?: boolean;
  label: string;
  value: string;
}) {
  return (
    <span className="hidden h-10 items-center gap-2 rounded-2xl bg-surface-soft px-3 text-[12px] font-extrabold text-text-secondary sm:inline-flex">
      {icon ? (
        <Zap
          aria-hidden="true"
          size={14}
          strokeWidth={2.5}
          className="text-orange"
        />
      ) : null}

      <span>{label}</span>
      <strong className="text-text-primary">{value}</strong>
    </span>
  );
}