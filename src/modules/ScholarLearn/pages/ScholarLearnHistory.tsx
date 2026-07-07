import { motion } from "framer-motion";
import { CheckCircle2, Clock3, RefreshCw, Search, ShieldAlert, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  ScholarLearnApprovalHistoryAction,
  ScholarLearnApprovalHistoryRecord,
} from "../types/scholarLearn.types";
import { getScholarLearnApprovalHistory } from "../services/scholarLearnApprovalApi";

type StatusFilter = "ALL" | ScholarLearnApprovalHistoryAction;

const pageSize = 8;

export function ScholarLearnHistory() {
  const [approvalHistory, setApprovalHistory] = useState<ScholarLearnApprovalHistoryRecord[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [instituteFilter, setInstituteFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const loadApprovalHistory = () => {
    setLoading(true);
    setHistoryError("");

    getScholarLearnApprovalHistory()
      .then((history) => {
        setApprovalHistory(history);
        setHistoryError("");
      })
      .catch((error) => {
        setApprovalHistory([]);
        setHistoryError(error instanceof Error ? error.message : "Unable to load ScholarLearn approval history.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApprovalHistory();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, instituteFilter, roleFilter, searchValue, statusFilter]);

  const roleOptions = useMemo(
    () => Array.from(new Set(approvalHistory.map((record) => record.requestedRole).filter(Boolean))).sort(),
    [approvalHistory],
  );

  const instituteOptions = useMemo(
    () => Array.from(new Set(approvalHistory.map((record) => record.instituteName).filter(isNonEmptyString))).sort(),
    [approvalHistory],
  );

  const filteredHistory = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return approvalHistory.filter((record) => {
      const actionTime = new Date(record.actionAt).getTime();
      const searchableText = [
        record.userName,
        record.userEmail,
        record.requestedRole,
        record.instituteName,
        record.actionBy,
        record.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesStatus = statusFilter === "ALL" || record.action === statusFilter;
      const matchesRole = roleFilter === "ALL" || record.requestedRole === roleFilter;
      const matchesInstitute = instituteFilter === "ALL" || record.instituteName === instituteFilter;
      const matchesFrom = fromDate === null || (!Number.isNaN(actionTime) && actionTime >= fromDate);
      const matchesTo = toDate === null || (!Number.isNaN(actionTime) && actionTime <= toDate);

      return matchesSearch && matchesStatus && matchesRole && matchesInstitute && matchesFrom && matchesTo;
    });
  }, [approvalHistory, dateFrom, dateTo, instituteFilter, roleFilter, searchValue, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedHistory = filteredHistory.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
              Platform History
            </span>
            <h1 className="mt-4 text-[30px] font-extrabold text-text-primary">History</h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
              Review approval and denial records stored by the ScholarLearn backend.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            onClick={loadApprovalHistory}
          >
            <RefreshCw aria-hidden="true" size={16} strokeWidth={2.5} />
            Refresh
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_auto_180px_190px_160px_160px] xl:items-end">
          <label className="relative block">
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
              placeholder="Search name, email, role, institute"
              value={searchValue}
            />
          </label>

          <StatusFilter value={statusFilter} onChange={setStatusFilter} />

          <FilterSelect
            label="Role"
            onChange={setRoleFilter}
            options={roleOptions}
            placeholder="All roles"
            value={roleFilter}
          />

          <FilterSelect
            label="Institute"
            onChange={setInstituteFilter}
            options={instituteOptions}
            placeholder="All institutes"
            value={instituteFilter}
          />

          <DateFilter label="From" onChange={setDateFrom} value={dateFrom} />
          <DateFilter label="To" onChange={setDateTo} value={dateTo} />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[20px] font-extrabold text-text-primary">Approval Audit</h2>
            <p className="mt-1 text-[13px] font-semibold text-text-secondary">
              Showing {paginatedHistory.length} of {filteredHistory.length} matching backend records.
            </p>
          </div>
          <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
            {approvalHistory.length} total records
          </span>
        </div>

        {historyError ? (
          <HistoryStatus
            icon={ShieldAlert}
            message={historyError}
            title="Unable to load backend history"
          />
        ) : null}

        <div className="mt-5 space-y-3">
          {loading ? (
            <HistoryStatus icon={Clock3} message="Fetching permanent approval records from the database." title="Loading history" />
          ) : !historyError && paginatedHistory.length ? (
            paginatedHistory.map((record) => <ApprovalHistoryRow key={record.id} record={record} />)
          ) : !historyError ? (
            <HistoryStatus icon={Clock3} message="No records match the current filters." title="No history found" />
          ) : null}
        </div>

        {!loading && !historyError && filteredHistory.length > pageSize ? (
          <PaginationControls
            page={safePage}
            totalPages={totalPages}
            onNext={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
            onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          />
        ) : null}
      </section>
    </motion.section>
  );
}

function StatusFilter({
  onChange,
  value,
}: {
  onChange: (value: StatusFilter) => void;
  value: StatusFilter;
}) {
  const options: Array<{ label: string; value: StatusFilter }> = [
    { label: "All", value: "ALL" },
    { label: "Approved", value: "APPROVED" },
    { label: "Denied", value: "DENIED" },
    { label: "Pending", value: "PENDING" },
  ];

  return (
    <div className="min-w-[290px]">
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

function FilterSelect({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-text-primary">{label}</span>
      <select
        className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[13px] font-extrabold text-text-primary outline-none transition focus:border-primary focus:bg-surface"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="ALL">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label === "Role" ? formatRole(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateFilter({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-text-primary">{label}</span>
      <input
        className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[13px] font-extrabold text-text-primary outline-none transition focus:border-primary focus:bg-surface"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  );
}

function ApprovalHistoryRow({ record }: { record: ScholarLearnApprovalHistoryRecord }) {
  const Icon = record.action === "APPROVED" ? CheckCircle2 : record.action === "DENIED" ? XCircle : Clock3;

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4 transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1.25fr)_minmax(150px,0.8fr)_minmax(180px,1fr)_minmax(150px,0.75fr)_minmax(170px,0.9fr)] lg:items-center">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-extrabold text-text-primary">{record.userName}</p>
          <p className="mt-1 truncate text-[12px] font-semibold text-text-secondary">{record.userEmail}</p>
        </div>
        <HistoryChip label="Role" value={formatRole(record.requestedRole)} />
        <HistoryChip label="Institute" value={record.instituteName || "Not provided"} />
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[12px] font-extrabold ${actionClass(record.action)}`}>
          <Icon aria-hidden="true" size={14} strokeWidth={2.6} />
          {formatAction(record.action)}
        </span>
        <div className="text-[12px] font-semibold text-text-secondary lg:text-right">
          <p>{formatDateTime(record.actionAt)}</p>
          <p className="mt-1 font-extrabold text-text-primary">By {record.actionBy}</p>
        </div>
      </div>

      {record.reason ? (
        <p className="mt-3 rounded-2xl bg-surface px-3 py-2 text-[12px] font-semibold text-text-secondary">
          <span className="font-extrabold text-text-primary">Reason:</span> {record.reason}
        </p>
      ) : null}
    </article>
  );
}

function HistoryChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="w-fit rounded-full bg-surface px-3 py-1 text-[11px] font-extrabold text-text-secondary">
      {label}: <strong className="text-text-primary">{value}</strong>
    </span>
  );
}

function HistoryStatus({
  icon: Icon,
  message,
  title,
}: {
  icon: typeof Clock3;
  message: string;
  title: string;
}) {
  return (
    <article className="mt-5 rounded-2xl border border-border bg-surface-soft p-5">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-[15px] font-extrabold text-text-primary">{title}</p>
          <p className="mt-1 text-[13px] font-semibold leading-6 text-text-secondary">{message}</p>
        </div>
      </div>
    </article>
  );
}

function PaginationControls({
  onNext,
  onPrevious,
  page,
  totalPages,
}: {
  onNext: () => void;
  onPrevious: () => void;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] font-bold text-text-secondary">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="h-10 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={onPrevious}
        >
          Previous
        </button>
        <button
          type="button"
          className="h-10 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function actionClass(action: ScholarLearnApprovalHistoryAction) {
  if (action === "APPROVED") return "bg-primary-soft text-primary-dark";
  if (action === "DENIED") return "bg-red-soft text-red";
  return "bg-yellow-soft text-orange";
}

function formatAction(action: ScholarLearnApprovalHistoryAction) {
  if (action === "APPROVED") return "Approved";
  if (action === "DENIED") return "Denied";
  return "Pending";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
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

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}
