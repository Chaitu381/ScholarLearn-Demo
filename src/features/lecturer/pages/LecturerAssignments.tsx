import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  Edit3,
  Eye,
  FileText,
  Search,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { navigateToLecturerPath } from "../components/LecturerShell";
import { getLecturerApiStatusMessage, lecturerApi } from "../services/lecturerApi";

type AssignmentStatus = "Completed" | "Draft" | "Published" | "Review";

type LecturerAssignmentListItem = {
  assignmentId: string;
  batch: string;
  batchId: string;
  dueDate: string;
  pendingCount: number;
  status: AssignmentStatus;
  subject: string;
  subjectId: string;
  submissionsCount: number;
  title: string;
  totalStudents: number;
};

const lecturerAssignmentList: LecturerAssignmentListItem[] = [
  {
    assignmentId: "assign-spring-crud",
    batch: "JFS-2026-A",
    batchId: "jfs-2026-a",
    dueDate: "2026-07-03",
    pendingCount: 14,
    status: "Published",
    subject: "Spring Boot",
    subjectId: "spring-boot",
    submissionsCount: 28,
    title: "Build Spring Boot CRUD APIs",
    totalStudents: 42,
  },
  {
    assignmentId: "assign-react-dashboard",
    batch: "JFS-2026-B",
    batchId: "jfs-2026-b",
    dueDate: "2026-07-06",
    pendingCount: 38,
    status: "Draft",
    subject: "React",
    subjectId: "react",
    submissionsCount: 0,
    title: "React Dashboard Components",
    totalStudents: 38,
  },
  {
    assignmentId: "assign-python-auth",
    batch: "PY-2026-A",
    batchId: "py-2026-a",
    dueDate: "2026-07-08",
    pendingCount: 18,
    status: "Review",
    subject: "Python APIs",
    subjectId: "python-apis",
    submissionsCount: 18,
    title: "Python Auth Flow Notes",
    totalStudents: 36,
  },
  {
    assignmentId: "assign-node-api",
    batch: "MERN-2026-A",
    batchId: "mern-2026-a",
    dueDate: "2026-07-12",
    pendingCount: 9,
    status: "Published",
    subject: "Node.js",
    subjectId: "node-js",
    submissionsCount: 25,
    title: "Node.js Middleware Practice",
    totalStudents: 34,
  },
];

const assignmentActions: Array<{
  description: string;
  icon: LucideIcon;
  label: string;
  path?: string;
  status?: AssignmentStatus;
}> = [
  {
    description: "Create a new task for a batch.",
    icon: FileText,
    label: "Create Assignment",
    path: "/lecturer/assignments/create",
  },
  {
    description: "Track published assignment work.",
    icon: ClipboardList,
    label: "Active Assignments",
    status: "Published",
  },
  {
    description: "Open submissions waiting for review.",
    icon: UsersRound,
    label: "Pending Reviews",
    status: "Review",
  },
  {
    description: "Browse finished assignment records.",
    icon: CheckCircle2,
    label: "Completed Assignments",
    status: "Completed",
  },
];

const glassCard =
  "rounded-[28px] border border-white/10 bg-white/[0.065] shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl";

