import { BarChart3, Bell, CheckCircle2, UsersRound } from "lucide-react";
import { RoleProfilePage } from "../../../shared/components/profile/RoleProfilePage";

export function FounderProfile() {
  return (
    <RoleProfilePage
      roleKind="founder"
      roleLabel="Founder"
      extraContent={
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FounderSummaryCard icon={UsersRound} label="Institute Batches" value="8" helper="Owned batches" />
          <FounderSummaryCard icon={BarChart3} label="Average Performance" value="84%" helper="Across batches" />
          <FounderSummaryCard icon={Bell} label="Approval Alerts" value="Live" helper="Managed in notifications" />
          <FounderSummaryCard icon={CheckCircle2} label="History" value="Tracked" helper="Profile menu only" />
        </div>
      }
    />
  );
}

function FounderSummaryCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string;
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
          <p className="mt-3 text-[28px] font-extrabold leading-none text-text-primary">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-5 text-text-secondary">{helper}</p>
    </article>
  );
}
