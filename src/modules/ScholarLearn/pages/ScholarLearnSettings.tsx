import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Clock3,
  Download,
  Eye,
  History,
  LockKeyhole,
  LogOut,
  Mail,
  Palette,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { getAuthSession, type AuthSession } from "../../../lib/authSession";
import { logoutScholarLearnSession } from "../../../lib/logoutSession";

type NotificationSettingKey = "approvalAlerts" | "expiryAlerts" | "revenueAlerts";

const initialNotificationSettings: Record<NotificationSettingKey, boolean> = {
  approvalAlerts: true,
  expiryAlerts: true,
  revenueAlerts: true,
};

export function ScholarLearnSettings() {
  const session = getAuthSession();
  const user = session?.user;
  const displayName = getDisplayName(user);
  const email = user?.email ?? "Not available";
  const [notificationSettings, setNotificationSettings] = useState(initialNotificationSettings);

  const toggleNotification = (key: NotificationSettingKey) => {
    // TODO(platform-owner-settings): Persist notification preferences when a backend endpoint is available.
    setNotificationSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <motion.section
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
          Platform Owner Settings
        </span>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[30px] font-extrabold leading-tight text-text-primary">Settings</h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
              Manage account visibility, notifications, security, appearance, reports, and activity shortcuts.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:brightness-95"
            onClick={() => navigateToScholarLearnPath("/scholarlearn/profile")}
          >
            <UserRound aria-hidden="true" size={17} strokeWidth={2.5} />
            Open Profile
          </button>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SettingsCard
          icon={UserRound}
          title="Profile Settings"
          description="Read-only until the platform owner profile update API is connected."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyField icon={UserRound} label="Name" value={displayName} />
            <ReadOnlyField icon={Mail} label="Email" value={email} />
            <ReadOnlyField icon={ShieldCheck} label="Role" value="ScholarLearn" />
            <ReadOnlyField icon={ShieldCheck} label="Account Type" value="Platform Owner" />
          </div>
          <p className="mt-4 rounded-2xl bg-yellow-soft px-4 py-3 text-[13px] font-semibold leading-5 text-text-secondary">
            TODO: Connect profile update fields when the backend exposes a Platform Owner profile update endpoint.
          </p>
        </SettingsCard>

        <SettingsCard
          icon={Bell}
          title="Notification Settings"
          description="UI-only preferences for alerts that should later be saved by the backend."
        >
          <div className="space-y-3">
            <ToggleRow
              checked={notificationSettings.approvalAlerts}
              description="Notify when Institute Founder approval requests arrive."
              label="Approval alerts"
              onToggle={() => toggleNotification("approvalAlerts")}
            />
            <ToggleRow
              checked={notificationSettings.expiryAlerts}
              description="Notify when institute access or subscriptions are near expiry."
              label="Institute expiry alerts"
              onToggle={() => toggleNotification("expiryAlerts")}
            />
            <ToggleRow
              checked={notificationSettings.revenueAlerts}
              description="Notify about subscription revenue and plan changes."
              label="Revenue/subscription alerts"
              onToggle={() => toggleNotification("revenueAlerts")}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={LockKeyhole}
          title="Security Settings"
          description="Platform owner account security and session information."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyField icon={Clock3} label="Login Time" value={formatDateTime(session?.loginTimestamp)} />
            <ReadOnlyField icon={ShieldCheck} label="Session" value={session?.authToken ? "Active" : "Not active"} />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <DisabledAction icon={LockKeyhole} label="Change Password" />
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-soft px-4 text-[13px] font-extrabold text-red transition hover:brightness-95"
              onClick={logoutScholarLearnSession}
            >
              <LogOut aria-hidden="true" size={17} strokeWidth={2.5} />
              Logout
            </button>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={Palette}
          title="Appearance Settings"
          description="The Platform Owner workspace currently follows the shared ScholarLearn light dashboard theme."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyField icon={Palette} label="Theme" value="ScholarLearn Light" />
            <ReadOnlyField icon={Eye} label="Display Density" value="Standard cards" />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={Download}
          title="Reports Settings"
          description="Export controls stay disabled until a report export route or API exists."
        >
          <div className="space-y-3">
            <DisabledAction icon={Download} label="Export Institute Report" fullWidth />
            <DisabledAction icon={Download} label="Export Revenue Report" fullWidth />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={History}
          title="Activity / History"
          description="Approval and denial activity belongs in history, not the main header."
        >
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:brightness-95"
            onClick={() => navigateToScholarLearnPath("/scholarlearn/history")}
          >
            <History aria-hidden="true" size={17} strokeWidth={2.5} />
            Open Approvals / History
          </button>
        </SettingsCard>
      </div>
    </motion.section>
  );
}

function SettingsCard({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="text-[18px] font-extrabold text-text-primary">{title}</h2>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-text-secondary">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function ReadOnlyField({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-4">
      <Icon aria-hidden="true" className="text-primary-dark" size={17} strokeWidth={2.5} />
      <p className="mt-3 text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-1 break-words text-[14px] font-extrabold text-text-primary">{value}</p>
    </div>
  );
}

function ToggleRow({
  checked,
  description,
  label,
  onToggle,
}: {
  checked: boolean;
  description: string;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-surface-soft p-4 text-left transition hover:border-primary"
      onClick={onToggle}
    >
      <span>
        <span className="block text-[14px] font-extrabold text-text-primary">{label}</span>
        <span className="mt-1 block text-[13px] font-semibold leading-5 text-text-secondary">{description}</span>
      </span>
      <span
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
          checked ? "justify-end bg-primary" : "justify-start bg-border"
        }`}
        aria-hidden="true"
      >
        <span className="h-5 w-5 rounded-full bg-white shadow-card" />
      </span>
    </button>
  );
}

function DisabledAction({
  fullWidth = false,
  icon: Icon,
  label,
}: {
  fullWidth?: boolean;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-surface-soft px-4 text-[13px] font-extrabold text-text-muted ${
        fullWidth ? "w-full" : ""
      }`}
      disabled
    >
      <Icon aria-hidden="true" size={17} strokeWidth={2.5} />
      {label}
      <span className="text-[11px] font-bold">(coming soon)</span>
    </button>
  );
}

function navigateToScholarLearnPath(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function getDisplayName(user: AuthSession["user"] | undefined) {
  const explicitName = readString(user?.displayName) || readString(user?.name);
  if (explicitName) return explicitName;

  const firstName = readString(user?.firstName);
  const lastName = readString(user?.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || "ScholarLearn Platform Owner";
}

function formatDateTime(value: string | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
