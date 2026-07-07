import { motion } from "framer-motion";
import { BookOpenCheck, Mail, Phone, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { founderLecturers } from "../data/founderLecturerData";
import type { FounderLecturer, FounderLecturerStatus } from "../types/founder.types";

export function FounderLectures() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | FounderLecturerStatus>("All");

  const filteredLecturers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return founderLecturers.filter((lecturer) => {
      const matchesSearch =
        !normalizedSearch ||
        lecturer.name.toLowerCase().includes(normalizedSearch) ||
        lecturer.email.toLowerCase().includes(normalizedSearch) ||
        lecturer.primarySubject?.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "All" || lecturer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchValue, statusFilter]);

  const openLecturer = (lecturerId: string) => {
    navigateToFounderPath(`/founder/lectures/${encodeURIComponent(lecturerId)}/dashboard`);
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
        <h1 className="mt-4 text-[30px] font-extrabold text-text-primary sm:text-[34px]">Lectures</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
          View institute lecturers, their assigned batches, subjects, and teaching workspace summaries.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={BookOpenCheck} label="Total lecturers" value={founderLecturers.length} />
        <SummaryCard icon={UsersRound} label="Assigned batches" value={founderLecturers.reduce((total, lecturer) => total + lecturer.assignedBatchesCount, 0)} />
        <SummaryCard icon={BookOpenCheck} label="Subjects covered" value={new Set(founderLecturers.flatMap((lecturer) => lecturer.subjects)).size} />
        <SummaryCard icon={UsersRound} label="Students covered" value={founderLecturers.reduce((total, lecturer) => total + lecturer.totalStudents, 0)} />
      </div>

      <section className="rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-surface-soft px-3 text-text-secondary">
            <Search aria-hidden="true" size={17} strokeWidth={2.4} />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-text-primary outline-none placeholder:text-text-muted"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search lecturer, email, or subject"
            />
          </label>
          <select
            className="h-11 rounded-2xl border border-border bg-surface-soft px-3 text-[14px] font-extrabold text-text-primary outline-none"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "All" | FounderLecturerStatus)}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Needs Review">Needs Review</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredLecturers.map((lecturer) => (
          <LecturerCard key={lecturer.id} lecturer={lecturer} onOpen={openLecturer} />
        ))}
      </section>
    </motion.section>
  );
}

function LecturerCard({ lecturer, onOpen }: { lecturer: FounderLecturer; onOpen: (lecturerId: string) => void }) {
  return (
    <button
      type="button"
      className="group rounded-3xl border border-border bg-surface p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
      onClick={() => onOpen(lecturer.id)}
    >
      <div className="flex items-start gap-3">
        <Avatar lecturer={lecturer} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="truncate text-[18px] font-extrabold text-text-primary">{lecturer.name}</h2>
            <StatusPill status={lecturer.status} />
          </div>
          <p className="mt-1 truncate text-[13px] font-semibold text-text-secondary">{lecturer.primarySubject ?? "General Faculty"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-[13px] font-semibold text-text-secondary">
        <p className="flex items-center gap-2">
          <Mail aria-hidden="true" size={15} strokeWidth={2.4} />
          <span className="truncate">{lecturer.email}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone aria-hidden="true" size={15} strokeWidth={2.4} />
          <span>{lecturer.phone ?? "Phone not added"}</span>
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MetricChip label="Batches" value={lecturer.assignedBatchesCount} />
        <MetricChip label="Subjects" value={lecturer.assignedSubjectsCount} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[12px] font-extrabold uppercase text-text-muted">{lecturer.totalStudents} students</span>
        <span className="text-[13px] font-extrabold text-primary-dark group-hover:underline">Open workspace</span>
      </div>
    </button>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof BookOpenCheck; label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-[22px] font-extrabold text-text-primary">{value}</p>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Avatar({ lecturer }: { lecturer: FounderLecturer }) {
  const initials = lecturer.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return lecturer.profilePic ? (
    <img className="h-12 w-12 rounded-2xl object-cover" src={lecturer.profilePic} alt={`${lecturer.name} profile`} />
  ) : (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-soft text-[14px] font-extrabold text-blue">
      {initials}
    </span>
  );
}

function MetricChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-2xl border border-border bg-surface-soft px-3 py-2">
      <span className="block text-[16px] font-extrabold text-text-primary">{value}</span>
      <span className="text-[11px] font-extrabold uppercase text-text-muted">{label}</span>
    </span>
  );
}

function StatusPill({ status }: { status: FounderLecturerStatus }) {
  const className =
    status === "Active"
      ? "bg-primary-soft text-primary-dark"
      : status === "Needs Review"
        ? "bg-orange-soft text-orange"
        : "bg-surface-soft text-text-secondary";

  return <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold ${className}`}>{status}</span>;
}

function navigateToFounderPath(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
