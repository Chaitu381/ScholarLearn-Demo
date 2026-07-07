import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  Network,
  Target,
  X,
  type LucideIcon,
} from "lucide-react";
import { PageTitle } from "../../../shared/components/ui/PageTitle";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import {
  FilterTabs,
  MetricCard,
  MiniProgress,
  PageCard,
  StudentPage,
  ToneBadge,
} from "../components/StudentPagePrimitives";
import { useStudentDashboard } from "../hooks/useStudentDashboard";
import {
  getSubjectNotes,
  getSubjectTopicFlow,
} from "../services/subjectResourceService";
import type {
  SubjectNote,
  SubjectProgress,
  SubjectStatus,
  SubjectTopicFlowItem,
} from "../types/student.types";

type SubjectFilter = "All" | "Strong" | "Needs Improvement" | "Low Attendance";

const subjectFilters: SubjectFilter[] = [
  "All",
  "Strong",
  "Needs Improvement",
  "Low Attendance",
];

const statusTone: Record<
  SubjectStatus,
  "primary" | "blue" | "yellow" | "red"
> = {
  Strong: "primary",
  Improving: "blue",
  "Needs Focus": "yellow",
  "Low Attendance": "red",
};

export function StudentSubjects() {
  const { subjects } = useStudentDashboard();

  const [activeFilter, setActiveFilter] = useState<SubjectFilter>("All");
  const [notesSubject, setNotesSubject] = useState<SubjectProgress | null>(
    null,
  );
  const [flowSubject, setFlowSubject] = useState<SubjectProgress | null>(null);

  const filteredSubjects = useMemo(
    () => filterSubjects(subjects, activeFilter),
    [subjects, activeFilter],
  );

  const strongSubjects = subjects.filter(
    (subject) => subject.status === "Strong",
  ).length;

  const lowAttendance = subjects.filter(
    (subject) => subject.attendance < 90 || subject.status === "Low Attendance",
  ).length;

  const averageProgress = subjects.length
    ? Math.round(
        subjects.reduce((sum, subject) => sum + subject.progress, 0) /
          subjects.length,
      )
    : 0;

  const averageScore = subjects.length
    ? Math.round(
        subjects.reduce((sum, subject) => sum + subject.testAverage, 0) /
          subjects.length,
      )
    : 0;

  return (
    <StudentPage>
      <PageTitle
        title="Subjects"
        description="Track subject progress, attendance, test averages, weak topics, and next learning actions."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={BookOpen}
          label="Subjects"
          value={subjects.length}
          helper="Active learning tracks"
          tone="primary"
        />

        <MetricCard
          icon={Target}
          label="Average Progress"
          value={`${averageProgress}%`}
          helper="Across all subjects"
          tone="blue"
        />

        <MetricCard
          icon={ClipboardCheck}
          label="Average Score"
          value={`${averageScore}%`}
          helper="Current test average"
          tone="yellow"
        />

        <MetricCard
          icon={CalendarCheck}
          label="Low Attendance"
          value={lowAttendance}
          helper={`${strongSubjects} subjects are strong`}
          tone="orange"
        />
      </div>

      <PageCard
        title="Subject Overview"
        description="Use filters to review strong subjects, improvement areas, and attendance recovery needs."
        action={
          <FilterTabs
            active={activeFilter}
            items={[...subjectFilters]}
            onChange={(item: string) => setActiveFilter(item as SubjectFilter)}
          />
        }
      >
        {filteredSubjects.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onOpenNotes={setNotesSubject}
                onOpenTopicFlow={setFlowSubject}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No subjects found"
            description="No subjects match the selected filter."
          />
        )}
      </PageCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,55fr)_minmax(320px,45fr)]">
        <PageCard
          title="Subject Progress List"
          description="Progress, current module, and next milestones."
        >
          <div className="space-y-4">
            {filteredSubjects.map((subject) => (
              <article
                key={subject.id}
                className="rounded-2xl bg-surface-soft p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[16px] font-extrabold text-text-primary">
                        {subject.name}
                      </h3>

                      <ToneBadge
                        label={subject.status}
                        tone={statusTone[subject.status]}
                      />
                    </div>

                    <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                      {subject.currentModule} · Next: {subject.nextMilestone}
                    </p>
                  </div>

                  <p className="text-[13px] font-bold text-text-secondary">
                    {subject.instructor}
                  </p>
                </div>

                <div className="mt-4">
                  <MiniProgress
                    label="Subject progress"
                    value={subject.progress}
                    tone={subject.tone}
                  />
                </div>
              </article>
            ))}
          </div>
        </PageCard>

        <PageCard
          title="Next Classes & Tasks"
          description="Upcoming work that keeps each subject moving."
        >
          <div className="space-y-3">
            {filteredSubjects.map((subject) => (
              <article
                key={subject.id}
                className="rounded-2xl bg-surface-soft p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-extrabold text-text-primary">
                      {subject.name}
                    </h3>

                    <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                      {subject.nextTask}
                    </p>
                  </div>

                  <ToneBadge label={subject.nextClass} tone="neutral" />
                </div>
              </article>
            ))}
          </div>
        </PageCard>
      </div>

      {notesSubject ? (
        <SubjectNotesDialog
          subject={notesSubject}
          onClose={() => setNotesSubject(null)}
        />
      ) : null}

      {flowSubject ? (
        <SubjectTopicFlowDialog
          subject={flowSubject}
          onClose={() => setFlowSubject(null)}
        />
      ) : null}
    </StudentPage>
  );
}

