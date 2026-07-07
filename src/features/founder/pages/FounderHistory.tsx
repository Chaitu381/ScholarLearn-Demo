import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Filter, RefreshCw, Search, XCircle } from "lucide-react";
import { founderApprovalApi } from "../services/founderApprovalApi";
import type { FounderApprovalHistoryAction, FounderApprovalHistoryRecord } from "../types/founder.types";

type ActionFilter = "ALL" | FounderApprovalHistoryAction;

export function FounderHistory() {
  const [historyRecords, setHistoryRecords] = useState<FounderApprovalHistoryRecord[]>([]);
  const [expandedRecordId, setExpandedRecordId] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadApprovalHistory = () => {
    setIsLoading(true);
    setErrorMessage("");

    founderApprovalApi
      .getApprovalHistory()
      .then((records) => setHistoryRecords(records.map(normalizeHistoryRecord)))
      .catch((error: unknown) => {
        setHistoryRecords([]);
        setErrorMessage(error instanceof Error ? error.message : "Unable to load approval history.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadApprovalHistory();
  }, []);

  const roleOptions = useMemo(
    () => Array.from(new Set(historyRecords.map((record) => record.requestedRole).filter(Boolean))).sort(),
    [historyRecords],
  );

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return historyRecords.filter((record) => {
      const matchesAction = actionFilter === "ALL" || record.action === actionFilter;
      const matchesRole = roleFilter === "ALL" || record.requestedRole === roleFilter;
      const matchesDate = !dateFilter || toInputDate(record.actionAt) === dateFilter;
      const matchesSearch =
        !normalizedSearch ||
        record.userName.toLowerCase().includes(normalizedSearch) ||
        record.userEmail.toLowerCase().includes(normalizedSearch) ||
        record.userId.toLowerCase().includes(normalizedSearch);

      return matchesAction && matchesRole && matchesDate && matchesSearch;
    });
  }, [actionFilter, dateFilter, historyRecords, roleFilter, searchValue]);

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
              Founder
            </span>
            <h1 className="mt-4 text-[30px] font-extrabold text-text-primary">History</h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-7 text-text-secondary">
              Review all Founder approval and denial actions from the database.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
            onClick={loadApprovalHistory}
          >
            <RefreshCw aria-hidden="true" size={16} strokeWidth={2.5} />
            Refresh
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <label className="relative block flex-1">
            <span className="text-[13px] font-extrabold text-text-primary">Search</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3.5 left-4 text-text-muted"
              size={17}
              strokeWidth={2.5}
            />
            <input
              className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-surface-soft pl-11 pr-4 text-[13px] font-bold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-surface"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search name, email, user id"
              value={searchValue}
            />
          </label>

          <ActionSegmentedFilter value={actionFilter} onChange={setActionFilter} />

          <label className="block min-w-[190px]">
            <span className="text-[13px] font-extrabold text-text-primary">Role filter</span>
            <select
              className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[13px] font-extrabold text-text-primary outline-none transition focus:border-primary focus:bg-surface"
              onChange={(event) => setRoleFilter(event.target.value)}
              value={roleFilter}
            >
              <option value="ALL">All roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-[180px]">
            <span className="text-[13px] font-extrabold text-text-primary">Date filter</span>
            <input
              className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[13px] font-extrabold text-text-primary outline-none transition focus:border-primary focus:bg-surface"
              onChange={(event) => setDateFilter(event.target.value)}
              type="date"
              value={dateFilter}
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[21px] font-extrabold text-text-primary">Approval Actions</h2>
            <p className="mt-1 text-[13px] font-semibold text-text-secondary">
              History is loaded from the approval history API and is not removed after notifications expire.
            </p>
          </div>
          <span className="inline-flex h-9 w-fit items-center gap-2 rounded-2xl bg-primary-soft px-4 text-[12px] font-extrabold text-primary-dark">
            <Clock3 aria-hidden="true" size={15} strokeWidth={2.5} />
            {filteredRecords.length} records
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <StatusCard title="Loading approval history" description="Fetching permanent history records from the database." />
          ) : errorMessage ? (
            <StatusCard title="Unable to load history" description={errorMessage} actionLabel="Retry" onAction={loadApprovalHistory} />
          ) : filteredRecords.length ? (
            filteredRecords.map((record) => (
              <HistoryRecordCard
                key={record.id}
                expanded={expandedRecordId === record.id}
                onToggleDetails={() => setExpandedRecordId((currentId) => (currentId === record.id ? "" : record.id))}
                record={record}
              />
            ))
          ) : (
            <StatusCard
              title="No history records found"
              description="Try changing the filters, or check again after Founder approval actions are stored by the backend."
            />
          )}
        </div>
      </section>
    </section>
  );
}

