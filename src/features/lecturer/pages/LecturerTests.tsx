import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  Edit3,
  Eye,
  Rocket,
  Search,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { navigateToLecturerPath } from "../components/LecturerShell";
import { getLecturerApiStatusMessage, lecturerApi } from "../services/lecturerApi";

type LecturerTestStatus = "Completed" | "Draft" | "Published";
type LecturerTestType = "Final" | "Mock" | "Monthly" | "Weekly";

type LecturerTestListItem = {
  batch: string;
  batchId: string;
  createdDate: string;
  durationMinutes: number;
  sectionsIncluded: string[];
  status: LecturerTestStatus;
  subject: string;
  subjectId: string;
  testId: string;
  testType: LecturerTestType;
  title: string;
  totalMarks: number;
};

const lecturerTestList: LecturerTestListItem[] = [
  {
    batch: "JFS-2026-A",
    batchId: "jfs-2026-a",
    createdDate: "2026-06-22",
    durationMinutes: 60,
    sectionsIncluded: ["MCQ", "QA", "Coding"],
    status: "Published",
    subject: "Spring Boot",
    subjectId: "spring-boot",
    testId: "test-spring-security",
    testType: "Weekly",
    title: "Spring Security Checkpoint",
    totalMarks: 100,
  },
  {
    batch: "JFS-2026-B",
    batchId: "jfs-2026-b",
    createdDate: "2026-06-25",
    durationMinutes: 90,
    sectionsIncluded: ["Coding"],
    status: "Draft",
    subject: "React",
    subjectId: "react",
    testId: "test-react-hooks",
    testType: "Mock",
    title: "React Hooks Coding Test",
    totalMarks: 80,
  },
  {
    batch: "PY-2026-A",
    batchId: "py-2026-a",
    createdDate: "2026-06-18",
    durationMinutes: 75,
    sectionsIncluded: ["MCQ", "QA"],
    status: "Completed",
    subject: "Python APIs",
    subjectId: "python-apis",
    testId: "test-python-api",
    testType: "Monthly",
    title: "Python API Monthly Test",
    totalMarks: 120,
  },
  {
    batch: "MERN-2026-A",
    batchId: "mern-2026-a",
    createdDate: "2026-06-12",
    durationMinutes: 120,
    sectionsIncluded: ["MCQ", "QA", "Coding"],
    status: "Published",
    subject: "Node.js",
    subjectId: "node-js",
    testId: "test-node-final",
    testType: "Final",
    title: "Node.js Final Readiness Test",
    totalMarks: 150,
  },
];

const testActions: Array<{
  description: string;
  icon: LucideIcon;
  label: string;
  path?: string;
  testType?: LecturerTestType;
}> = [
  {
    description: "Build and publish a new assessment.",
    icon: ClipboardList,
    label: "Create Test",
    path: "/lecturer/tests/create",
  },
  {
    description: "Review weekly checkpoints.",
    icon: CalendarClock,
    label: "Weekly Tests",
    testType: "Weekly",
  },
  {
    description: "Browse monthly assessments.",
    icon: BarChart3,
    label: "Monthly Tests",
    testType: "Monthly",
  },
  {
    description: "Open final readiness tests.",
    icon: Trophy,
    label: "Final Tests",
    testType: "Final",
  },
];

const glassCard =
  "rounded-[28px] border border-white/10 bg-white/[0.065] shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl";

