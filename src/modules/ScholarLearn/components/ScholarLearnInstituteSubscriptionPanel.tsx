import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, ExternalLink, Save, type LucideIcon } from "lucide-react";
import type {
  ScholarLearnInstitute,
  ScholarLearnInstituteSubscriptionUpdate,
  ScholarLearnSubscriptionPlan,
} from "../types/scholarLearn.types";

type ScholarLearnInstituteSubscriptionPanelProps = {
  institute: ScholarLearnInstitute;
  onOpenOwnerPgs: () => void;
  onSave: (instituteId: string, payload: ScholarLearnInstituteSubscriptionUpdate) => Promise<void>;
  plans: ScholarLearnSubscriptionPlan[];
};

export function ScholarLearnInstituteSubscriptionPanel({
  institute,
  onOpenOwnerPgs,
  onSave,
  plans,
}: ScholarLearnInstituteSubscriptionPanelProps) {
  const [draft, setDraft] = useState(() => createSubscriptionDraft(institute));
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(createSubscriptionDraft(institute));
    setSaveError("");
  }, [institute]);

  const planOptions = useMemo(() => {
    return Array.from(new Set([...plans, institute.plan, draft.plan].filter(Boolean)));
  }, [draft.plan, institute.plan, plans]);

  const remainingDays = calculateRemainingDays(draft.expiryDate);
  const hasChanges =
    draft.disabled !== institute.disabled ||
    draft.expiryDate !== toDateInputValue(institute.expiryDate) ||
    draft.plan !== institute.plan ||
    draft.startDate !== toDateInputValue(institute.startDate);

  const updateDraft = <TKey extends keyof ScholarLearnInstituteSubscriptionUpdate>(
    key: TKey,
    value: ScholarLearnInstituteSubscriptionUpdate[TKey],
  ) => {
    setDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  };

  const saveChanges = async () => {
    setSaving(true);
    setSaveError("");

    try {
      await onSave(institute.id, draft);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to update institute subscription.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface-soft p-3" onClick={(event) => event.stopPropagation()}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12px] font-extrabold uppercase text-text-muted">Plan</span>
          <select
            className="mt-1 h-10 w-full rounded-2xl border border-border bg-surface px-3 text-[13px] font-extrabold text-text-primary outline-none transition focus:border-primary"
            value={draft.plan}
            onChange={(event) => updateDraft("plan", event.target.value as ScholarLearnSubscriptionPlan)}
          >
            {planOptions.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-[12px] font-extrabold uppercase text-text-muted">Access</span>
          <button
            type="button"
            className={`mt-1 flex h-10 w-full items-center justify-between rounded-2xl border px-3 text-[13px] font-extrabold transition ${
              draft.disabled
                ? "border-red-soft bg-red-soft text-red"
                : "border-primary-soft bg-primary-soft text-primary-dark"
            }`}
            onClick={() => updateDraft("disabled", !draft.disabled)}
          >
            {draft.disabled ? "Disabled" : "Active"}
            <span className={`h-5 w-9 rounded-full p-0.5 transition ${draft.disabled ? "bg-red/20" : "bg-primary/20"}`}>
              <span
                className={`block h-4 w-4 rounded-full bg-surface shadow-sm transition ${
                  draft.disabled ? "translate-x-0" : "translate-x-4"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12px] font-extrabold uppercase text-text-muted">Start date</span>
          <input
            className="mt-1 h-10 w-full rounded-2xl border border-border bg-surface px-3 text-[13px] font-extrabold text-text-primary outline-none transition focus:border-primary"
            type="date"
            value={draft.startDate}
            onChange={(event) => updateDraft("startDate", event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-extrabold uppercase text-text-muted">Expiry date</span>
          <input
            className="mt-1 h-10 w-full rounded-2xl border border-border bg-surface px-3 text-[13px] font-extrabold text-text-primary outline-none transition focus:border-primary"
            type="date"
            value={draft.expiryDate}
            onChange={(event) => updateDraft("expiryDate", event.target.value)}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-2 rounded-2xl border border-border bg-surface p-3 text-[12px] font-extrabold text-text-secondary">
        <DateRow icon={CalendarDays} label="Start date" value={formatDate(draft.startDate)} />
        <DateRow icon={CalendarDays} label="Expiry date" value={formatDate(draft.expiryDate)} />
        <DateRow icon={Building2} label="Remaining" value={draft.disabled ? "Access disabled" : `${remainingDays} days`} />
      </div>

      {saveError ? (
        <p className="mt-3 rounded-2xl border border-red-soft bg-red-soft px-3 py-2 text-[12px] font-extrabold text-red">
          {saveError}
        </p>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
          onClick={onOpenOwnerPgs}
        >
          Open Owner PGs
          <ExternalLink aria-hidden="true" size={15} strokeWidth={2.5} />
        </button>

        {hasChanges ? (
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={saving}
            onClick={saveChanges}
          >
            <Save aria-hidden="true" size={15} strokeWidth={2.5} />
            {saving ? "Saving..." : "Save changes"}
          </button>
        ) : (
          <span className="flex h-11 items-center justify-center rounded-2xl bg-primary-soft px-4 text-[13px] font-extrabold text-primary-dark">
            Subscription up to date
          </span>
        )}
      </div>
    </div>
  );
}

function createSubscriptionDraft(institute: ScholarLearnInstitute): ScholarLearnInstituteSubscriptionUpdate {
  return {
    disabled: institute.disabled,
    expiryDate: toDateInputValue(institute.expiryDate),
    plan: institute.plan,
    startDate: toDateInputValue(institute.startDate),
  };
}

function DateRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <p className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <Icon aria-hidden="true" size={14} strokeWidth={2.4} />
        {label}
      </span>
      <span className="text-text-primary">{value}</span>
    </p>
  );
}

function calculateRemainingDays(expiryDate: string) {
  const expiryTime = new Date(`${expiryDate}T23:59:59`).getTime();
  if (Number.isNaN(expiryTime)) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24)));
}

function toDateInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
