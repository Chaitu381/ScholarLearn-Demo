import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, CalendarClock, GraduationCap, Search, TriangleAlert, UsersRound } from "lucide-react";
import { LecturerBackButton } from "../components/LecturerPrimitives";
import { navigateToLecturerPath } from "../components/LecturerShell";
import { getLecturerApiStatusMessage, lecturerApi } from "../services/lecturerApi";

type LecturerBatchCard = {
  averageAttendance: number;
  averageScore: number;
  batchId: string;
  batchName: string;
  courseName: string;
  nextClass: string;
  status: "Active" | "Needs Attention" | "Completed";
  subjectName: string;
  totalStudents: number;
  weakStudentsCount: number;
};

const lecturerBatchCards: LecturerBatchCard[] = [
  {
    averageAttendance: 92,
    averageScore: 84,
    batchId: "jfs-2026-a",
    batchName: "JFS-2026-A",
    courseName: "Java Full Stack",
    nextClass: "Today, 2:00 PM",
    status: "Active",
    subjectName: "Spring Boot",
    totalStudents: 42,
    weakStudentsCount: 6,
  },
  {
    averageAttendance: 86,
    averageScore: 78,
    batchId: "jfs-2026-b",
    batchName: "JFS-2026-B",
    courseName: "Java Full Stack",
    nextClass: "Tomorrow, 10:30 AM",
    status: "Needs Attention",
    subjectName: "React",
    totalStudents: 38,
    weakStudentsCount: 11,
  },
  {
    averageAttendance: 90,
    averageScore: 81,
    batchId: "py-2026-a",
    batchName: "PY-2026-A",
    courseName: "Python Full Stack",
    nextClass: "Wed, 11:00 AM",
    status: "Active",
    subjectName: "Python APIs",
    totalStudents: 36,
    weakStudentsCount: 5,
  },
  {
    averageAttendance: 82,
    averageScore: 74,
    batchId: "mern-2026-a",
    batchName: "MERN-2026-A",
    courseName: "MERN Stack",
    nextClass: "Fri, 3:30 PM",
    status: "Needs Attention",
    subjectName: "Node.js",
    totalStudents: 34,
    weakStudentsCount: 13,
  },
  {
    averageAttendance: 95,
    averageScore: 88,
    batchId: "java-core-2025-c",
    batchName: "JAVA-CORE-2025-C",
    courseName: "Core Java",
    nextClass: "Completed",
    status: "Completed",
    subjectName: "Collections",
    totalStudents: 29,
    weakStudentsCount: 2,
  },
];

const lightCard = "rounded-3xl border border-border bg-surface shadow-card";

