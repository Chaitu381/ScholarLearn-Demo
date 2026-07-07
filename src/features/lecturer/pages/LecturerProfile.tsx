import { BookOpenCheck, GraduationCap, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { RoleProfilePage } from "../../../shared/components/profile/RoleProfilePage";
import { LecturerBadge, LecturerCard } from "../components/LecturerPrimitives";

const teachingSummary = {
  batchesAssigned: 5,
  subjectsTaught: ["Spring Boot", "React", "Java", "MySQL"],
  totalStudents: 164,
};

export function LecturerProfile() {
  return (
    <RoleProfilePage
      roleKind="lecturer"
      roleLabel="Lecturer"
      extraContent={
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard icon={BookOpenCheck} label="Subjects Taught" value={teachingSummary.subjectsTaught.length} />
            <SummaryCard icon={GraduationCap} label="Batches Assigned" value={teachingSummary.batchesAssigned} />
            <SummaryCard icon={UsersRound} label="Total Students" value={teachingSummary.totalStudents} />
          </div>

          <LecturerCard title="Teaching Details" description="Current teaching assignment summary for this lecturer workspace.">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailBlock label="Subjects Taught" value={teachingSummary.subjectsTaught.join(", ")} />
              <DetailBlock label="Batches Assigned" value={`${teachingSummary.batchesAssigned} active batches`} />
              <DetailBlock label="Total Students" value={`${teachingSummary.totalStudents} learners`} />
              <DetailBlock label="Workspace Role" value={<LecturerBadge label="Lecturer" tone="primary" />} />
            </div>
          </LecturerCard>
        </div>
      }
    />
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof UsersRound; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
      </span>
      <p className="mt-4 text-[26px] font-extrabold leading-none text-text-primary">{value}</p>
      <p className="mt-2 text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-soft p-4">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
      <div className="mt-2 text-[15px] font-extrabold text-text-primary">{value}</div>
    </div>
  );
}
