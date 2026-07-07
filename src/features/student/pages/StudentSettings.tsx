import { useState } from "react";
import { Bell, Download, Eye, LockKeyhole, LogOut, Moon, Palette, Sun, TimerReset, UserRound } from "lucide-react";
import { useTheme } from "../../../app/providers/ThemeProvider";
import { getAuthSession } from "../../../lib/authSession";
import { logoutScholarLearnSession } from "../../../lib/logoutSession";
import { PageTitle } from "../../../shared/components/ui/PageTitle";
import { changePassword } from "../../../shared/services/profileService";
import { FilterTabs, PageCard, StudentPage, ToggleRow, ToneBadge } from "../components/StudentPagePrimitives";
import { useStudentDashboard } from "../hooks/useStudentDashboard";
import type { StudentSettingsGroup } from "../types/student.types";

const groupIcons = {
  notifications: Bell,
  learning: TimerReset,
  privacy: LockKeyhole,
};

export function StudentSettings() {
  const { settings } = useStudentDashboard();
  const { setTheme, theme } = useTheme();
  const authSession = getAuthSession();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [editableSettings, setEditableSettings] = useState(settings);
  const [passwordDraft, setPasswordDraft] = useState({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [displayPreferences, setDisplayPreferences] = useState({
    animationLevel: "Subtle",
    chartStyle: "Clean academic",
    defaultPage: "Dashboard",
    numberFormat: "Percentages and XP",
  });

  const updateDisplayPreference = (field: keyof typeof displayPreferences, value: string) => {
    setDisplayPreferences((currentPreferences) => ({
      ...currentPreferences,
      [field]: value,
    }));
  };

  const updatePasswordDraft = (field: keyof typeof passwordDraft, value: string) => {
    setPasswordDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const submitPasswordChange = async () => {
    const result = await changePassword(passwordDraft);
    setPasswordMessage(result.message);

    if (result.ok) {
      setPasswordDraft({
        confirmPassword: "",
        currentPassword: "",
        newPassword: "",
      });
    }
  };

  const toggleSetting = (groupId: string, settingId: string) => {
    setEditableSettings((currentGroups) =>
      currentGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              settings: group.settings.map((setting) =>
                setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting,
              ),
            }
          : group,
      ),
    );
  };

  return (
    <StudentPage>
      <PageTitle
        title="Settings"
        description="Manage theme, notifications, learning reminders, privacy, account, and display preferences."
      />

      <PageCard
        title="Account Details"
        description="Current student account identity and profile access."
        icon={UserRound}
        action={
          <button
            type="button"
            className="h-10 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
            onClick={navigateToStudentProfile}
          >
            Edit Profile
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SettingField label="Name" value={readSessionName(authSession?.user.displayName ?? authSession?.user.name)} />
          <SettingField label="Role" value="Student" />
          <SettingField label="Email" value={authSession?.user.email ?? "student@fengari.me"} />
          <SettingField label="Approval status" value={String(authSession?.user.approvalStatus ?? "APPROVED").replace("_", " ")} />
        </div>
      </PageCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,58fr)_minmax(320px,42fr)]">
        <PageCard title="Appearance" description="Choose the color mode for this device." icon={Palette}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-surface-soft p-4">
              <p className="text-[14px] font-extrabold text-text-primary">Color mode</p>
              <p className="mt-1 text-[13px] leading-5 text-text-secondary">Light and dark preferences are saved on this device.</p>
              <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Choose color mode">
                <ThemeModeButton
                  active={theme === "light"}
                  icon={Sun}
                  label="Light"
                  onClick={() => setTheme("light")}
                />
                <ThemeModeButton
                  active={theme === "dark"}
                  icon={Moon}
                  label="Dark"
                  onClick={() => setTheme("dark")}
                />
              </div>
            </div>
            <div className="rounded-2xl bg-surface-soft p-4">
              <p className="text-[14px] font-extrabold text-text-primary">Display density</p>
              <p className="mt-1 text-[13px] leading-5 text-text-secondary">Choose how compact learning data should feel.</p>
              <div className="mt-4">
                <FilterTabs active="Comfortable" items={["Compact", "Comfortable", "Spacious"]} />
              </div>
            </div>
          </div>
        </PageCard>

        {/* <PageCard title="Display Preferences" description="Readable, calm defaults for long study sessions." icon={Eye}>
          <div className="grid gap-3 rounded-2xl bg-surface-soft p-4">
            <EditableSelect
              label="Default page"
              onChange={(value) => updateDisplayPreference("defaultPage", value)}
              options={["Dashboard", "Subjects", "Test & Exam", "Analytics", "Leaderboard"]}
              value={displayPreferences.defaultPage}
            />
            <EditableSelect
              label="Chart style"
              onChange={(value) => updateDisplayPreference("chartStyle", value)}
              options={["Clean academic", "Compact bars", "Soft trend lines"]}
              value={displayPreferences.chartStyle}
            />
            <EditableSelect
              label="Animation level"
              onChange={(value) => updateDisplayPreference("animationLevel", value)}
              options={["Minimal", "Subtle", "Standard"]}
              value={displayPreferences.animationLevel}
            />
            <EditableSelect
              label="Number format"
              onChange={(value) => updateDisplayPreference("numberFormat", value)}
              options={["Percentages and XP", "Percentages only", "Detailed numbers"]}
              value={displayPreferences.numberFormat}
            />
          </div>
        </PageCard> */}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {editableSettings.map((group) => (
          <SettingsGroupCard key={group.id} group={group} onToggleSetting={toggleSetting} />
        ))}
        <PageCard
          title="Security"
          description="Password controls are ready for backend support."
          icon={LockKeyhole}
        >
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
        </PageCard>
        <PageCard
          title="Reports / Download Data"
          description="Export controls for student learning and account data."
          icon={Download}
        >
          <div className="rounded-2xl bg-surface-soft p-4">
            <p className="text-[14px] font-extrabold text-text-primary">Download student summary</p>
            <p className="mt-1 text-[13px] leading-5 text-text-secondary">
              Report export will use backend-generated files when available.
            </p>
            <button
              type="button"
              className="mt-4 h-10 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
            >
              Request Export
            </button>
          </div>
        </PageCard>
        <PageCard
          title="Account Session"
          description="Sign out from this device and return to the login page."
          icon={LogOut}
          action={<ToneBadge label="Student" tone="neutral" />}
        >
          <div className="rounded-2xl bg-surface-soft p-4">
            <p className="text-[12px] font-extrabold uppercase text-text-muted">Signed in as</p>
            <p className="mt-2 text-[15px] font-extrabold text-text-primary">
              {authSession?.user.email ?? "student@fengari.me"}
            </p>
            <p className="mt-1 text-[13px] font-bold text-text-secondary">Role: Student</p>
            <button
              type="button"
              className="mt-4 h-11 rounded-2xl bg-red-soft px-5 text-[14px] font-extrabold text-red transition hover:bg-red hover:text-white"
              onClick={() => setLogoutDialogOpen(true)}
            >
              Logout
            </button>
          </div>
        </PageCard>
      </div>

      {logoutDialogOpen ? (
        <LogoutConfirmationDialog
          onCancel={() => setLogoutDialogOpen(false)}
          onConfirm={logoutScholarLearnSession}
        />
      ) : null}
    </StudentPage>
  );
}

