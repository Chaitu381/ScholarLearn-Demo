import { motion } from "framer-motion";
import { Clock3, History, LogOut, Mail, Settings, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { getAuthSession, type AuthSession } from "../../../lib/authSession";
import { logoutScholarLearnSession } from "../../../lib/logoutSession";

export function ScholarLearnProfile() {
  const session = getAuthSession();
  const user = session?.user;
  const displayName = getDisplayName(user);
  const email = user?.email ?? "Not available";
  const status = readString(user?.approvalStatus) || "APPROVED";

  return (
    <motion.section
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-[20px] font-extrabold text-primary-dark">
              {getInitials(displayName)}
            </span>
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-extrabold uppercase text-primary-dark">
                Platform Owner
              </span>
              <h1 className="mt-2 truncate text-[26px] font-extrabold leading-tight text-text-primary">{displayName}</h1>
              <p className="mt-1 truncate text-[14px] font-semibold text-text-secondary">{email}</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-soft px-4 text-[13px] font-extrabold text-red transition hover:brightness-95"
            onClick={logoutScholarLearnSession}
          >
            <LogOut aria-hidden="true" size={17} strokeWidth={2.5} />
            Logout
          </button>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-soft text-blue">
              <UserRound aria-hidden="true" size={19} strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-[18px] font-extrabold text-text-primary">Profile Details</h2>
              <p className="text-[13px] font-semibold text-text-secondary">Account information from the current login session.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <DetailItem icon={UserRound} label="Name" value={displayName} />
            <DetailItem icon={Mail} label="Email" value={email} />
            <DetailItem icon={ShieldCheck} label="Role" value="ScholarLearn" />
            <DetailItem icon={ShieldCheck} label="Account Type" value="Platform Owner" />
            <DetailItem icon={Clock3} label="Status" value={formatStatus(status)} />
            <DetailItem icon={Clock3} label="Joined" value={formatDate(session?.loginTimestamp)} />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-[18px] font-extrabold text-text-primary">Quick Actions</h2>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-text-secondary">
            Move to the Platform Owner pages without adding more top-level header items.
          </p>
          <div className="mt-5 space-y-3">
            <QuickAction icon={History} label="View approvals/history" path="/scholarlearn/history" />
            <QuickAction icon={Settings} label="Open settings" path="/scholarlearn/settings" />
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-red-soft bg-red-soft px-4 py-3 text-left text-[14px] font-extrabold text-red transition hover:brightness-95"
              onClick={logoutScholarLearnSession}
            >
              <LogOut aria-hidden="true" size={18} strokeWidth={2.5} />
              Logout
            </button>
          </div>
        </section>
      </div>
    </motion.section>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <Icon aria-hidden="true" className="text-primary-dark" size={18} strokeWidth={2.5} />
      <p className="mt-3 text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-1 break-words text-[15px] font-extrabold text-text-primary">{value}</p>
    </article>
  );
}

function QuickAction({ icon: Icon, label, path }: { icon: LucideIcon; label: string; path: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-soft px-4 py-3 text-left text-[14px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
      onClick={() => navigateToScholarLearnPath(path)}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      {label}
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "S"}${parts[1]?.[0] ?? "L"}`.toUpperCase();
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
