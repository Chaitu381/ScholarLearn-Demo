import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { ActionButton } from "../../../../shared/components/ui/ActionButton";
import { MetricPill } from "../../../../shared/components/ui/MetricPill";
import type { DailyProgress, StudentProfile } from "../../types/student.types";

type StudentWelcomeHeroProps = {
  profile: StudentProfile;
  progress?: DailyProgress;
};

type TimetableView = "today" | "week";
type ClassStatus = "Upcoming" | "Completed" | "Live";

type TimetableDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type TimetableClass = {
  id: string;
  mode: string;
  status: ClassStatus;
  subject: string;
  time: string;
};

const weekDays: TimetableDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const weeklyTimetable: Record<TimetableDay, TimetableClass[]> = {
  Monday: [
    {
      id: "mon-java",
      time: "09:30 AM",
      subject: "Java Collections",
      mode: "Room 204",
      status: "Completed",
    },
    {
      id: "mon-react",
      time: "02:00 PM",
      subject: "React State",
      mode: "Lab 2",
      status: "Upcoming",
    },
  ],
  Tuesday: [
    {
      id: "tue-mysql",
      time: "10:00 AM",
      subject: "MySQL Joins",
      mode: "Room 102",
      status: "Upcoming",
    },
    {
      id: "tue-aptitude",
      time: "03:30 PM",
      subject: "Aptitude Practice",
      mode: "Online",
      status: "Upcoming",
    },
  ],
  Wednesday: [
    {
      id: "wed-spring",
      time: "09:30 AM",
      subject: "Spring Security",
      mode: "Room 204",
      status: "Upcoming",
    },
    {
      id: "wed-coding",
      time: "04:00 PM",
      subject: "Coding Lab",
      mode: "Lab 1",
      status: "Upcoming",
    },
  ],
  Thursday: [
    {
      id: "thu-react",
      time: "11:00 AM",
      subject: "React Hooks",
      mode: "Room 203",
      status: "Upcoming",
    },
    {
      id: "thu-python",
      time: "02:30 PM",
      subject: "Python Revision",
      mode: "Online",
      status: "Upcoming",
    },
  ],
  Friday: [
    {
      id: "fri-project",
      time: "10:30 AM",
      subject: "Project Review",
      mode: "Lab 3",
      status: "Upcoming",
    },
    {
      id: "fri-test",
      time: "04:00 PM",
      subject: "Weekly Test",
      mode: "Exam Hall",
      status: "Upcoming",
    },
  ],
  Saturday: [
    {
      id: "sat-mock",
      time: "10:00 AM",
      subject: "Mock Interview",
      mode: "Seminar Hall",
      status: "Upcoming",
    },
  ],
  Sunday: [
    {
      id: "sun-review",
      time: "10:00 AM",
      subject: "Test Review",
      mode: "Online",
      status: "Completed",
    },
    {
      id: "sun-code",
      time: "05:00 PM",
      subject: "Coding Practice",
      mode: "CodeConnect",
      status: "Live",
    },
  ],
};

const statusClass: Record<ClassStatus, string> = {
  Completed: "bg-primary-soft text-primary-dark",
  Live: "bg-red-soft text-red",
  Upcoming: "bg-blue-soft text-blue",
};