function ThemeModeButton({
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

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-4">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-2 truncate text-[14px] font-extrabold text-text-primary">{value}</p>
    </div>
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

function SettingsGroupCard({
  group,
  onToggleSetting,
}: {
  group: StudentSettingsGroup;
  onToggleSetting: (groupId: string, settingId: string) => void;
}) {
  const Icon = groupIcons[group.id as keyof typeof groupIcons] ?? Bell;

  return (
    <PageCard title={group.title} description={group.description} icon={Icon} action={<ToneBadge label={`${group.settings.length} options`} tone="neutral" />}>
      <div className="space-y-3">
        {group.settings.map((setting) => (
          <button
            key={setting.id}
            type="button"
            className="w-full text-left"
            onClick={() => onToggleSetting(group.id, setting.id)}
          >
            <ToggleRow
              checked={setting.enabled}
              description={setting.description}
              label={setting.label}
            />
          </button>
        ))}
      </div>
    </PageCard>
  );
}

function navigateToStudentProfile() {
  window.history.pushState({}, "", "/#profile");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function readSessionName(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Student";
}

function EditableSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="block rounded-2xl bg-surface p-3">
      <span className="text-[11px] font-extrabold uppercase text-text-muted">{label}</span>
      <select
        className="mt-2 h-10 w-full rounded-xl border border-border bg-surface-soft px-3 text-[14px] font-extrabold text-text-primary outline-none transition focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
