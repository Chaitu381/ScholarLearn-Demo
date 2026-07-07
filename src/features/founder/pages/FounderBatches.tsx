import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, GraduationCap, Search, TrendingUp, UsersRound } from "lucide-react";
import { FounderBatchCard } from "../components/FounderBatchCard";
import type { FounderBatch, FounderBatchStatus } from "../types/founder.types";

const batches: FounderBatch[] = [
  {
    assignedLecturers: ["Kavya Rao", "Amit Shah"],
    attendance: 92,
    batchId: "jfs-2026-a",
    course: "Java Full Stack",
    name: "JFS-2026-A",
    nextClass: "Today, 2:00 PM",
    score: 84,
    status: "Active",
    students: 42,
    subject: "Spring Boot",
  },
  {
    assignedLecturers: ["Neeraj Iyer", "Priya Nair"],
    attendance: 86,
    batchId: "jfs-2026-b",
    course: "Java Full Stack",
    name: "JFS-2026-B",
    nextClass: "Tomorrow, 10:30 AM",
    score: 78,
    status: "Needs Attention",
    students: 38,
    subject: "React",
  },
  {
    assignedLecturers: ["Megha Singh"],
    attendance: 90,
    batchId: "py-2026-a",
    course: "Python Full Stack",
    name: "PY-2026-A",
    nextClass: "Wed, 11:00 AM",
    score: 81,
    status: "Active",
    students: 36,
    subject: "Python APIs",
  },
  {
    assignedLecturers: ["Arun Dev", "Sneha Kulkarni"],
    attendance: 82,
    batchId: "mern-2026-a",
    course: "MERN Stack",
    name: "MERN-2026-A",
    nextClass: "Fri, 3:30 PM",
    score: 74,
    status: "Needs Attention",
    students: 34,
    subject: "Node.js",
  },
  {
    assignedLecturers: ["Rakesh Menon"],
    attendance: 95,
    batchId: "java-core-2025-c",
    course: "Core Java",
    name: "JAVA-CORE-2025-C",
    nextClass: "Completed",
    score: 88,
    status: "Completed",
    students: 29,
    subject: "Collections",
  },
];

export function FounderBatches() {
  const [courseFilter, setCourseFilter] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | FounderBatchStatus>("All");

  const courseOptions = useMemo(() => ["All", ...Array.from(new Set(batches.map((batch) => batch.course)))], []);
  const statusOptions: Array<"All" | FounderBatchStatus> = ["All", "Active", "Needs Attention", "Completed"];
  const totalStudents = batches.reduce((total, batch) => total + batch.students, 0);
  const averagePerformance = Math.round(batches.reduce((total, batch) => total + batch.score, 0) / batches.length);
  const activeBatches = batches.filter((batch) => batch.status === "Active").length;

  const filteredBatches = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return batches.filter((batch) => {
      const matchesSearch = !normalizedSearch || batch.name.toLowerCase().includes(normalizedSearch);
      const matchesCourse = courseFilter === "All" || batch.course === courseFilter;
      const matchesStatus = statusFilter === "All" || batch.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [courseFilter, searchValue, statusFilter]);

  const openBatch = (batchId: string) => {
    window.history.pushState({}, "", `/founder/batches/${encodeURIComponent(batchId)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
          Founder
        </span>
        <h1 className="mt-4 text-[30px] font-extrabold text-text-primary sm:text-[34px]">Batches</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
          Monitor all institute batches, assigned lecturers, attendance, test performance, and running status.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={GraduationCap} label="Total batches" value={batches.length} />
        <SummaryCard icon={BookOpenCheck} label="Active batches" value={activeBatches} />
        <SummaryCard icon={UsersRound} label="Total students" value={totalStudents} />
        <SummaryCard icon={TrendingUp} label="Average batch performance" value={`${averagePerformance}%`} />
      </div>

      <section className="rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_220px_200px]">
          <label className="relative block">
            <span className="sr-only">Search by batch name</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              size={18}
              strokeWidth={2.5}
            />
            <input
              className="h-12 w-full rounded-2xl border border-border bg-surface-soft pl-11 pr-4 text-[14px] font-semibold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by batch name"
              value={searchValue}
            />
          </label>
          <FilterSelect label="Course" onChange={setCourseFilter} options={courseOptions} value={courseFilter} />
          <FilterSelect
            label="Status"
            onChange={(value) => setStatusFilter(value as "All" | FounderBatchStatus)}
            options={statusOptions}
            value={statusFilter}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredBatches.map((batch) => (
          <FounderBatchCard key={batch.batchId} batch={batch} onOpen={openBatch} />
        ))}
      </section>

      {filteredBatches.length === 0 ? (
        <section className="rounded-3xl border border-border bg-surface p-6 text-center shadow-card">
          <p className="text-[18px] font-extrabold text-text-primary">No batches found</p>
          <p className="mt-2 text-[14px] text-text-secondary">Try another search or filter combination.</p>
        </section>
      ) : null}
    </motion.section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: number | string;
}) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
      </span>
      <p className="mt-4 text-[28px] font-extrabold leading-none text-text-primary">{value}</p>
      <p className="mt-2 text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
    </article>
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
