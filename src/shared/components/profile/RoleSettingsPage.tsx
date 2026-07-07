import { useEffect, useState, type ReactNode } from "react";
import { Bell, Download, LockKeyhole, LogOut, Moon, Palette, Sun, UserRound, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { logoutScholarLearnSession } from "../../../lib/logoutSession";
import {
  changePassword,
  getCurrentUserProfile,
  getNotificationSettings,
  updateNotificationSettings,
  type CurrentUserProfile,
  type NotificationSettingsPayload,
  type RoleProfileKind,
} from "../../services/profileService";

type RoleSettingsPageProps = {
  includeApprovalNotifications?: boolean;
  profilePath: string;
  roleKind: RoleProfileKind;
  roleLabel: string;
};

type PasswordDraft = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export function RoleSettingsPage({
  includeApprovalNotifications = false,
  profilePath,
  roleKind,
  roleLabel,
}: RoleSettingsPageProps) {
  const { setTheme, theme } = useTheme();
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettingsPayload>(() => getNotificationSettings(roleKind));
  const [passwordDraft, setPasswordDraft] = useState<PasswordDraft>(() => createEmptyPasswordDraft());
  const [passwordMessage, setPasswordMessage] = useState("");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCurrentUserProfile(roleKind).then((currentProfile) => {
      if (isMounted) setProfile(currentProfile);
    });

    return () => {
      isMounted = false;
    };
  }, [roleKind]);

  const toggleNotification = (field: keyof NotificationSettingsPayload) => {
    setNotifications((currentNotifications) => {
      const nextNotifications = {
        ...currentNotifications,
        [field]: !currentNotifications[field],
      };
      void updateNotificationSettings(nextNotifications);
      return nextNotifications;
    });
  };

  const updatePasswordDraft = (field: keyof PasswordDraft, value: string) => {
    setPasswordDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const submitPasswordChange = async () => {
    const result = await changePassword(passwordDraft);
    setPasswordMessage(result.message);
    if (result.ok) setPasswordDraft(createEmptyPasswordDraft());
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{roleLabel} Workspace</p>
          <h1 className="mt-1 text-[30px] font-extrabold leading-tight text-text-primary sm:text-[34px]">Settings</h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
            Manage account details, notifications, security, appearance, and data preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard
          icon={UserRound}
          title="Account Details"
          description="Current identity and workspace information."
          action={
            <button
              type="button"
              className="h-10 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
              onClick={() => navigateToPath(profilePath)}
            >
              Edit Profile
            </button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingField label="Name" value={profile?.fullName ?? "Loading..."} />
            <SettingField label="Role" value={profile?.roleLabel ?? roleLabel} />
            <SettingField label="Email" value={profile?.email ?? "Loading..."} />
            <SettingField label="Phone" value={profile?.phone || "Not added"} />
            <SettingField label="Institute" value={profile?.instituteName || "Not available"} />
            <SettingField label="Approval status" value={profile?.approvalStatus?.replace("_", " ") || "Approved"} />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={Bell}
          title="Notification Preferences"
          description="Choose which ScholarLearn updates should reach you."
        >
          <div className="space-y-3">
            <SwitchRow
              checked={notifications.emailNotifications}
              description="Receive important account and institute updates by email."
              label="Email notifications"
              onClick={() => toggleNotification("emailNotifications")}
            />
            {includeApprovalNotifications ? (
              <SwitchRow
                checked={Boolean(notifications.approvalNotifications)}
                description="Get notified when new users request account approval."
                label="Approval notifications"
                onClick={() => toggleNotification("approvalNotifications")}
              />
            ) : (
              <SwitchRow
                checked={Boolean(notifications.testAssignmentNotifications)}
                description="Receive alerts for tests, assignments, submissions, and reviews."
                label="Test and assignment notifications"
                onClick={() => toggleNotification("testAssignmentNotifications")}
              />
            )}
            <SwitchRow
              checked={Boolean(notifications.reportNotifications)}
              description="Receive weekly summaries and workspace report reminders."
              label="Report notifications"
              onClick={() => toggleNotification("reportNotifications")}
            />
          </div>
        </SettingsCard>

        <SettingsCard icon={Palette} title="Appearance" description="Theme controls stay available only inside Settings.">
          <div className="grid gap-3 sm:grid-cols-2">
            <ThemeButton active={theme === "light"} icon={Sun} label="Light" onClick={() => setTheme("light")} />
            <ThemeButton active={theme === "dark"} icon={Moon} label="Dark" onClick={() => setTheme("dark")} />
          </div>
        </SettingsCard>

        <SettingsCard icon={Download} title="Reports / Download Data" description="Exportable data controls for this workspace.">
          <div className="rounded-2xl bg-surface-soft p-4">
            <p className="text-[14px] font-extrabold text-text-primary">Download account summary</p>
            <p className="mt-1 text-[13px] leading-5 text-text-secondary">
              Report export will connect to backend-generated files when available.
            </p>
            <button
              type="button"
              className="mt-4 h-10 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
            >
              Request Export
            </button>
          </div>
        </SettingsCard>

        <SettingsCard icon={LockKeyhole} title="Security" description="Password and session controls for this device.">
          <div className="space-y-3">
            <PasswordInput
              label="Current password"
              value={passwordDraft.currentPassword}
              onChange={(value) => updatePasswordDraft("currentPassword", value)}
            />
            <PasswordInput
              label="New password"
              value={passwordDraft.newPassword}
              onChange={(value) => updatePasswordDraft("newPassword", value)}
            />
            <PasswordInput
              label="Confirm new password"
              value={passwordDraft.confirmPassword}
              onChange={(value) => updatePasswordDraft("confirmPassword", value)}
            />
            {passwordMessage ? (
              <p className="rounded-2xl bg-surface-soft px-4 py-3 text-[13px] font-bold text-text-secondary">
                {passwordMessage}
              </p>
            ) : null}
            <button
              type="button"
              className="h-11 rounded-2xl border border-border bg-surface px-5 text-[14px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
              onClick={submitPasswordChange}
            >
              Change Password
            </button>
          </div>
        </SettingsCard>

        <SettingsCard icon={LogOut} title="Account Session" description="Sign out from this device and return to the login page.">
          <div className="rounded-2xl bg-surface-soft p-4">
            <p className="text-[12px] font-extrabold uppercase text-text-muted">Signed in as</p>
            <p className="mt-2 text-[15px] font-extrabold text-text-primary">{profile?.email ?? "Loading..."}</p>
            <p className="mt-1 text-[13px] font-bold text-text-secondary">Role: {profile?.roleLabel ?? roleLabel}</p>
            <button
              type="button"
              className="mt-4 h-11 rounded-2xl bg-red-soft px-5 text-[14px] font-extrabold text-red transition hover:bg-red hover:text-white"
              onClick={() => setLogoutDialogOpen(true)}
            >
              Logout
            </button>
          </div>
        </SettingsCard>
      </div>

      {logoutDialogOpen ? (
        <LogoutConfirmationDialog
          onCancel={() => setLogoutDialogOpen(false)}
          onConfirm={logoutScholarLearnSession}
        />
      ) : null}
    </motion.div>
  );
}

function SettingsCard({
  action,
  children,
  description,
  icon: Icon,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
            <Icon aria-hidden="true" size={22} strokeWidth={2.5} />
          </span>
          <div>
            <h2 className="text-[21px] font-extrabold text-text-primary">{title}</h2>
            <p className="mt-1 text-[14px] leading-6 text-text-secondary">{description}</p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-4">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-2 truncate text-[14px] font-extrabold text-text-primary">{value}</p>
    </div>
  );
}

function SwitchRow({
  checked,
  description,
  label,
  onClick,
}: {
  checked: boolean;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-surface-soft p-4 text-left transition hover:bg-primary-soft/60"
      onClick={onClick}
    >
      <span className="min-w-0">
        <span className="block text-[14px] font-extrabold text-text-primary">{label}</span>
        <span className="mt-1 block text-[13px] leading-5 text-text-secondary">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
          checked ? "justify-end bg-primary" : "justify-start bg-border"
        }`}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow-card" />
      </span>
    </button>
  );
}

function ThemeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Sun;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={
        active
          ? "flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-soft px-3 text-[13px] font-extrabold text-primary-dark"
          : "flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-[13px] font-extrabold text-text-secondary transition hover:border-primary hover:text-primary-dark"
      }
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function PasswordInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block rounded-2xl bg-surface-soft p-4">
      <span className="text-[12px] font-extrabold uppercase text-text-muted">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-[14px] font-extrabold text-text-primary outline-none transition focus:border-primary"
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function LogoutConfirmationDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-soft text-red">
          <LogOut aria-hidden="true" size={22} strokeWidth={2.5} />
        </div>
        <h2 className="mt-4 text-[24px] font-extrabold text-text-primary">Logout?</h2>
        <p className="mt-2 text-[14px] leading-6 text-text-secondary">
          Are you sure you want to logout from this account?
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="h-11 rounded-2xl border border-border bg-surface px-5 text-[14px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-11 rounded-2xl bg-red px-5 text-[14px] font-extrabold text-white transition hover:opacity-90"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function createEmptyPasswordDraft(): PasswordDraft {
  return {
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  };
}

function navigateToPath(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