export function LecturerTests() {
  const [tests, setTests] = useState<LecturerTestListItem[]>(lecturerTestList);
  const [apiState, setApiState] = useState({ error: "", loading: true });
  const [publishMessage, setPublishMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let active = true;

    lecturerApi
      .getLecturerTests()
      .then((payload) => {
        if (!active) return;
        setTests(normalizeTests(payload));
        setApiState({ error: "", loading: false });
      })
      .catch((error) => {
        if (!active) return;
        setTests(lecturerTestList);
        setApiState({ error: getLecturerApiStatusMessage(error), loading: false });
      });

    return () => {
      active = false;
    };
  }, []);

  const filterOptions = useMemo(
    () => ({
      batches: ["All", ...Array.from(new Set(tests.map((test) => test.batch)))],
      statuses: ["All", ...Array.from(new Set(tests.map((test) => test.status)))],
      subjects: ["All", ...Array.from(new Set(tests.map((test) => test.subject)))],
      types: ["All", ...Array.from(new Set(tests.map((test) => test.testType)))],
    }),
    [tests],
  );

  const filteredTests = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesSearch =
        !normalizedSearch ||
        test.title.toLowerCase().includes(normalizedSearch) ||
        test.batch.toLowerCase().includes(normalizedSearch) ||
        test.subject.toLowerCase().includes(normalizedSearch);

      return (
        matchesSearch &&
        (typeFilter === "All" || test.testType === typeFilter) &&
        (batchFilter === "All" || test.batch === batchFilter) &&
        (subjectFilter === "All" || test.subject === subjectFilter) &&
        (statusFilter === "All" || test.status === statusFilter)
      );
    });
  }, [batchFilter, searchValue, statusFilter, subjectFilter, tests, typeFilter]);

  const handlePublish = async (testId: string) => {
    setPublishMessage("Publishing test...");

    try {
      await lecturerApi.publishTest(testId);
      setTests((currentTests) =>
        currentTests.map((test) => (test.testId === testId ? { ...test, status: "Published" } : test)),
      );
      setPublishMessage("Test published successfully.");
    } catch (error) {
      setPublishMessage(getLecturerApiStatusMessage(error));
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-[36px] bg-[#070B19] p-4 text-slate-100 sm:p-5 lg:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(168,85,247,0.20),transparent_28%),linear-gradient(135deg,rgba(59,130,246,0.08),rgba(15,23,42,0))]" />

      <div className="relative space-y-6">
        <TestActionCards onTypeFilterChange={setTypeFilter} typeFilter={typeFilter} />
        <ApiStateNotice error={apiState.error} loading={apiState.loading} />
        {publishMessage ? (
          <div className="flex justify-end">
            <span className="inline-flex min-h-8 items-center rounded-full bg-white/[0.06] px-3 py-1 text-[12px] font-extrabold text-slate-300">
              {publishMessage}
            </span>
          </div>
        ) : null}
        <TestFilters
          batchFilter={batchFilter}
          batches={filterOptions.batches}
          onBatchFilterChange={setBatchFilter}
          onSearchChange={setSearchValue}
          onStatusFilterChange={setStatusFilter}
          onSubjectFilterChange={setSubjectFilter}
          onTypeFilterChange={setTypeFilter}
          searchValue={searchValue}
          statusFilter={statusFilter}
          statuses={filterOptions.statuses}
          subjectFilter={subjectFilter}
          subjects={filterOptions.subjects}
          typeFilter={typeFilter}
          types={filterOptions.types}
        />

        <section className="grid gap-4 xl:grid-cols-2">
          {filteredTests.map((test) => (
            <TestCard key={test.testId} onPublish={handlePublish} test={test} />
          ))}
        </section>

        {filteredTests.length === 0 ? <EmptyState /> : null}
      </div>
    </motion.div>
  );
}

function TestActionCards({
  onTypeFilterChange,
  typeFilter,
}: {
  onTypeFilterChange: (value: string) => void;
  typeFilter: string;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {testActions.map((action) => {
        const Icon = action.icon;
        const selected = action.testType ? typeFilter === action.testType : false;
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
              onTypeFilterChange(action.testType ?? "All");
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

function TestFilters({
  batchFilter,
  batches,
  onBatchFilterChange,
  onSearchChange,
  onStatusFilterChange,
  onSubjectFilterChange,
  onTypeFilterChange,
  searchValue,
  statusFilter,
  statuses,
  subjectFilter,
  subjects,
  typeFilter,
  types,
}: {
  batchFilter: string;
  batches: string[];
  onBatchFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSubjectFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  searchValue: string;
  statusFilter: string;
  statuses: string[];
  subjectFilter: string;
  subjects: string[];
  typeFilter: string;
  types: string[];
}) {
  return (
    <section className={`${glassCard} p-4 sm:p-5`}>
      <div className="grid gap-3 lg:grid-cols-[minmax(250px,1fr)_150px_170px_170px_150px]">
        <label className="relative block">
          <span className="sr-only">Search tests</span>
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
        <FilterSelect label="Type" onChange={onTypeFilterChange} options={types} value={typeFilter} />
        <FilterSelect label="Batch" onChange={onBatchFilterChange} options={batches} value={batchFilter} />
        <FilterSelect label="Subject" onChange={onSubjectFilterChange} options={subjects} value={subjectFilter} />
        <FilterSelect label="Status" onChange={onStatusFilterChange} options={statuses} value={statusFilter} />
      </div>
    </section>
  );
}

function TestCard({ onPublish, test }: { onPublish: (testId: string) => void; test: LecturerTestListItem }) {
  return (
    <motion.article
      className={`${glassCard} group relative overflow-hidden p-5`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300/0 via-cyan-300 to-purple-400/0" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold uppercase text-slate-400">{test.batch} - {test.subject}</p>
          <h2 className="mt-2 text-[24px] font-extrabold leading-tight text-white">{test.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill status={test.status} />
            <MetaPill label={test.testType} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[340px]">
          <Metric icon={CalendarClock} label="Duration" value={`${test.durationMinutes}m`} />
          <Metric icon={BarChart3} label="Marks" value={test.totalMarks} />
          <Metric icon={ClipboardList} label="Sections" value={test.sectionsIncluded.length} />
          <Metric icon={CalendarClock} label="Created" value={formatShortDate(test.createdDate)} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {test.sectionsIncluded.map((section) => (
          <MetaPill key={section} label={section} />
        ))}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        <ActionButton icon={Eye} label="View" onClick={() => navigateToLecturerPath(`/lecturer/tests/${test.testId}`)} />
        <ActionButton icon={Edit3} label="Edit" onClick={() => navigateToLecturerPath("/lecturer/tests/create")} />
        <ActionButton
          disabled={test.status === "Published" || test.status === "Completed"}
          icon={Rocket}
          label="Publish"
          onClick={() => onPublish(test.testId)}
        />
        <ActionButton icon={BarChart3} label="Results" onClick={() => navigateToLecturerPath(`/lecturer/tests/${test.testId}`)} />
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
      <p className="mt-2 text-[15px] font-extrabold text-white">{value}</p>
    </div>
  );
}

function ActionButton({
  disabled = false,
  icon: Icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.075] px-3 text-[12px] font-extrabold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"
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
      <p className="text-[18px] font-extrabold text-white">No tests found</p>
      <p className="mt-2 text-[14px] text-slate-400">Try another filter or create a new assessment.</p>
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

function StatusPill({ status }: { status: LecturerTestStatus }) {
  const className =
    status === "Published"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : status === "Completed"
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

function normalizeTests(payload: unknown): LecturerTestListItem[] {
  const records = readRecords(payload, "tests");
  if (!records.length) return lecturerTestList;

  return records.map((record, index) => {
    const fallback = lecturerTestList[index] ?? lecturerTestList[0];
    return {
      batch: readString(record.batch ?? record.batchName, fallback.batch),
      batchId: readString(record.batchId, fallback.batchId),
      createdDate: readString(record.createdDate ?? record.createdAt, fallback.createdDate),
      durationMinutes: readNumber(record.durationMinutes ?? record.duration, fallback.durationMinutes),
      sectionsIncluded: normalizeSections(record.sectionsIncluded ?? record.sections, fallback.sectionsIncluded),
      status: normalizeStatus(record.status, fallback.status),
      subject: readString(record.subject ?? record.subjectName, fallback.subject),
      subjectId: readString(record.subjectId, fallback.subjectId),
      testId: readString(record.testId ?? record.id, fallback.testId),
      testType: normalizeTestType(record.testType ?? record.type, fallback.testType),
      title: readString(record.title, fallback.title),
      totalMarks: readNumber(record.totalMarks ?? record.marks, fallback.totalMarks),
    };
  });
}

function normalizeSections(value: unknown, fallback: string[]) {
  if (Array.isArray(value) && value.length) {
    return value
      .map((section) => {
        if (typeof section === "string") return section;
        if (isRecord(section)) return readString(section.sectionType ?? section.type, "");
        return "";
      })
      .filter(Boolean);
  }

  return fallback;
}

function normalizeStatus(value: unknown, fallback: LecturerTestStatus): LecturerTestStatus {
  if (value === "Draft" || value === "Published" || value === "Completed") return value;
  const normalized = typeof value === "string" ? value.toUpperCase() : "";
  if (normalized === "DRAFT") return "Draft";
  if (normalized === "PUBLISHED") return "Published";
  if (normalized === "COMPLETED") return "Completed";
  return fallback;
}

function normalizeTestType(value: unknown, fallback: LecturerTestType): LecturerTestType {
  if (value === "Weekly" || value === "Monthly" || value === "Final" || value === "Mock") return value;
  const normalized = typeof value === "string" ? value.toUpperCase() : "";
  if (normalized === "WEEKLY") return "Weekly";
  if (normalized === "MONTHLY") return "Monthly";
  if (normalized === "FINAL") return "Final";
  if (normalized === "MOCK") return "Mock";
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