export function LecturerAssignments() {
  const [assignments, setAssignments] = useState<LecturerAssignmentListItem[]>(lecturerAssignmentList);
  const [apiState, setApiState] = useState({ error: "", loading: true });
  const [searchValue, setSearchValue] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let active = true;

    lecturerApi
      .getLecturerAssignments()
      .then((payload) => {
        if (!active) return;
        setAssignments(normalizeAssignments(payload));
        setApiState({ error: "", loading: false });
      })
      .catch((error) => {
        if (!active) return;
        setAssignments(lecturerAssignmentList);
        setApiState({ error: getLecturerApiStatusMessage(error), loading: false });
      });

    return () => {
      active = false;
    };
  }, []);

  const filterOptions = useMemo(
    () => ({
      batches: ["All", ...Array.from(new Set(assignments.map((assignment) => assignment.batch)))],
      statuses: [
        "All",
        ...Array.from(new Set([...assignments.map((assignment) => assignment.status), "Completed"])),
      ],
      subjects: ["All", ...Array.from(new Set(assignments.map((assignment) => assignment.subject)))],
    }),
    [assignments],
  );

  const filteredAssignments = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesSearch =
        !normalizedSearch ||
        assignment.title.toLowerCase().includes(normalizedSearch) ||
        assignment.batch.toLowerCase().includes(normalizedSearch) ||
        assignment.subject.toLowerCase().includes(normalizedSearch);

      return (
        matchesSearch &&
        (batchFilter === "All" || assignment.batch === batchFilter) &&
        (subjectFilter === "All" || assignment.subject === subjectFilter) &&
        (statusFilter === "All" || assignment.status === statusFilter)
      );
    });
  }, [assignments, batchFilter, searchValue, statusFilter, subjectFilter]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-[36px] bg-[#070B19] p-4 text-slate-100 sm:p-5 lg:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(168,85,247,0.20),transparent_28%),linear-gradient(135deg,rgba(59,130,246,0.08),rgba(15,23,42,0))]" />

      <div className="relative space-y-6">
        <AssignmentActionCards onStatusFilterChange={setStatusFilter} statusFilter={statusFilter} />
        <ApiStateNotice error={apiState.error} loading={apiState.loading} />
        <AssignmentFilters
          batchFilter={batchFilter}
          batches={filterOptions.batches}
          onBatchFilterChange={setBatchFilter}
          onSearchChange={setSearchValue}
          onStatusFilterChange={setStatusFilter}
          onSubjectFilterChange={setSubjectFilter}
          searchValue={searchValue}
          statusFilter={statusFilter}
          statuses={filterOptions.statuses}
          subjectFilter={subjectFilter}
          subjects={filterOptions.subjects}
        />

        <section className="grid gap-4 xl:grid-cols-2">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard assignment={assignment} key={assignment.assignmentId} />
          ))}
        </section>

        {filteredAssignments.length === 0 ? <EmptyState /> : null}
      </div>
    </motion.div>
  );
}