function ActionSegmentedFilter({
  onChange,
  value,
}: {
  onChange: (value: ActionFilter) => void;
  value: ActionFilter;
}) {
  const options: Array<{ label: string; value: ActionFilter }> = [
    { label: "All", value: "ALL" },
    { label: "Approved", value: "APPROVED" },
    { label: "Denied", value: "DENIED" },
  ];

  return (
    <div className="min-w-[260px]">
      <span className="text-[13px] font-extrabold text-text-primary">Status</span>
      <div className="mt-1.5 flex rounded-2xl border border-border bg-surface-soft p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`h-9 flex-1 rounded-xl px-3 text-[12px] font-extrabold transition ${
              value === option.value
                ? "bg-surface text-text-primary shadow-card"
                : "text-text-secondary hover:bg-surface hover:text-text-primary"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryRecordCard({
  expanded,
  onToggleDetails,
  record,
}: {
  expanded: boolean;
  onToggleDetails: () => void;
  record: FounderApprovalHistoryRecord;
}) {
  const Icon = record.action === "APPROVED" ? CheckCircle2 : XCircle;
  const toneClass = record.action === "APPROVED" ? "bg-primary-soft text-primary-dark" : "bg-red-soft text-red";

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(250px,1.5fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)_auto] lg:items-center">
        <div className="flex min-w-0 gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${toneClass}`}>
            <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold text-text-primary">{record.userName}</p>
            <p className="mt-1 truncate text-[12px] font-bold text-text-secondary">{record.userEmail}</p>
          </div>
        </div>

        <HistoryChip label="Role" value={formatRole(record.requestedRole)} />
        <HistoryChip label="Action by" value={record.actionBy || "Founder"} />
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${toneClass}`}>{record.action}</span>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-2xl border border-border bg-surface px-3 text-[12px] font-extrabold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
            onClick={onToggleDetails}
          >
            <Filter aria-hidden="true" size={14} strokeWidth={2.5} />
            Details
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <HistoryChip label="User ID" value={record.userId} />
        <HistoryChip label="Date" value={formatActionDate(record.actionAt)} />
      </div>

      {expanded ? <HistoryDetails record={record} /> : null}
    </article>
  );
}

function HistoryDetails({ record }: { record: FounderApprovalHistoryRecord }) {
  const detailRows = [
    { label: "User name", value: record.userName },
    { label: "User email", value: record.userEmail },
    { label: "Requested role", value: formatRole(record.requestedRole) },
    { label: "Approval status/action", value: record.action },
    { label: "Action date/time", value: formatActionDate(record.actionAt) },
    { label: "Action done by", value: record.actionBy || "Founder" },
  ];
  const extraDetails = Object.entries(record.details ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">Approval record details</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {detailRows.map((row) => (
          <DetailBlock key={row.label} label={row.label} value={row.value} />
        ))}
        {extraDetails.map(([key, value]) => (
          <DetailBlock key={key} label={formatRole(key)} value={String(value)} />
        ))}
      </div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-soft p-3">
      <p className="text-[11px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-1 break-words text-[13px] font-extrabold text-text-primary">{value}</p>
    </div>
  );
}

function HistoryChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-extrabold text-text-secondary">
      {label}: <strong className="text-text-primary">{value}</strong>
    </span>
  );
}

function StatusCard({
  actionLabel,
  description,
  onAction,
  title,
}: {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-5 text-center">
      <p className="text-[15px] font-extrabold text-text-primary">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-[13px] font-semibold leading-6 text-text-secondary">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-4 h-10 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function normalizeHistoryRecord(record: FounderApprovalHistoryRecord): FounderApprovalHistoryRecord {
  return {
    action: record.action === "DENIED" ? "DENIED" : "APPROVED",
    actionAt: record.actionAt,
    actionBy: record.actionBy || "Founder",
    details: record.details,
    id: record.id,
    requestedRole: record.requestedRole,
    userEmail: record.userEmail,
    userId: record.userId,
    userName: record.userName,
  };
}

function formatActionDate(value: string) {
  const actionDate = new Date(value);
  if (Number.isNaN(actionDate.getTime())) {
    return "Recently";
  }

  return actionDate.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toInputDate(value: string) {
  const actionDate = new Date(value);
  if (Number.isNaN(actionDate.getTime())) {
    return "";
  }

  const year = actionDate.getFullYear();
  const month = String(actionDate.getMonth() + 1).padStart(2, "0");
  const day = String(actionDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRole(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
