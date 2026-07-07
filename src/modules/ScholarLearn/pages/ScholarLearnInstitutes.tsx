import { motion } from "framer-motion";
import { Mail, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { ScholarLearnInstituteCustomizeDialog } from "../components/ScholarLearnInstituteCustomizeDialog";
import { ScholarLearnInstituteSubscriptionPanel } from "../components/ScholarLearnInstituteSubscriptionPanel";
import { useScholarLearnInstitutes } from "../hooks/useScholarLearnInstitutes";
import type {
  ScholarLearnInstitute,
  ScholarLearnInstituteStatus,
  ScholarLearnInstituteSubscriptionUpdate,
  ScholarLearnSubscriptionPlan,
} from "../types/scholarLearn.types";

const statusOptions: Array<"All" | ScholarLearnInstituteStatus> = ["All", "Active", "Trial", "Expired", "Disabled"];

export function ScholarLearnInstitutes() {
  const { error, institutes, loading, subscriptionPlans, updateSubscription } = useScholarLearnInstitutes();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ScholarLearnInstituteStatus>("All");

  const filteredInstitutes = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return institutes.filter((institute) => {
      const matchesSearch =
        !normalizedSearch ||
        institute.name.toLowerCase().includes(normalizedSearch) ||
        institute.founderName.toLowerCase().includes(normalizedSearch) ||
        institute.founderEmail.toLowerCase().includes(normalizedSearch) ||
        institute.handle.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "All" || institute.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [institutes, searchValue, statusFilter]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-border bg-surface p-6 text-[14px] font-extrabold text-text-secondary shadow-card">
        Loading institutes...
      </section>
    );
  }

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
          Platform Institutes
        </span>
        <h1 className="mt-4 text-[30px] font-extrabold text-text-primary sm:text-[34px]">Institutes</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
          Manage institute access, subscription plans, owner details, branches, and Founder workspace previews.
        </p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-orange-soft bg-orange-soft px-4 py-3 text-[13px] font-extrabold text-orange">
          Showing demo fallback data. {error}
        </p>
      ) : null}

      <section className="rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-surface-soft px-3 text-text-secondary">
            <Search aria-hidden="true" size={17} strokeWidth={2.4} />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-text-primary outline-none placeholder:text-text-muted"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search institute, owner, email, or handle"
            />
          </label>
          <select
            className="h-11 rounded-2xl border border-border bg-surface-soft px-3 text-[14px] font-extrabold text-text-primary outline-none"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "All" | ScholarLearnInstituteStatus)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All statuses" : status}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredInstitutes.map((institute) => (
          <InstituteCard
            key={institute.id}
            institute={institute}
            onSaveSubscription={updateSubscription}
            subscriptionPlans={subscriptionPlans}
          />
        ))}
      </section>
    </motion.section>
  );
}

function InstituteCard({
  institute,
  onSaveSubscription,
  subscriptionPlans,
}: {
  institute: ScholarLearnInstitute;
  onSaveSubscription: (instituteId: string, payload: ScholarLearnInstituteSubscriptionUpdate) => Promise<void>;
  subscriptionPlans: ScholarLearnSubscriptionPlan[];
}) {
  const openInstitute = () => navigateToScholarLearnPath(`/scholarlearn/institutes/${encodeURIComponent(institute.id)}`);

  return (
    <article
      className="group cursor-pointer rounded-3xl border border-border bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
      onClick={openInstitute}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={institute.name} />
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-extrabold text-text-primary">{institute.name}</h2>
            <p className="mt-1 truncate text-[13px] font-semibold text-text-secondary">{institute.handle}</p>
            <p className="mt-0.5 truncate text-[12px] font-semibold text-text-muted">{institute.founderEmail}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold ${statusClass(institute.status)}`}>
          {institute.status}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-[13px] font-semibold text-text-secondary">
        <p className="flex items-center gap-2">
          <UsersRound aria-hidden="true" size={15} strokeWidth={2.4} />
          <span>Owner: {institute.founderName}</span>
        </p>
        <p className="flex items-center gap-2">
          <Mail aria-hidden="true" size={15} strokeWidth={2.4} />
          <span className="truncate">{institute.founderEmail}</span>
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MetricChip label="PGs / Branches" value={institute.branches} />
        <MetricChip label="Students" value={institute.students} />
        <MetricChip label="Lecturers" value={institute.totalLecturers} />
      </div>

      <div className="mt-4">
        <ScholarLearnInstituteSubscriptionPanel
          institute={institute}
          onOpenOwnerPgs={openInstitute}
          onSave={onSaveSubscription}
          plans={subscriptionPlans}
        />
      </div>
      <div className="mt-3">
        <ScholarLearnInstituteCustomizeDialog institute={institute} />
      </div>
    </article>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-[14px] font-extrabold text-primary-dark">
      {initials}
    </span>
  );
}

function MetricChip({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="rounded-2xl border border-border bg-surface-soft px-3 py-2">
      <span className="block text-[16px] font-extrabold text-text-primary">{value}</span>
      <span className="text-[10px] font-extrabold uppercase leading-4 text-text-muted">{label}</span>
    </span>
  );
}

function statusClass(status: ScholarLearnInstitute["status"]) {
  if (status === "Active") return "bg-primary-soft text-primary-dark";
  if (status === "Trial") return "bg-blue-soft text-blue";
  if (status === "Expired") return "bg-orange-soft text-orange";
  return "bg-red-soft text-red";
}

function navigateToScholarLearnPath(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