function filterSubjects(
  subjects: SubjectProgress[],
  activeFilter: SubjectFilter,
) {
  if (activeFilter === "All") {
    return subjects;
  }

  if (activeFilter === "Strong") {
    return subjects.filter((subject) => subject.status === "Strong");
  }

  if (activeFilter === "Needs Improvement") {
    return subjects.filter(
      (subject) =>
        subject.status === "Improving" ||
        subject.status === "Needs Focus" ||
        subject.progress < 75 ||
        subject.testAverage < 80,
    );
  }

  return subjects.filter(
    (subject) =>
      subject.status === "Low Attendance" || subject.attendance < 90,
  );
}

function SubjectCard({
  onOpenNotes,
  onOpenTopicFlow,
  subject,
}: {
  onOpenNotes: (subject: SubjectProgress) => void;
  onOpenTopicFlow: (subject: SubjectProgress) => void;
  subject: SubjectProgress;
}) {
  return (
    <article className="rounded-3xl border border-border bg-surface-soft p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-extrabold text-text-primary">
            {subject.name}
          </h3>

          <p className="mt-1 text-[13px] font-semibold text-text-secondary">
            {subject.instructor}
          </p>

          <p className="mt-1 text-[13px] text-text-secondary">
            Weak topic: {subject.weakTopic}
          </p>
        </div>

        <ToneBadge label={subject.status} tone={statusTone[subject.status]} />
      </div>

      <div className="mt-5 space-y-4">
        <MiniProgress
          label="Progress"
          value={subject.progress}
          tone={subject.tone}
        />

        <MiniProgress
          label="Attendance"
          value={subject.attendance}
          tone={subject.attendance >= 90 ? "primary" : "orange"}
        />

        <MiniProgress
          label="Average score"
          value={subject.testAverage}
          tone={subject.testAverage >= 85 ? "primary" : "orange"}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <SubjectActionButton
          icon={FileText}
          label="Notes"
          onClick={() => onOpenNotes(subject)}
        />

        <SubjectActionButton
          icon={Network}
          label="Open"
          onClick={() => onOpenTopicFlow(subject)}
          variant="primary"
        />
      </div>
    </article>
  );
}

function SubjectActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "secondary",
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "primary"
          ? "inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-[12px] font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary-dark"
          : "inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-3 text-[12px] font-extrabold text-text-secondary transition hover:-translate-y-0.5 hover:text-text-primary"
      }
    >
      <Icon aria-hidden="true" size={15} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}

