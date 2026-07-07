import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  Check,
  Clock,
  UserPlus,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "../../../../../shared/utils/cn";
import {
  readCodeConnectFriendRequests,
  writeCodeConnectFriendRequests,
} from "../../../data/codeconnectFriendRequests";
import { codeconnectScheduledTests } from "../../../data/codeconnectScheduledTests";
import type {
  CodeConnectFriendRequest,
  CodeConnectNotification,
  CodeConnectScheduledTest,
} from "../../../types/codeconnect.types";

type SoundStatus = "idle" | "enabled" | "blocked";
type TestNotificationState = "active" | "upcoming";

const lastSoundStorageKey = "codeconnect_last_sound_notification";

let notificationAudioContext: AudioContext | null = null;

export function useCodeConnectNotifications() {
  const [friendRequests, setFriendRequests] = useState<
    CodeConnectFriendRequest[]
  >(() => readCodeConnectFriendRequests());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { enableNotificationSound, soundStatus } =
    useFriendRequestNotificationSound(friendRequests);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const testNotifications = useMemo(
    () => getScheduledTestNotifications(codeconnectScheduledTests, nowMs),
    [nowMs],
  );
  const friendNotifications = useMemo(
    () =>
      friendRequests
        .filter((request) => request.status === "pending")
        .map(mapFriendRequestToNotification),
    [friendRequests],
  );
  const notifications = useMemo(
    () => [...testNotifications, ...friendNotifications],
    [friendNotifications, testNotifications],
  );
  const primaryNotification = useMemo(
    () => getPrimaryNotification(testNotifications, friendNotifications),
    [friendNotifications, testNotifications],
  );

  const updateFriendRequest = (
    requestId: string,
    status: CodeConnectFriendRequest["status"],
  ) => {
    setFriendRequests((currentRequests) => {
      const nextRequests = currentRequests.map((request) =>
        request.id === requestId ? { ...request, status } : request,
      );

      writeCodeConnectFriendRequests(nextRequests);
      return nextRequests;
    });
  };

  return {
    acceptFriendRequest: (requestId: string) =>
      updateFriendRequest(requestId, "accepted"),
    declineFriendRequest: (requestId: string) =>
      updateFriendRequest(requestId, "declined"),
    enableNotificationSound,
    friendRequests,
    notifications,
    pendingFriendRequestCount: friendNotifications.length,
    primaryNotification,
    soundStatus,
  };
}

export function CodeConnectNotificationBanner({
  notification,
  onOpenPanel,
  onOpenScheduledTest,
  pendingFriendRequestCount,
}: {
  notification?: CodeConnectNotification;
  onOpenPanel: () => void;
  onOpenScheduledTest?: (testId: string) => void;
  pendingFriendRequestCount: number;
}) {
  if (!notification) {
    return null;
  }

  const isTest = notification.type === "test";

  return (
    <section className="border-b border-orange-soft bg-orange-soft/70 px-4 py-3 sm:px-5">
      <button
        type="button"
        className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
        onClick={() => {
          if (isTest && notification.targetId) {
            onOpenScheduledTest?.(notification.targetId);
            return;
          }

          onOpenPanel();
        }}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface text-orange">
            {isTest ? (
              <CalendarClock aria-hidden="true" size={18} strokeWidth={2.5} />
            ) : (
              <UserPlus aria-hidden="true" size={18} strokeWidth={2.5} />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold uppercase text-orange">
              {isTest ? "Scheduled test alert" : "Friend requests"}
            </p>
            <h2 className="mt-0.5 break-words text-[15px] font-extrabold text-text-primary">
              {notification.title}
            </h2>
            <p className="mt-1 text-[13px] font-bold leading-5 text-text-secondary">
              {notification.message}
            </p>
          </div>
        </div>
        <span className="w-fit rounded-2xl bg-surface px-3 py-2 text-[12px] font-extrabold text-text-secondary">
          {isTest
            ? "Open Test"
            : `${pendingFriendRequestCount} pending`}
        </span>
      </button>
    </section>
  );
}

export function CodeConnectNotificationBell({
  forceOpenKey,
  notifications,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onEnableNotificationSound,
  onOpenScheduledTest,
  soundStatus,
}: {
  forceOpenKey?: number;
  notifications: CodeConnectNotification[];
  onAcceptFriendRequest: (requestId: string) => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onEnableNotificationSound: () => void;
  onOpenScheduledTest?: (testId: string) => void;
  soundStatus: SoundStatus;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousForceOpenKeyRef = useRef(forceOpenKey);
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    if (forceOpenKey === undefined) {
      return;
    }

    if (previousForceOpenKeyRef.current === forceOpenKey) {
      return;
    }

    previousForceOpenKeyRef.current = forceOpenKey;
    setOpen(true);
  }, [forceOpenKey]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!notifications.length) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          "relative grid h-10 w-10 place-items-center rounded-2xl border bg-surface transition",
          open
            ? "border-primary text-primary"
            : "border-border text-text-secondary hover:border-primary hover:text-primary",
        )}
        aria-label={`CodeConnect notifications: ${unreadCount}`}
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <Bell aria-hidden="true" size={18} strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full border-2 border-surface bg-red px-1 text-[10px] font-extrabold leading-none text-white">
          {unreadCount}
        </span>
      </button>

      {open ? (
        <NotificationPanel
          notifications={notifications}
          onAcceptFriendRequest={onAcceptFriendRequest}
          onClose={() => setOpen(false)}
          onDeclineFriendRequest={onDeclineFriendRequest}
          onEnableNotificationSound={onEnableNotificationSound}
          onOpenScheduledTest={(testId) => {
            onOpenScheduledTest?.(testId);
            setOpen(false);
          }}
          soundStatus={soundStatus}
        />
      ) : null}
    </div>
  );
}

