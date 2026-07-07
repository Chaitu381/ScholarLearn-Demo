import { Clock3, GraduationCap } from "lucide-react";
import { AdminPreview } from "../../../components/approval-demo/AdminPreview";
import { AttendanceMarkerPreview } from "../../../components/approval-demo/AttendanceMarkerPreview";
import { InstituteFounderPreview } from "../../../components/approval-demo/InstituteFounderPreview";
import { JobManagerPreview } from "../../../components/approval-demo/JobManagerPreview";
import { JuniorLecturerPreview } from "../../../components/approval-demo/JuniorLecturerPreview";
import { LecturerPreview } from "../../../components/approval-demo/LecturerPreview";
import { ScholarLearnPreview } from "../../../components/approval-demo/ScholarLearnPreview";
import { StudentPreview } from "../../../components/approval-demo/StudentPreview";
import {
  getAuthApprovalStatus,
  type AuthSession,
  type AuthUser,
} from "../../../lib/authSession";
import {
  getPendingApprovalUser,
  type PendingApprovalRole,
  type PendingApprovalUser,
} from "../../../lib/demoAuth";

const roleLabels: Record<PendingApprovalRole, string> = {
  ADMIN: "Admin",
  ATTENDANCE_MARKER: "Attendance Marker",
  INSTITUTE_FOUNDER: "Founder",
  JOB_MANAGER: "Job Manager",
  JUNIOR_LECTURER: "Junior Lecturer",
  LECTURER: "Senior Lecturer",
  STUDENT: "Student",
};

const previewComponents = {
  ADMIN: AdminPreview,
  ATTENDANCE_MARKER: AttendanceMarkerPreview,
  INSTITUTE_FOUNDER: InstituteFounderPreview,
  JOB_MANAGER: JobManagerPreview,
  JUNIOR_LECTURER: JuniorLecturerPreview,
  LECTURER: LecturerPreview,
  SCHOLARLEARN: ScholarLearnPreview,
  STUDENT: StudentPreview,
};

export function ApprovalPendingPage({ session = null }: { session?: AuthSession | null }) {
  const pendingUser =
    typeof window === "undefined" ? createPendingUserFromSession(session) : getPendingApprovalUser() ?? createPendingUserFromSession(session);
  const approverLabel = pendingUser?.requestedRole === "INSTITUTE_FOUNDER" ? "ScholarLearn" : "Institute Founder";

  return (
    <main className="min-h-screen bg-background p-4 text-text-primary sm:p-6 lg:p-8">
      <section className="mx-auto max-w-[1120px]">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface px-5 py-4 shadow-card sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
              <GraduationCap aria-hidden="true" size={23} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-extrabold">ScholarLearn</p>
              <p className="text-[12px] font-bold text-text-secondary">Registration review</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[42fr_58fr]">
          <article className="rounded-3xl border border-border bg-surface p-6 shadow-card">
            <span className="inline-flex h-10 items-center gap-2 rounded-2xl bg-yellow-soft px-4 text-[13px] font-extrabold text-orange">
              <Clock3 aria-hidden="true" size={17} strokeWidth={2.5} />
              Wait for approval
            </span>

            <h1 className="mt-5 text-[32px] font-extrabold leading-tight text-text-primary">
              Your account request is pending
            </h1>
            <p className="mt-3 text-[14px] font-semibold leading-6 text-text-secondary">
              Dashboard actions stay locked until {approverLabel} reviews and activates this account.
            </p>
            <div className="mt-4 rounded-2xl border border-yellow-soft bg-yellow-soft px-4 py-3">
              <p className="text-[13px] font-extrabold leading-6 text-text-primary">
                Your account is pending approval. Once {approverLabel} approves your account, you will get access to
                your dashboard.
              </p>
              <p className="mt-1 text-[12px] font-bold leading-5 text-text-secondary">
                For now, demo users are treated as APPROVED. Newly registered users stay PENDING_APPROVAL here until
                {approverLabel} approval is completed.
              </p>
            </div>

            {pendingUser ? (
              <PendingUserDetails pendingUser={pendingUser} />
            ) : (
              <div className="mt-6 rounded-2xl border border-border bg-surface-soft p-5">
                <p className="text-[15px] font-extrabold text-text-primary">No pending registration found</p>
                <p className="mt-2 text-[13px] font-semibold leading-6 text-text-secondary">
                  Submit the Register form again to create a temporary pending approval request.
                </p>
              </div>
            )}
          </article>

          {pendingUser ? <RolePreview requestedRole={pendingUser.requestedRole} /> : <EmptyRolePreview />}
        </section>
      </section>
    </main>
  );
}

function createPendingUserFromSession(session: AuthSession | null): PendingApprovalUser | null {
  if (!session || getAuthApprovalStatus(session) !== "PENDING_APPROVAL") {
    return null;
  }

  const user = session.user;
  const displayName = readUserString(user.displayName) || readUserString(user.name) || user.email;
  const [firstName = "Pending", ...remainingNameParts] = displayName.split(" ").filter(Boolean);

  return {
    approvalStatus: "PENDING_APPROVAL",
    email: user.email,
    firstName,
    lastName: remainingNameParts.join(" ") || "User",
    phoneNumber: readUserString(user.phoneNumber) || readUserString(user.phone) || "Not provided",
    requestedAt: session.loginTimestamp,
    requestedRole: session.role as PendingApprovalRole,
  };
}

function readUserString(value: AuthUser[keyof AuthUser]) {
  return typeof value === "string" ? value.trim() : "";
}

function RolePreview({ requestedRole }: { requestedRole: PendingApprovalRole }) {
  const PreviewComponent = previewComponents[requestedRole];
  return <PreviewComponent />;
}

function EmptyRolePreview() {
  return (
    <article className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">Role preview</p>
      <h2 className="mt-2 text-[24px] font-extrabold text-text-primary">Pending role access preview</h2>
      <p className="mt-3 text-[14px] font-semibold leading-6 text-text-secondary">
        Submit the Register form to see a role-based preview. This demo preview stays separate from the real dashboards.
      </p>
    </article>
  );
}

function PendingUserDetails({ pendingUser }: { pendingUser: PendingApprovalUser }) {
  const detailRows = [
    { label: "First name", value: pendingUser.firstName },
    { label: "Last name", value: pendingUser.lastName },
    { label: "Email", value: pendingUser.email },
    { label: "Phone number", value: pendingUser.phoneNumber },
    { label: "Requested role", value: roleLabels[pendingUser.requestedRole] },
    { label: "Approval status", value: pendingUser.approvalStatus },
  ];

  return (
    <div className="mt-6 grid gap-3">
      {detailRows.map((detail) => (
        <div
          key={detail.label}
          className="flex flex-col gap-1 rounded-2xl border border-border bg-surface-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="text-[12px] font-extrabold uppercase text-text-muted">{detail.label}</span>
          <span className="break-words text-[14px] font-extrabold text-text-primary">{detail.value}</span>
        </div>
      ))}
    </div>
  );
}