export function StudentWelcomeHero({
  profile,
  progress,
}: StudentWelcomeHeroProps) {
  const [timetableView, setTimetableView] = useState<TimetableView>("today");

  const safeProgress = {
    attendanceStatus:
      progress?.attendanceStatus ?? "Attendance status unavailable",
    codingStreakDays: progress?.codingStreakDays ?? 0,
  };

  const today = useMemo<TimetableDay>(() => {
    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(new Date());

    return weekDays.includes(weekday as TimetableDay)
      ? (weekday as TimetableDay)
      : "Monday";
  }, []);

  const [selectedWeekDay, setSelectedWeekDay] = useState<TimetableDay>(today);

  const selectedTimetable =
    timetableView === "today"
      ? weeklyTimetable[today]
      : weeklyTimetable[selectedWeekDay];

  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-7"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="absolute right-10 top-10 hidden lg:block">
        <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-primary-soft bg-primary-soft shadow-card">
          <img
            src={profile.photoUrl ?? "/images/student-avatar.png"}
            alt={`${profile.name} profile`}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="relative max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-[13px] font-extrabold text-primary-dark">
          <Sparkles aria-hidden="true" size={16} strokeWidth={2.5} />
          You are on track this week
        </div>

        <h1 className="text-[30px] font-extrabold leading-tight text-text-primary sm:text-[34px]">
          Welcome back, {profile.name}
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-text-secondary">
          Complete today&apos;s coding challenge and review weak topics to
          improve your rank.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <MetricPill label="Course" value={profile.course} tone="blue" />
          <MetricPill label="Batch" value={profile.batch} tone="yellow" />
          <MetricPill label="Mentor" value={profile.mentor} tone="neutral" />
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ActionButton
            icon={ArrowRight}
            onClick={() => {
              window.location.hash = "coding-practice";
            }}
          >
            Continue Learning
          </ActionButton>

          <ActionButton
            icon={BarChart3}
            variant="secondary"
            onClick={() => {
              window.location.hash = "analytics";
            }}
          >
            View Report
          </ActionButton>

          <div className="mt-1 rounded-2xl bg-primary-soft p-3 text-primary-dark">
            <p className="flex items-center gap-3 text-[13px] font-extrabold">
              <Target aria-hidden="true" size={16} strokeWidth={2.5} />
              {safeProgress.attendanceStatus}
            </p>

            <p className="mt-1 text-[13px] font-semibold">
              Coding streak is active for {safeProgress.codingStreakDays} days.
            </p>
          </div>
        </div>
      </div>

      <section className="relative mt-5 rounded-2xl border border-border bg-surface-soft p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase text-text-muted">
              <CalendarDays aria-hidden="true" size={15} strokeWidth={2.5} />
              Student timetable
            </p>

            <h2 className="mt-1 text-[17px] font-extrabold text-text-primary">
              {timetableView === "today"
                ? `${today}'s classes`
                : `${selectedWeekDay}'s schedule`}
            </h2>
          </div>

          <div className="grid grid-cols-2 rounded-xl border border-border bg-surface p-1">
            {(["today", "week"] as TimetableView[]).map((view) => (
              <button
                key={view}
                type="button"
                aria-pressed={timetableView === view}
                className={
                  timetableView === view
                    ? "h-8 rounded-lg bg-primary-soft px-3 text-[12px] font-extrabold text-primary-dark"
                    : "h-8 rounded-lg px-3 text-[12px] font-extrabold text-text-secondary transition hover:text-text-primary"
                }
                onClick={() => {
                  setTimetableView(view);

                  if (view === "today") {
                    setSelectedWeekDay(today);
                  }
                }}
              >
                {view === "today" ? "Today" : "This Week"}
              </button>
            ))}
          </div>
        </div>

        {timetableView === "week" ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {weekDays.map((day) => (
              <button
                key={day}
                type="button"
                aria-pressed={selectedWeekDay === day}
                className={
                  selectedWeekDay === day
                    ? "h-9 shrink-0 rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white"
                    : "h-9 shrink-0 rounded-xl border border-border bg-surface px-4 text-[12px] font-extrabold text-text-secondary transition hover:text-text-primary"
                }
                onClick={() => setSelectedWeekDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {selectedTimetable.map((classItem) => (
            <article
              key={classItem.id}
              className="grid gap-2 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[96px_minmax(0,1fr)_auto]"
            >
              <p className="flex items-center gap-2 text-[13px] font-extrabold text-text-primary">
                <Clock3
                  aria-hidden="true"
                  size={15}
                  strokeWidth={2.5}
                  className="text-text-muted"
                />
                {classItem.time}
              </p>

              <div className="min-w-0">
                <p className="truncate text-[14px] font-extrabold text-text-primary">
                  {classItem.subject}
                </p>

                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-bold text-text-secondary">
                  <MapPin aria-hidden="true" size={13} strokeWidth={2.5} />
                  {classItem.mode}
                </p>
              </div>

              <span
                className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-[11px] font-extrabold ${statusClass[classItem.status]}`}
              >
                {classItem.status}
              </span>
            </article>
          ))}
        </div>
      </section>
    </motion.section>
  );
}