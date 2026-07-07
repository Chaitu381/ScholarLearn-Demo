import { motion } from "framer-motion";
import { ArrowLeft, BookOpenCheck, Building2, GraduationCap, MapPin, UsersRound, type LucideIcon } from "lucide-react";
import { scholarLearnDemoDashboardData } from "../services/scholarLearnDemoData";

export function ScholarLearnInstituteFounderView({ instituteId }: { instituteId?: string }) {
  const institute =
    scholarLearnDemoDashboardData.institutes.find((item) => item.id === instituteId) ??
    scholarLearnDemoDashboardData.institutes[0];

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-surface px-4 text-[13px] font-extrabold text-text-secondary shadow-card transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
        onClick={() => navigateToScholarLearnPath("/scholarlearn/institutes")}
      >
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.5} />
        Back to Institutes
      </button>

      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
          Founder View
        </span>
        <h1 className="mt-4 text-[30px] font-extrabold text-text-primary sm:text-[34px]">{institute.name}</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
          ScholarLearn read-only view of this institute Founder workspace. Institute Founder permissions remain scoped to their own institute.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FounderMetric icon={Building2} label="Branches" value={institute.branches} />
        <FounderMetric icon={UsersRound} label="Students" value={institute.students} />
        <FounderMetric icon={GraduationCap} label="Lecturers" value={institute.totalLecturers} />
        <FounderMetric icon={BookOpenCheck} label="Batches" value={institute.activeBatches} />
      </div>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-[21px] font-extrabold text-text-primary">Owner Details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Detail label="Founder" value={institute.founderName} />
          <Detail label="Email" value={institute.founderEmail} />
          <Detail label="Plan" value={institute.plan} />
          <Detail label="Status" value={institute.status} />
          <Detail label="Average Attendance" value={`${institute.averageAttendance}%`} />
          <Detail label="Average Performance" value={`${institute.averagePerformance}%`} />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[21px] font-extrabold text-text-primary">Owner PGs / Branches</h2>
            <p className="mt-1 text-[14px] text-text-secondary">
              ScholarLearn can view all owner PGs here; Institute Founder access remains limited to this institute only.
            </p>
          </div>
          <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
            {institute.ownerPgs?.length ?? institute.branches} total
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(institute.ownerPgs ?? []).map((pg) => (
            <article
              key={pg.id}
              className="rounded-3xl border border-border bg-surface-soft p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                  <Building2 aria-hidden="true" size={18} strokeWidth={2.5} />
                </span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${pgStatusClass(pg.status)}`}>
                  {pg.status}
                </span>
              </div>
              <h3 className="mt-4 text-[17px] font-extrabold text-text-primary">{pg.name}</h3>
              <p className="mt-1 flex items-center gap-2 text-[13px] font-semibold text-text-secondary">
                <MapPin aria-hidden="true" size={14} strokeWidth={2.4} />
                {pg.city}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Detail label="Students" value={String(pg.students)} />
                <Detail label="Batches" value={String(pg.batches)} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </motion.section>
  );
}

function FounderMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <Icon aria-hidden="true" className="text-primary-dark" size={20} strokeWidth={2.5} />
      <p className="mt-3 text-[23px] font-extrabold text-text-primary">{value}</p>
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-4">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-1 break-words text-[15px] font-extrabold text-text-primary">{value}</p>
    </div>
  );
}

function pgStatusClass(status: string) {
  if (status === "Active") return "bg-primary-soft text-primary-dark";
  if (status === "Maintenance") return "bg-orange-soft text-orange";
  return "bg-red-soft text-red";
}

function navigateToScholarLearnPath(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