function NotificationPanel({
  notifications,
  onAcceptFriendRequest,
  onClose,
  onDeclineFriendRequest,
  onEnableNotificationSound,
  onOpenScheduledTest,
  soundStatus,
}: {
  notifications: CodeConnectNotification[];
  onAcceptFriendRequest: (requestId: string) => void;
  onClose: () => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onEnableNotificationSound: () => void;
  onOpenScheduledTest: (testId: string) => void;
  soundStatus: SoundStatus;
}) {
  const hasFriendRequest = notifications.some(
    (notification) => notification.type === "friend-request",
  );

  return (
    <section
      className="fixed left-2 right-2 top-16 z-50 rounded-3xl border border-border bg-surface p-3 shadow-card sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(22rem,calc(100vw-1rem))]"
      role="dialog"
      aria-label="CodeConnect notifications"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
            <Bell aria-hidden="true" size={18} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-extrabold text-text-primary">
              Notifications
            </h2>
            <p className="truncate text-[12px] font-bold text-text-secondary">
              Tests and friend requests
            </p>
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

      {hasFriendRequest ? (
        <button
          type="button"
          className={cn(
            "mt-3 inline-flex h-8 items-center gap-1.5 rounded-xl border px-2.5 text-[11px] font-extrabold transition",
            soundStatus === "enabled"
              ? "border-primary bg-primary-soft text-primary-dark"
              : "border-border bg-surface-soft text-text-secondary hover:border-primary hover:text-primary-dark",
          )}
          onClick={onEnableNotificationSound}
        >
          <Volume2 aria-hidden="true" size={14} strokeWidth={2.5} />
          {soundStatus === "enabled"
            ? "Notification sound enabled"
            : "Enable notification sound"}
        </button>
      ) : null}

      <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onAcceptFriendRequest={onAcceptFriendRequest}
            onDeclineFriendRequest={onDeclineFriendRequest}
            onOpenScheduledTest={onOpenScheduledTest}
          />
        ))}
      </div>
    </section>
  );
}