function AssignmentActionCards({
  onStatusFilterChange,
  statusFilter,
}: {
  onStatusFilterChange: (value: string) => void;
  statusFilter: string;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {assignmentActions.map((action) => {
        const Icon = action.icon;
        const selected = action.status ? statusFilter === action.status : false;
        return (
          <motion.button
            key={action.label}
            type="button"
            className={`group flex min-h-[118px] w-full flex-col items-start rounded-[24px] border p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-cyan-300/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/25 ${
              selected
                ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100"
                : "border-white/10 bg-white/[0.065] text-slate-100"
            }`}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onClick={() => {
              if (action.path) {
                navigateToLecturerPath(action.path);
                return;
              }
              onStatusFilterChange(action.status ?? "All");
            }}
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-2xl transition ${
                selected ? "bg-cyan-300/20 text-cyan-100" : "bg-white/[0.075] text-cyan-200 group-hover:bg-cyan-300/15"
              }`}
            >
              <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
            </span>
            <span className="mt-4 text-[16px] font-extrabold leading-tight text-white">{action.label}</span>
            <span className="mt-2 text-[13px] font-semibold leading-5 text-slate-400">{action.description}</span>
          </motion.button>
        );
      })}
    </section>
  );
}

function AssignmentFilters({
  batchFilter,
  batches,
  onBatchFilterChange,
  onSearchChange,
  onStatusFilterChange,
  onSubjectFilterChange,
  searchValue,
  statusFilter,
  statuses,
  subjectFilter,
  subjects,
}: {
  batchFilter: string;
  batches: string[];
  onBatchFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSubjectFilterChange: (value: string) => void;
  searchValue: string;
  statusFilter: string;
  statuses: string[];
  subjectFilter: string;
  subjects: string[];
}) {
  return (
    <section className={`${glassCard} p-4 sm:p-5`}>
      <div className="grid gap-3 lg:grid-cols-[minmax(250px,1fr)_180px_180px_160px]">
        <label className="relative block">
          <span className="sr-only">Search assignments</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
            strokeWidth={2.5}
          />
          <input
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.075] pl-11 pr-4 text-[14px] font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search title, batch, subject"
            value={searchValue}
          />
        </label>
        <FilterSelect label="Batch" onChange={onBatchFilterChange} options={batches} value={batchFilter} />
        <FilterSelect label="Subject" onChange={onSubjectFilterChange} options={subjects} value={subjectFilter} />
        <FilterSelect label="Status" onChange={onStatusFilterChange} options={statuses} value={statusFilter} />
      </div>
    </section>
  );
}

function AssignmentCard({ assignment }: { assignment: LecturerAssignmentListItem }) {
  const showPendingAction = (action: string) => {
    window.alert(`${action} for "${assignment.title}" will be connected when the assignment review API is available.`);
  };

  return (
    <motion.article
      className={`${glassCard} group relative overflow-hidden p-5`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300/0 via-cyan-300 to-purple-400/0" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold uppercase text-slate-400">{assignment.batch} - {assignment.subject}</p>
          <h2 className="mt-2 text-[24px] font-extrabold leading-tight text-white">{assignment.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill status={assignment.status} />
            <MetaPill label={`Due ${formatShortDate(assignment.dueDate)}`} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 lg:min-w-[330px]">
          <Metric icon={UsersRound} label="Submitted" value={assignment.submissionsCount} />
          <Metric icon={ClipboardList} label="Pending" value={assignment.pendingCount} />
          <Metric icon={UsersRound} label="Students" value={assignment.totalStudents} />
        </div>
      </div>

      <div className="mt-5 h-2.5 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
          style={{ width: `${Math.min(100, (assignment.submissionsCount / Math.max(assignment.totalStudents, 1)) * 100)}%` }}
        />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <ActionButton icon={Eye} label="View" onClick={() => showPendingAction("Assignment details")} />
        <ActionButton icon={Edit3} label="Edit" onClick={() => navigateToLecturerPath("/lecturer/assignments/create")} />
        <ActionButton icon={ClipboardList} label="Review" onClick={() => showPendingAction("Submission review")} />
      </div>
    </motion.article>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase text-slate-500">{label}</span>
        <Icon aria-hidden="true" size={14} strokeWidth={2.5} className="text-cyan-200" />
      </div>
      <p className="mt-2 text-[17px] font-extrabold text-white">{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.075] px-3 text-[12px] font-extrabold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function ApiStateNotice({ error, loading }: { error: string; loading: boolean }) {
  if (!loading && !error) return null;

  return (
    <div className="flex justify-end">
      <span className="inline-flex h-8 items-center rounded-full bg-white/[0.06] px-3 text-[12px] font-extrabold text-slate-400">
        {loading ? "Syncing data" : "Demo data"}
      </span>
      <span className="sr-only">{error}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <section className={`${glassCard} p-6 text-center`}>
      <p className="text-[18px] font-extrabold text-white">No assignments found</p>
      <p className="mt-2 text-[14px] text-slate-400">Try another filter or create a new assignment.</p>
    </section>
  );
}

function FilterSelect({
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
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        className="h-12 w-full rounded-2xl border border-white/10 bg-[#11182B] px-4 text-[14px] font-extrabold text-white outline-none transition focus:border-cyan-300/50"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `All ${label}` : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusPill({ status }: { status: AssignmentStatus }) {
  const className =
    status === "Completed"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : status === "Published"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : status === "Review"
        ? "border-blue-300/20 bg-blue-300/10 text-blue-100"
        : "border-amber-300/20 bg-amber-300/10 text-amber-100";

  return <span className={`rounded-full border px-3 py-1 text-[11px] font-extrabold ${className}`}>{status}</span>;
}

function MetaPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-extrabold text-cyan-100">
      {label}
    </span>
  );
}

function normalizeAssignments(payload: unknown): LecturerAssignmentListItem[] {
  const records = readRecords(payload, "assignments");
  if (!records.length) return lecturerAssignmentList;

  return records.map((record, index) => {
    const fallback = lecturerAssignmentList[index] ?? lecturerAssignmentList[0];
    const totalStudents = readNumber(record.totalStudents, fallback.totalStudents);
    const submissionsCount = readNumber(record.submissionsCount ?? record.submittedCount ?? record.submissions, fallback.submissionsCount);
    return {
      assignmentId: readString(record.assignmentId ?? record.id, fallback.assignmentId),
      batch: readString(record.batch ?? record.batchName, fallback.batch),
      batchId: readString(record.batchId, fallback.batchId),
      dueDate: readString(record.dueDate ?? record.deadline, fallback.dueDate),
      pendingCount: readNumber(record.pendingCount, Math.max(totalStudents - submissionsCount, 0)),
      status: normalizeStatus(record.status, fallback.status),
      subject: readString(record.subject ?? record.subjectName, fallback.subject),
      subjectId: readString(record.subjectId, fallback.subjectId),
      submissionsCount,
      title: readString(record.title ?? record.name, fallback.title),
      totalStudents,
    };
  });
}

function normalizeStatus(value: unknown, fallback: AssignmentStatus): AssignmentStatus {
  if (value === "Completed" || value === "Draft" || value === "Published" || value === "Review") return value;
  const normalized = typeof value === "string" ? value.toUpperCase() : "";
  if (normalized === "COMPLETED") return "Completed";
  if (normalized === "DRAFT") return "Draft";
  if (normalized === "PUBLISHED") return "Published";
  if (normalized === "REVIEW" || normalized === "REVIEWED") return "Review";
  return fallback;
}

function readRecords(payload: unknown, key: string) {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  const record = isRecord(payload) ? payload : {};
  const value = record[key] ?? record.data ?? record.items;
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function readNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
