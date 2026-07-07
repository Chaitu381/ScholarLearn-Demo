import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpenCheck,
  Building2,
  CalendarDays,
  GraduationCap,
  Palette,
  Settings,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FounderBatchCard } from "../../../features/founder/components/FounderBatchCard";
import { FounderPerformanceGraphs } from "../../../features/founder/components/FounderPerformanceGraphs";
import { FounderStatsCards } from "../../../features/founder/components/FounderStatsCards";
import type { FounderBatch, FounderStat } from "../../../features/founder/types/founder.types";
import { ScholarLearnInstituteCustomizeDialog } from "../components/ScholarLearnInstituteCustomizeDialog";
import { ScholarLearnInstituteSubscriptionPanel } from "../components/ScholarLearnInstituteSubscriptionPanel";
import {
  getScholarLearnSubscriptionPlans,
  updateScholarLearnInstituteSubscription,
} from "../services/scholarLearnApi";
import { scholarLearnDemoDashboardData } from "../services/scholarLearnDemoData";
import type {
  ScholarLearnInstitute,
  ScholarLearnInstituteSubscriptionUpdate,
  ScholarLearnSubscriptionPlan,
} from "../types/scholarLearn.types";

export function ScholarLearnInstituteDetail({ instituteId }: { instituteId?: string }) {
  const selectedInstitute = useMemo(
    () => scholarLearnDemoDashboardData.institutes.find((item) => item.id === instituteId) ?? scholarLearnDemoDashboardData.institutes[0],
    [instituteId],
  );
  const [institute, setInstitute] = useState(selectedInstitute);
  const [subscriptionPlans, setSubscriptionPlans] = useState<ScholarLearnSubscriptionPlan[]>([]);
  const batches = buildFounderBatches(institute);
  const courses = buildCourses(institute);
  const students = buildStudents(institute);
  const lecturers = buildLecturers(institute);
  const stats = buildOverviewStats(institute);

  useEffect(() => {
    setInstitute(selectedInstitute);
  }, [selectedInstitute]);

  useEffect(() => {
    let active = true;

    getScholarLearnSubscriptionPlans().then((plans) => {
      if (active) {
        setSubscriptionPlans(plans);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const saveSubscription = async (instituteIdToUpdate: string, payload: ScholarLearnInstituteSubscriptionUpdate) => {
    const updatedInstitute = await updateScholarLearnInstituteSubscription(instituteIdToUpdate, payload);
    setInstitute(updatedInstitute);
  };

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

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
              Institute Detail
            </span>
            <h1 className="mt-4 text-[30px] font-extrabold text-text-primary sm:text-[36px]">{institute.name}</h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
              ScholarLearn platform-owner view of this institute. This mirrors the Institute Founder dashboard experience
              while keeping platform permissions separate from the Founder account.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-surface-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-extrabold uppercase text-text-muted">Subscription Status</p>
                <p className="mt-2 text-[22px] font-extrabold text-text-primary">{institute.plan}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${statusClass(institute.status)}`}>
                {institute.status}
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-[12px] font-extrabold text-text-secondary">
              <DetailLine label="Owner" value={institute.founderName} />
              <DetailLine label="Email" value={institute.founderEmail} />
            </div>
            <div className="mt-4">
              <ScholarLearnInstituteSubscriptionPanel
                institute={institute}
                onOpenOwnerPgs={() =>
                  navigateToScholarLearnPath(`/scholarlearn/institutes/${encodeURIComponent(institute.id)}/founder-view`)
                }
                onSave={saveSubscription}
                plans={subscriptionPlans}
              />
            </div>
          </div>
        </div>
      </section>

      <FounderStatsCards stats={stats} />

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard icon={BookOpenCheck} title="Courses" subtitle="Programs available in this institute">
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <article key={course.name} className="rounded-2xl border border-border bg-surface-soft p-4">
                <h3 className="text-[16px] font-extrabold text-text-primary">{course.name}</h3>
                <p className="mt-1 text-[13px] font-semibold text-text-secondary">{course.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip label={`${course.batches} batches`} />
                  <Chip label={`${course.students} students`} />
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Settings} title="Settings / Customization" subtitle="Platform-owner shortcuts for this institute">
          <div className="grid gap-3">
            <ScholarLearnInstituteCustomizeDialog institute={institute} />
            <Shortcut icon={Palette} title="Branding" description="Logo, colors, public institute profile, and PG naming." />
            <Shortcut icon={ShieldCheck} title="Access Control" description="Founder account status, subscription access, and disabled state." />
            <Shortcut icon={CalendarDays} title="Subscription" description="Plan, start date, expiry date, and renewal reminders." />
          </div>
        </SectionCard>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <SectionHeading title="Batches" subtitle="Founder-style batch cards for this institute" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {batches.map((batch) => (
            <FounderBatchCard key={batch.batchId} batch={batch} />
          ))}
        </div>
      </section>

      <FounderPerformanceGraphs batches={batches} />

      <section className="grid gap-5 xl:grid-cols-2">
        <SectionCard icon={UsersRound} title="Students" subtitle="Sample student rollup for this institute">
          <div className="space-y-3">
            {students.map((student) => (
              <PersonRow key={student.email} name={student.name} meta={student.email} value={`${student.attendance}% attendance`} />
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={GraduationCap} title="Lecturers" subtitle="Institute lecturer assignment summary">
          <div className="space-y-3">
            {lecturers.map((lecturer) => (
              <PersonRow key={lecturer.email} name={lecturer.name} meta={lecturer.email} value={lecturer.subject} />
            ))}
          </div>
        </SectionCard>
      </section>
    </motion.section>
  );
}

function buildOverviewStats(institute: ScholarLearnInstitute): FounderStat[] {
  return [
    {
      description: "PGs and branches under this institute",
      icon: Building2,
      label: "Branches",
      tone: "primary",
      value: String(institute.branches),
    },
    {
      description: "Students across all active PGs",
      icon: UsersRound,
      label: "Students",
      tone: "blue",
      value: String(institute.students),
    },
    {
      description: "Lecturers assigned in this institute",
      icon: GraduationCap,
      label: "Lecturers",
      tone: "yellow",
      value: String(institute.totalLecturers),
    },
    {
      description: "Average attendance across branches",
      icon: BookOpenCheck,
      label: "Attendance",
      tone: "orange",
      value: `${institute.averageAttendance}%`,
    },
    {
      description: "Test and analytics performance",
      icon: TrendingUp,
      label: "Performance",
      tone: "primary",
      value: `${institute.averagePerformance}%`,
    },
    {
      description: "Subscription days remaining",
      icon: CalendarDays,
      label: "Remaining",
      tone: institute.activeRemainingDays <= 30 ? "red" : "primary",
      value: `${institute.activeRemainingDays}d`,
    },
  ];
}

function buildFounderBatches(institute: ScholarLearnInstitute): FounderBatch[] {
  const pgs = institute.ownerPgs?.length
    ? institute.ownerPgs
    : [
        {
          batches: institute.activeBatches,
          city: institute.city,
          id: `${institute.id}-main`,
          name: `${institute.name} Main PG`,
          status: institute.disabled ? "Disabled" : "Active",
          students: institute.students,
        },
      ];

  return pgs.map((pg, index) => ({
    assignedLecturers: [`Lecturer ${index + 1}`, `Mentor ${index + 1}`],
    attendance: Math.max(0, Math.min(100, institute.averageAttendance - index * 2)),
    batchId: pg.id,
    course: index % 2 === 0 ? "Java Full Stack" : "Python Full Stack",
    name: pg.name.replace(" PG Campus", ""),
    nextClass: pg.status === "Disabled" ? "Access disabled" : index === 0 ? "Today, 2:00 PM" : "Tomorrow, 11:00 AM",
    score: Math.max(0, Math.min(100, institute.averagePerformance - index * 3)),
    status: pg.status === "Disabled" ? "Needs Attention" : pg.status === "Maintenance" ? "Needs Attention" : "Active",
    students: pg.students,
    subject: index % 2 === 0 ? "Spring Boot" : "Python APIs",
  }));
}

function buildCourses(institute: ScholarLearnInstitute) {
  return [
    {
      batches: Math.max(1, Math.round(institute.activeBatches * 0.42)),
      description: "Backend, React, database, tests, and coding practice.",
      name: "Java Full Stack",
      students: Math.round(institute.students * 0.44),
    },
    {
      batches: Math.max(1, Math.round(institute.activeBatches * 0.28)),
      description: "Python APIs, SQL, data structures, and deployment basics.",
      name: "Python Full Stack",
      students: Math.round(institute.students * 0.31),
    },
    {
      batches: Math.max(1, Math.round(institute.activeBatches * 0.18)),
      description: "React, Node.js, MongoDB, Express, and project work.",
      name: "MERN Stack",
      students: Math.round(institute.students * 0.25),
    },
  ];
}

function buildStudents(institute: ScholarLearnInstitute) {
  return [
    { attendance: institute.averageAttendance + 3, email: `top.student@${institute.id}.me`, name: "Chaitanya Pilla" },
    { attendance: institute.averageAttendance, email: `learner.one@${institute.id}.me`, name: "Anika Rao" },
    { attendance: Math.max(0, institute.averageAttendance - 8), email: `learner.two@${institute.id}.me`, name: "Rahul Menon" },
  ];
}

function buildLecturers(institute: ScholarLearnInstitute) {
  return [
    { email: `java.mentor@${institute.id}.me`, name: "Kavya Rao", subject: "Java Full Stack" },
    { email: `react.mentor@${institute.id}.me`, name: "Neeraj Iyer", subject: "React / Node.js" },
    { email: `python.mentor@${institute.id}.me`, name: "Megha Singh", subject: "Python APIs" },
  ];
}

function SectionCard({
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
          <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="text-[21px] font-extrabold text-text-primary">{title}</h2>
          <p className="mt-1 text-[14px] leading-6 text-text-secondary">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SectionHeading({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div>
      <h2 className="text-[21px] font-extrabold text-text-primary">{title}</h2>
      <p className="mt-1 text-[14px] leading-6 text-text-secondary">{subtitle}</p>
    </div>
  );
}

function PersonRow({ meta, name, value }: { meta: string; name: string; value: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-soft p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-soft text-[13px] font-extrabold text-blue">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-extrabold text-text-primary">{name}</p>
          <p className="truncate text-[12px] font-semibold text-text-secondary">{meta}</p>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
        {value}
      </span>
    </article>
  );
}

function Shortcut({ description, icon: Icon, title }: { description: string; icon: LucideIcon; title: string }) {
  return (
    <button
      type="button"
      className="rounded-2xl border border-border bg-surface-soft p-4 text-left transition hover:border-primary hover:bg-primary-soft"
    >
      <Icon aria-hidden="true" className="text-primary-dark" size={18} strokeWidth={2.5} />
      <p className="mt-3 text-[15px] font-extrabold text-text-primary">{title}</p>
      <p className="mt-1 text-[13px] leading-5 text-text-secondary">{description}</p>
    </button>
  );
}

function Chip({ label }: { label: string }) {
  return <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-secondary">{label}</span>;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="text-text-primary">{value}</span>
    </p>
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
