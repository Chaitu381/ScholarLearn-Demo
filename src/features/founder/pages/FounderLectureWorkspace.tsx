import { motion } from "framer-motion";
import { BookOpenCheck, ClipboardList, FileText, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";
import { getFounderLecturer } from "../data/founderLecturerData";
import type { FounderLecturer, FounderLecturerAssignment, FounderLecturerBatch, FounderLecturerTest } from "../types/founder.types";

export type FounderLectureWorkspaceView = "assignments" | "batches" | "dashboard" | "tests";

export function FounderLectureWorkspace({
  lecturerId,
  view,
}: {
  lecturerId?: string;
  view: FounderLectureWorkspaceView;
}) {
  const lecturer = getFounderLecturer(lecturerId);

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <LecturerHero lecturer={lecturer} />
      {view === "dashboard" ? <LecturerDashboardView lecturer={lecturer} /> : null}
      {view === "batches" ? <LecturerBatchesView lecturer={lecturer} /> : null}
      {view === "tests" ? <LecturerTestsView lecturer={lecturer} /> : null}
      {view === "assignments" ? <LecturerAssignmentsView lecturer={lecturer} /> : null}
    </motion.section>
  );
}

function LecturerHero({ lecturer }: { lecturer: FounderLecturer }) {
  return (
    <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar lecturer={lecturer} />
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
              Lecture Workspace
            </span>
            <h1 className="mt-3 truncate text-[30px] font-extrabold text-text-primary sm:text-[34px]">{lecturer.name}</h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
              Founder view of assigned batches, tests, assignments, attendance, and teaching performance for this lecturer.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <MiniStat label="Students" value={lecturer.totalStudents} />
          <MiniStat label="Attendance" value={`${lecturer.averageAttendance}%`} />
          <MiniStat label="Performance" value={`${lecturer.averageScore}%`} />
        </div>
      </div>
    </header>
  );
}

function LecturerDashboardView({ lecturer }: { lecturer: FounderLecturer }) {
  const stats = [
    { icon: UsersRound, label: "My Students", value: lecturer.totalStudents },
    { icon: BookOpenCheck, label: "My Batches", value: lecturer.assignedBatchesCount },
    { icon: ClipboardList, label: "Pending Reviews", value: lecturer.pendingReviews },
    { icon: FileText, label: "Tests Created", value: lecturer.tests.length },
    { icon: TrendingUp, label: "Average Attendance", value: `${lecturer.averageAttendance}%` },
    { icon: TrendingUp, label: "Average Score", value: `${lecturer.averageScore}%` },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <MetricCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
          <h2 className="text-[20px] font-extrabold text-text-primary">Student Performance Trend</h2>
          <div className="mt-5 space-y-4">
            {lecturer.batches.map((batch) => (
              <ProgressRow key={batch.batchId} label={batch.name} value={batch.performance} />
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
          <h2 className="text-[20px] font-extrabold text-text-primary">Recent Submissions</h2>
          <div className="mt-5 space-y-3">
            {lecturer.assignments.map((assignment) => (
              <ListRow key={assignment.title} title={assignment.title} meta={`${assignment.submissions} submitted • ${assignment.pending} pending`} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function LecturerBatchesView({ lecturer }: { lecturer: FounderLecturer }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {lecturer.batches.map((batch) => (
        <BatchCard key={batch.batchId} batch={batch} />
      ))}
    </section>
  );
}

function LecturerTestsView({ lecturer }: { lecturer: FounderLecturer }) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <SectionHeader title="Tests" subtitle={`Tests created by ${lecturer.name}`} count={lecturer.tests.length} />
      <div className="mt-5 space-y-3">
        {lecturer.tests.map((test) => (
          <TestRow key={test.title} test={test} />
        ))}
      </div>
    </section>
  );
}

function LecturerAssignmentsView({ lecturer }: { lecturer: FounderLecturer }) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <SectionHeader title="Assignments" subtitle={`Assignments created by ${lecturer.name}`} count={lecturer.assignments.length} />
      <div className="mt-5 space-y-3">
        {lecturer.assignments.map((assignment) => (
          <AssignmentRow key={assignment.title} assignment={assignment} />
        ))}
      </div>
    </section>
  );
}

function BatchCard({ batch }: { batch: FounderLecturerBatch }) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{batch.course}</p>
      <h2 className="mt-2 text-[19px] font-extrabold text-text-primary">{batch.name}</h2>
      <p className="mt-1 text-[14px] font-semibold text-text-secondary">{batch.subject}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Students" value={batch.students} />
        <MiniStat label="Attendance" value={`${batch.attendance}%`} />
        <MiniStat label="Score" value={`${batch.performance}%`} />
      </div>
      <p className="mt-4 rounded-2xl bg-surface-soft px-3 py-2 text-[13px] font-extrabold text-text-secondary">
        Next class: <span className="text-text-primary">{batch.nextClass}</span>
      </p>
    </article>
  );
}

function TestRow({ test }: { test: FounderLecturerTest }) {
  return (
    <div className="grid gap-3 rounded-3xl border border-border bg-surface-soft p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <h3 className="text-[16px] font-extrabold text-text-primary">{test.title}</h3>
        <p className="mt-1 text-[13px] font-semibold text-text-secondary">
          {test.batch} • {test.subject} • {test.duration}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">{test.type}</span>
        <span className="rounded-full bg-blue-soft px-3 py-1 text-[12px] font-extrabold text-blue">{test.totalMarks} marks</span>
        <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-secondary">{test.status}</span>
      </div>
    </div>
  );
}

function AssignmentRow({ assignment }: { assignment: FounderLecturerAssignment }) {
  return (
    <div className="grid gap-3 rounded-3xl border border-border bg-surface-soft p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <h3 className="text-[16px] font-extrabold text-text-primary">{assignment.title}</h3>
        <p className="mt-1 text-[13px] font-semibold text-text-secondary">
          {assignment.batch} • {assignment.subject} • Due {assignment.dueDate}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">{assignment.submissions} submitted</span>
        <span className="rounded-full bg-orange-soft px-3 py-1 text-[12px] font-extrabold text-orange">{assignment.pending} pending</span>
        <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-secondary">{assignment.status}</span>
      </div>
    </div>
  );
}

function SectionHeader({ count, subtitle, title }: { count: number; subtitle: string; title: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[21px] font-extrabold text-text-primary">{title}</h2>
        <p className="mt-1 text-[14px] text-text-secondary">{subtitle}</p>
      </div>
      <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">{count} total</span>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-[23px] font-extrabold text-text-primary">{value}</p>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="rounded-2xl border border-border bg-surface-soft px-3 py-2">
      <span className="block text-[17px] font-extrabold text-text-primary">{value}</span>
      <span className="text-[11px] font-extrabold uppercase text-text-muted">{label}</span>
    </span>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[13px] font-extrabold">
        <span className="text-text-primary">{label}</span>
        <span className="text-primary-dark">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ListRow({ meta, title }: { meta: string; title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft px-4 py-3">
      <p className="text-[14px] font-extrabold text-text-primary">{title}</p>
      <p className="mt-1 text-[12px] font-semibold text-text-secondary">{meta}</p>
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
    <img className="h-16 w-16 rounded-3xl object-cover" src={lecturer.profilePic} alt={`${lecturer.name} profile`} />
  ) : (
    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-blue-soft text-[18px] font-extrabold text-blue">
      {initials}
    </span>
  );
}