export function LecturerBatches() {
  const [searchValue, setSearchValue] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [batches, setBatches] = useState<LecturerBatchCard[]>(lecturerBatchCards);
  const [apiState, setApiState] = useState({ error: "", loading: true });

  useEffect(() => {
    let active = true;

    lecturerApi
      .getLecturerBatches()
      .then((payload) => {
        if (!active) return;
        setBatches(normalizeBatchCards(payload));
        setApiState({ error: "", loading: false });
      })
      .catch((error) => {
        if (!active) return;
        setBatches(lecturerBatchCards);
        setApiState({ error: getLecturerApiStatusMessage(error), loading: false });
      });

    return () => {
      active = false;
    };
  }, []);

  const courses = useMemo(() => ["All", ...Array.from(new Set(batches.map((batch) => batch.courseName)))], [batches]);
  const statuses = useMemo(() => ["All", ...Array.from(new Set(batches.map((batch) => batch.status)))], [batches]);

  const filteredBatches = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return batches.filter((batch) => {
      const matchesSearch =
        !normalizedSearch ||
        batch.batchName.toLowerCase().includes(normalizedSearch) ||
        batch.courseName.toLowerCase().includes(normalizedSearch) ||
        batch.subjectName.toLowerCase().includes(normalizedSearch);
      const matchesCourse = courseFilter === "All" || batch.courseName === courseFilter;
      const matchesStatus = statusFilter === "All" || batch.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [batches, courseFilter, searchValue, statusFilter]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <LecturerBackButton />
      <section className={`${lightCard} p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
              Lecturer Batches
            </span>
            <h1 className="mt-4 text-[30px] font-extrabold leading-tight text-text-primary sm:text-[34px]">
              My Teaching Batches
            </h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
              View only the batches assigned to you. Search by batch, course, or subject and open a batch to review
              learners.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_170px] xl:w-[720px]">
            <label className="relative block">
              <span className="sr-only">Search batches</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
                strokeWidth={2.5}
              />
              <input
                className="h-12 w-full rounded-2xl border border-border bg-surface-soft pl-11 pr-4 text-[14px] font-semibold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary"
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search batch, course, subject"
                value={searchValue}
              />
            </label>
            <FilterSelect label="Course" onChange={setCourseFilter} options={courses} value={courseFilter} />
            <FilterSelect label="Status" onChange={setStatusFilter} options={statuses} value={statusFilter} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ApiStateNotice error={apiState.error} loading={apiState.loading} />
        {filteredBatches.map((batch) => (
          <BatchCard key={batch.batchId} batch={batch} />
        ))}
      </section>

      {filteredBatches.length === 0 ? (
        <section className={`${lightCard} p-6 text-center`}>
          <p className="text-[18px] font-extrabold text-text-primary">No batches found</p>
          <p className="mt-2 text-[14px] text-text-secondary">Try another search or filter combination.</p>
        </section>
      ) : null}
    </motion.div>
  );
}

function ApiStateNotice({ error, loading }: { error: string; loading: boolean }) {
  if (!loading && !error) return null;

  return (
    <div className="flex justify-end md:col-span-2 xl:col-span-3">
      <span className="inline-flex h-8 items-center rounded-full bg-surface-soft px-3 text-[12px] font-extrabold text-text-secondary">
        {loading ? "Syncing data" : "Demo data"}
      </span>
      <span className="sr-only">{error}</span>
    </div>
  );
}

function BatchCard({ batch }: { batch: LecturerBatchCard }) {
  return (
    <motion.article
      className={`${lightCard} group p-4`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-muted">{batch.courseName}</p>
          <h2 className="mt-1 truncate text-[20px] font-extrabold text-text-primary">{batch.batchName}</h2>
          <p className="mt-1 text-[13px] font-bold text-text-secondary">{batch.subjectName}</p>
        </div>
        <StatusPill status={batch.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatChip icon={UsersRound} label="Students" value={batch.totalStudents} tone="primary" />
        <StatChip icon={BookOpenCheck} label="Attendance" value={`${batch.averageAttendance}%`} tone="blue" />
        <StatChip icon={GraduationCap} label="Avg Score" value={`${batch.averageScore}%`} tone="neutral" />
        <StatChip icon={TriangleAlert} label="Weak" value={batch.weakStudentsCount} tone="orange" />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-surface-soft px-3 py-2 text-[12px] font-bold text-text-secondary">
        <CalendarClock aria-hidden="true" size={16} strokeWidth={2.5} className="text-primary-dark" />
        <span>Next class</span>
        <span className="ml-auto text-right text-text-primary">{batch.nextClass}</span>
      </div>

      <button
        type="button"
        className="mt-4 h-10 w-full rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark"
        onClick={() => navigateToLecturerPath(`/lecturer/batches/${batch.batchId}`)}
      >
        View Batch
      </button>
    </motion.article>
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
        className="h-12 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[14px] font-extrabold text-text-primary outline-none transition focus:border-primary"
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

function StatChip({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  tone: "blue" | "neutral" | "orange" | "primary";
  value: string | number;
}) {
  return (
    <div className="inline-flex min-w-[11rem] flex-1 items-center gap-2 rounded-2xl border border-border bg-surface-soft px-3 py-2">
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl ${metricToneClass(tone)}`}>
        <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-extrabold uppercase text-text-muted">{label}</p>
        <p className="text-[14px] font-extrabold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: LecturerBatchCard["status"] }) {
  const className =
    status === "Active"
      ? "bg-primary-soft text-primary-dark"
      : status === "Completed"
        ? "bg-blue-soft text-blue"
        : "bg-orange-soft text-orange";

  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold ${className}`}>
      {status}
    </span>
  );
}

function metricToneClass(tone: "blue" | "neutral" | "orange" | "primary") {
  if (tone === "blue") return "bg-blue-soft text-blue";
  if (tone === "orange") return "bg-orange-soft text-orange";
  if (tone === "neutral") return "bg-surface text-text-secondary";
  return "bg-primary-soft text-primary-dark";
}

function normalizeBatchCards(payload: unknown): LecturerBatchCard[] {
  const records = readRecords(payload);
  if (!records.length) {
    return lecturerBatchCards;
  }

  return records.map((record, index) => {
    const fallback = lecturerBatchCards[index] ?? lecturerBatchCards[0];
    return {
      averageAttendance: readNumber(record.averageAttendance ?? record.attendance, fallback.averageAttendance),
      averageScore: readNumber(record.averageScore ?? record.score ?? record.progress, fallback.averageScore),
      batchId: readString(record.batchId ?? record.id, fallback.batchId),
      batchName: readString(record.batchName ?? record.name, fallback.batchName),
      courseName: readString(record.courseName ?? record.course, fallback.courseName),
      nextClass: readString(record.nextClass, fallback.nextClass),
      status: normalizeBatchStatus(record.status, fallback.status),
      subjectName: readString(record.subjectName ?? record.subject, fallback.subjectName),
      totalStudents: readNumber(record.totalStudents ?? record.students, fallback.totalStudents),
      weakStudentsCount: readNumber(record.weakStudentsCount ?? record.weakStudents, fallback.weakStudentsCount),
    };
  });
}

function readRecords(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  const record = isRecord(payload) ? payload : {};
  const value = record.batches ?? record.data ?? record.items;
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function normalizeBatchStatus(value: unknown, fallback: LecturerBatchCard["status"]): LecturerBatchCard["status"] {
  if (value === "Active" || value === "Needs Attention" || value === "Completed") return value;
  return fallback;
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