function SubjectNotesDialog({
  onClose,
  subject,
}: {
  onClose: () => void;
  subject: SubjectProgress;
}) {
  const [notes, setNotes] = useState<SubjectNote[]>([]);
  const [topics, setTopics] = useState<SubjectTopicFlowItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    Promise.all([getSubjectNotes(subject), getSubjectTopicFlow(subject)])
      .then(([noteItems, topicItems]) => {
        if (active) {
          setNotes(noteItems);
          setTopics(topicItems);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load subject notes.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [subject]);

  return (
    <SubjectDialogShell
      description="All topics, uploaded materials, weak-topic details, and notes for this subject."
      icon={FileText}
      onClose={onClose}
      subject={subject}
      title="Subject Notes"
    >
      {loading ? <SubjectResourceSkeleton /> : null}

      {!loading && error ? <SubjectResourceError message={error} /> : null}

      {!loading && !error ? (
        <div className="space-y-5">
          <SubjectNotesSummary subject={subject} />

          <section className="rounded-2xl border border-border bg-surface-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-extrabold text-text-primary">
                  Topics in {subject.name}
                </h3>

                <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                  Topic path and progress for this subject.
                </p>
              </div>

              <ToneBadge
                label={`${topics.length || 0} topics`}
                tone="neutral"
              />
            </div>

            {topics.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {topics.map((topic, index) => (
                  <TopicMiniCard
                    key={String(topic.id ?? `${subject.id}-topic-${index}`)}
                    topic={topic}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={Network}
                  title="No topics available"
                  description="Topic data will appear here when the backend provides it."
                />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-extrabold text-text-primary">
                  Uploaded Notes
                </h3>

                <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                  Open lecturer notes and study material for this subject.
                </p>
              </div>

              <ToneBadge label={`${notes.length || 0} files`} tone="blue" />
            </div>

            {notes.length ? (
              <div className="mt-4 space-y-3">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={FileText}
                  title="No notes available yet"
                  description="No lecturer-uploaded notes were returned for this subject."
                />
              </div>
            )}
          </section>
        </div>
      ) : null}
    </SubjectDialogShell>
  );
}

function SubjectNotesSummary({ subject }: { subject: SubjectProgress }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryTile
        label="Progress"
        value={`${subject.progress}%`}
        helper={subject.currentModule}
      />

      <SummaryTile
        label="Attendance"
        value={`${subject.attendance}%`}
        helper={`${subject.name} attendance`}
      />

      <SummaryTile
        label="Test Average"
        value={`${subject.testAverage}%`}
        helper="Current score average"
      />

      <SummaryTile
        label="Weak Topic"
        value={subject.weakTopic ?? "Not assigned"}
        helper="Needs revision"
      />
    </section>
  );
}

function SummaryTile({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl bg-surface-soft p-4">
      <p className="text-[11px] font-extrabold uppercase text-text-muted">
        {label}
      </p>

      <p className="mt-2 truncate text-[18px] font-extrabold text-text-primary">
        {value}
      </p>

      <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-text-secondary">
        {helper}
      </p>
    </article>
  );
}

function TopicMiniCard({
  index,
  topic,
}: {
  index: number;
  topic: SubjectTopicFlowItem;
}) {
  const progress =
    typeof topic.progress === "number" ? Math.round(topic.progress) : null;

  return (
    <article className="rounded-2xl bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase text-text-muted">
            Topic {topic.order ?? index + 1}
          </p>

          <h4 className="mt-1 truncate text-[15px] font-extrabold text-text-primary">
            {topic.name ?? "Untitled topic"}
          </h4>

          {topic.description ? (
            <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-text-secondary">
              {topic.description}
            </p>
          ) : null}
        </div>

        {topic.status ? (
          <ToneBadge
            label={formatTopicStatus(topic.status)}
            tone={topicStatusTone(topic.status)}
          />
        ) : null}
      </div>

      {progress !== null ? (
        <div className="mt-3">
          <MiniProgress
            label="Topic progress"
            value={progress}
            tone={progress >= 85 ? "primary" : progress >= 50 ? "blue" : "orange"}
          />
        </div>
      ) : null}
    </article>
  );
}

function SubjectTopicFlowDialog({
  onClose,
  subject,
}: {
  onClose: () => void;
  subject: SubjectProgress;
}) {
  const [topics, setTopics] = useState<SubjectTopicFlowItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getSubjectTopicFlow(subject)
      .then((items) => {
        if (active) {
          setTopics(items);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load topic flow.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [subject]);

  return (
    <SubjectDialogShell
      description="A connected learning path from beginner topics to advanced modules."
      icon={Network}
      onClose={onClose}
      subject={subject}
      title="Topic Flow"
    >
      {loading ? <SubjectResourceSkeleton /> : null}

      {!loading && error ? <SubjectResourceError message={error} /> : null}

      {!loading && !error && !topics.length ? (
        <EmptyState
          icon={Network}
          title="No topic flow available yet"
          description="No ordered topic or module data was returned for this subject."
        />
      ) : null}

      {!loading && !error && topics.length ? (
        <TopicFlow topics={topics} />
      ) : null}
    </SubjectDialogShell>
  );
}

function SubjectDialogShell({
  children,
  description,
  icon: Icon,
  onClose,
  subject,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  onClose: () => void;
  subject: SubjectProgress;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-text-primary/35"
        onClick={onClose}
      />

      <section className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        <header className="border-b border-border bg-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                <Icon aria-hidden="true" size={23} strokeWidth={2.5} />
              </span>

              <div className="min-w-0">
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-text-muted">
                  {subject.name}
                </p>

                <h2 className="mt-1 text-[24px] font-extrabold leading-7 text-text-primary">
                  {title}
                </h2>

                <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                  {description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-surface-soft text-text-secondary transition hover:text-text-primary"
              aria-label="Close"
            >
              <X aria-hidden="true" size={18} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto overflow-x-hidden p-5 sm:p-6">
          {children}
        </div>
      </section>
    </div>
  );
}

function NoteCard({ note }: { note: SubjectNote }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-extrabold text-text-primary">
              {note.title}
            </h3>

            {note.fileType ? (
              <ToneBadge label={note.fileType.toUpperCase()} tone="blue" />
            ) : null}
          </div>

          {note.description ? (
            <p className="mt-2 text-[13px] leading-5 text-text-secondary">
              {note.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-bold text-text-muted">
            <span>Uploaded by {note.uploadedBy || "staff"}</span>
            <span>-</span>
            <span>{formatDate(note.uploadedDate)}</span>
          </div>
        </div>

        {note.fileUrl ? (
          <a
            href={note.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[13px] font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <Download aria-hidden="true" size={16} strokeWidth={2.5} />
            Open notes
            <ExternalLink aria-hidden="true" size={14} strokeWidth={2.5} />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function TopicFlow({ topics }: { topics: SubjectTopicFlowItem[] }) {
  return (
    <div className="space-y-3">
      {topics.map((topic, index) => (
        <div key={topic.id} className="relative pl-8">
          {index < topics.length - 1 ? (
            <span className="absolute left-[11px] top-8 h-[calc(100%+0.75rem)] w-0.5 bg-border" />
          ) : null}

          <span className="absolute left-0 top-5 grid h-6 w-6 place-items-center rounded-full border-4 border-surface bg-primary" />

          <article className="rounded-2xl border border-border bg-surface-soft p-4 transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold uppercase text-text-muted">
                  Step {topic.order ?? index + 1}
                </p>

                <h3 className="mt-1 text-[17px] font-extrabold text-text-primary">
                  {topic.name}
                </h3>

                {topic.description ? (
                  <p className="mt-2 text-[13px] leading-5 text-text-secondary">
                    {topic.description}
                  </p>
                ) : null}
              </div>

              {topic.status ? (
                <ToneBadge
                  label={formatTopicStatus(topic.status)}
                  tone={topicStatusTone(topic.status)}
                />
              ) : null}
            </div>

            {typeof topic.progress === "number" ? (
              <div className="mt-4">
                <MiniProgress
                  label="Progress"
                  value={topic.progress}
                  tone={
                    topic.progress >= 85
                      ? "primary"
                      : topic.progress >= 50
                        ? "blue"
                        : "orange"
                  }
                />
              </div>
            ) : null}

            {topic.prerequisiteIds?.length ? (
              <p className="mt-3 text-[12px] font-semibold text-text-muted">
                Prerequisites: {topic.prerequisiteIds.join(", ")}
              </p>
            ) : null}
          </article>
        </div>
      ))}
    </div>
  );
}

function SubjectResourceSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-border bg-surface-soft p-4"
        >
          <div className="h-4 w-1/3 rounded-full bg-border" />
          <div className="mt-3 h-3 w-2/3 rounded-full bg-border" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-border" />
        </div>
      ))}
    </div>
  );
}

function SubjectResourceError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red/20 bg-red-soft p-4 text-red">
      <AlertCircle aria-hidden="true" size={20} strokeWidth={2.5} />

      <div>
        <p className="text-[14px] font-extrabold">
          Unable to load this subject resource
        </p>

        <p className="mt-1 text-[13px] leading-5">{message}</p>
      </div>
    </div>
  );
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "Date not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTopicStatus(status: NonNullable<SubjectTopicFlowItem["status"]>) {
  const labels: Record<NonNullable<SubjectTopicFlowItem["status"]>, string> = {
    completed: "Completed",
    current: "Current",
    locked: "Locked",
    "not-started": "Not Started",
  };

  return labels[status];
}

function topicStatusTone(status: NonNullable<SubjectTopicFlowItem["status"]>) {
  const tones: Record<
    NonNullable<SubjectTopicFlowItem["status"]>,
    "primary" | "blue" | "neutral" | "yellow"
  > = {
    completed: "primary",
    current: "blue",
    locked: "neutral",
    "not-started": "yellow",
  };

  return tones[status];
}