function NotificationCard({
  notification,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onOpenScheduledTest,
}: {
  notification: CodeConnectNotification;
  onAcceptFriendRequest: (requestId: string) => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onOpenScheduledTest: (testId: string) => void;
}) {
  const isTest = notification.type === "test";
  const testTypeLabel = isTest ? getScheduledTestTypeLabel(notification) : "Friend request";
  const statusMeta = isTest
    ? getScheduledTestStatusMeta(notification)
    : notification.read
      ? undefined
      : { className: "bg-red-soft text-red", label: "New" };

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-2.5">
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
            isTest ? "bg-orange-soft text-orange" : "bg-blue-soft text-blue",
          )}
        >
          {isTest ? (
            <CalendarClock aria-hidden="true" size={15} strokeWidth={2.5} />
          ) : (
            <UserPlus aria-hidden="true" size={15} strokeWidth={2.5} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                isTest ? "bg-orange-soft text-orange" : "bg-blue-soft text-blue",
              )}
            >
              {testTypeLabel}
            </span>
            {statusMeta ? (
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold", statusMeta.className)}>
                {statusMeta.label}
              </span>
            ) : null}
          </div>
          <h3 className="mt-1.5 truncate text-[13px] font-extrabold leading-5 text-text-primary">
            {notification.title}
          </h3>
          {isTest ? (
            <p className="mt-1 inline-flex min-w-0 items-center gap-1 text-[11px] font-bold text-text-secondary">
              <Clock aria-hidden="true" className="shrink-0" size={12} strokeWidth={2.5} />
              <span className="truncate">{getScheduledTestTimeLabel(notification)}</span>
            </p>
          ) : (
            <>
              <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-4 text-text-secondary">
                {notification.message}
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase text-text-muted">
                {formatNotificationTime(notification.createdAt)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 pl-[42px]">
        {isTest ? (
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center rounded-xl bg-primary px-2.5 text-[11px] font-extrabold text-white transition hover:bg-primary-dark"
            onClick={() =>
              notification.targetId
                ? onOpenScheduledTest(notification.targetId)
                : undefined
            }
          >
            Open Test
          </button>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-primary px-2.5 text-[11px] font-extrabold text-white transition hover:bg-primary-dark"
              onClick={() =>
                notification.targetId
                  ? onAcceptFriendRequest(notification.targetId)
                  : undefined
              }
            >
              <Check aria-hidden="true" size={13} strokeWidth={2.5} />
              Accept
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 text-[11px] font-extrabold text-text-secondary transition hover:border-red hover:bg-red-soft hover:text-red"
              onClick={() =>
                notification.targetId
                  ? onDeclineFriendRequest(notification.targetId)
                  : undefined
              }
            >
              <X aria-hidden="true" size={13} strokeWidth={2.5} />
              Decline
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function getScheduledTestTypeLabel(notification: CodeConnectNotification) {
  const scheduledTest = getScheduledTestByNotification(notification);
  const searchableText = `${scheduledTest?.title ?? notification.title} ${scheduledTest?.id ?? notification.targetId ?? ""}`.toLowerCase();

  if (searchableText.includes("coding")) return "Coding Test";
  if (searchableText.includes("final") || searchableText.includes("full")) return "Final Test";
  if (searchableText.includes("monthly")) return "Monthly Test";
  if (searchableText.includes("weekly")) return "Weekly Test";
  return "Practice Test";
}

function getScheduledTestStatusMeta(notification: CodeConnectNotification) {
  const scheduledTest = getScheduledTestByNotification(notification);

  if (!scheduledTest) {
    return notification.read ? undefined : { className: "bg-red-soft text-red", label: "New" };
  }

  const nowMs = Date.now();
  const availableFromMs = parseDateMs(scheduledTest.availableFrom);
  const availableUntilMs = parseDateMs(scheduledTest.availableUntil);

  if (availableFromMs !== undefined && availableUntilMs !== undefined && nowMs >= availableFromMs && nowMs <= availableUntilMs) {
    return { className: "bg-red-soft text-red", label: "Live Now" };
  }

  if (availableFromMs !== undefined && nowMs < availableFromMs && isSameLocalDay(nowMs, availableFromMs)) {
    return { className: "bg-orange-soft text-orange", label: "Starts Soon" };
  }

  return notification.read ? { className: "bg-blue-soft text-blue", label: "Upcoming" } : { className: "bg-red-soft text-red", label: "New" };
}

function getScheduledTestTimeLabel(notification: CodeConnectNotification) {
  const scheduledTest = getScheduledTestByNotification(notification);
  const timeValue = scheduledTest?.availableFrom ?? notification.createdAt;
  return formatNotificationTime(timeValue);
}

function getScheduledTestByNotification(notification: CodeConnectNotification) {
  return notification.targetId
    ? codeconnectScheduledTests.find((test) => test.id === notification.targetId)
    : undefined;
}

function getPrimaryNotification(
  testNotifications: CodeConnectNotification[],
  friendNotifications: CodeConnectNotification[],
) {
  return (
    testNotifications.find((notification) => notification.priority === "high") ??
    testNotifications.find((notification) => notification.priority === "medium") ??
    (friendNotifications.length
      ? {
          id: "codeconnect-pending-friend-summary",
          type: "friend-request" as const,
          title: `You have ${friendNotifications.length} pending friend request${
            friendNotifications.length === 1 ? "" : "s"
          }`,
          message: "Open notifications to accept or decline CodeConnect requests.",
          createdAt: friendNotifications[0].createdAt,
          read: false,
          priority: "medium" as const,
        }
      : undefined)
  );
}

function getScheduledTestNotifications(
  tests: CodeConnectScheduledTest[],
  nowMs: number,
) {
  return tests
    .map((test) => {
      const state = getTestNotificationState(test, nowMs);
      return state ? mapScheduledTestToNotification(test, state) : undefined;
    })
    .filter(isCodeConnectNotification)
    .sort((left, right) => {
      const leftPriority = left.priority === "high" ? 0 : 1;
      const rightPriority = right.priority === "high" ? 0 : 1;
      return (
        leftPriority - rightPriority ||
        left.createdAt.localeCompare(right.createdAt)
      );
    });
}

function getTestNotificationState(
  test: CodeConnectScheduledTest,
  nowMs: number,
): TestNotificationState | undefined {
  if (test.status === "completed") {
    return undefined;
  }

  const availableFromMs = parseDateMs(test.availableFrom);
  const availableUntilMs = parseDateMs(test.availableUntil);

  if (availableFromMs === undefined || availableUntilMs === undefined) {
    return undefined;
  }

  if (nowMs >= availableFromMs && nowMs <= availableUntilMs) {
    return "active";
  }

  if (nowMs < availableFromMs && isSameLocalDay(nowMs, availableFromMs)) {
    return "upcoming";
  }

  return undefined;
}

function mapScheduledTestToNotification(
  test: CodeConnectScheduledTest,
  state: TestNotificationState,
): CodeConnectNotification {
  return {
    id: `notification-${state}-${test.id}`,
    type: "test",
    title:
      state === "active"
        ? `${test.title} is live now`
        : `${test.title} starts soon`,
    message:
      state === "active"
        ? `Start before ${formatNotificationTime(test.availableUntil)}.`
        : `Starts at ${formatNotificationTime(test.availableFrom)}.`,
    createdAt: test.availableFrom,
    read: false,
    targetId: test.id,
    priority: state === "active" ? "high" : "medium",
  };
}

function mapFriendRequestToNotification(
  request: CodeConnectFriendRequest,
): CodeConnectNotification {
  return {
    id: `notification-${request.id}`,
    type: "friend-request",
    title: `${request.senderName} sent a friend request`,
    message: request.message,
    createdAt: request.createdAt,
    read: false,
    targetId: request.id,
    priority: "medium",
  };
}

function useFriendRequestNotificationSound(
  friendRequests: CodeConnectFriendRequest[],
) {
  const [soundStatus, setSoundStatus] = useState<SoundStatus>("idle");
  const attemptedRequestIdsRef = useRef<Set<string>>(new Set());
  const newestPendingRequest = useMemo(
    () =>
      [...friendRequests]
        .filter((request) => request.status === "pending")
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0],
    [friendRequests],
  );

  const playForRequest = async (request?: CodeConnectFriendRequest) => {
    if (!request || hasStoredSoundNotification(request.id)) {
      return enableNotificationAudio();
    }

    if (attemptedRequestIdsRef.current.has(request.id)) {
      return false;
    }

    attemptedRequestIdsRef.current.add(request.id);
    const didPlay = await playNotificationBeep();
    writeLastSoundNotification(request.id);
    return didPlay;
  };

  useEffect(() => {
    if (!newestPendingRequest) {
      return;
    }

    void playForRequest(newestPendingRequest).then((didPlay) => {
      setSoundStatus(didPlay ? "enabled" : "blocked");
    });
  }, [newestPendingRequest?.id]);

  return {
    enableNotificationSound: () => {
      void playForRequest(newestPendingRequest).then((didPlay) => {
        setSoundStatus(didPlay ? "enabled" : "blocked");
      });
    },
    soundStatus,
  };
}

async function playNotificationBeep() {
  const audioContext = await getRunningAudioContext();

  if (!audioContext) {
    return false;
  }

  try {
    const startTime = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(660, startTime + 0.18);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.24);

    return true;
  } catch {
    return false;
  }
}

async function enableNotificationAudio() {
  return (await getRunningAudioContext()) !== undefined;
}

async function getRunningAudioContext() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const AudioContextConstructor = getAudioContextConstructor();

  if (!AudioContextConstructor) {
    return undefined;
  }

  try {
    const audioContext =
      notificationAudioContext ?? new AudioContextConstructor();
    notificationAudioContext = audioContext;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext.state === "running" ? audioContext : undefined;
  } catch {
    return undefined;
  }
}

function getAudioContextConstructor() {
  const audioWindow = window as Window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };

  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
}

function hasStoredSoundNotification(requestId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const storedValue = window.localStorage.getItem(lastSoundStorageKey);
    if (!storedValue) {
      return false;
    }
    const parsedValue: unknown = JSON.parse(storedValue);
    return (
      typeof parsedValue === "object" &&
      parsedValue !== null &&
      "requestId" in parsedValue &&
      parsedValue.requestId === requestId
    );
  } catch {
    return false;
  }
}

function writeLastSoundNotification(requestId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      lastSoundStorageKey,
      JSON.stringify({ requestId, soundedAt: new Date().toISOString() }),
    );
  } catch {
    // Sound persistence is best-effort only.
  }
}

function isCodeConnectNotification(
  value: CodeConnectNotification | undefined,
): value is CodeConnectNotification {
  return value !== undefined;
}

function parseDateMs(value: string) {
  const dateMs = new Date(value).getTime();
  return Number.isNaN(dateMs) ? undefined : dateMs;
}

function isSameLocalDay(firstMs: number, secondMs: number) {
  const firstDate = new Date(firstMs);
  const secondDate = new Date(secondMs);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "soon";
  }

  return date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
