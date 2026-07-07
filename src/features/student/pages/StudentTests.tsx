import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileUp,
  PlayCircle,
  Trophy,
  Undo2,
  UploadCloud,
} from "lucide-react";
import { useInstituteFeatureAccess } from "../../../shared/feature-flags/InstituteFeatureAccess";
import { PageTitle } from "../../../shared/components/ui/PageTitle";
import {
  ChartShell,
  FilterTabs,
  MetricCard,
  PageCard,
  StudentPage,
  ToneBadge,
  chartTooltipStyle,
} from "../components/StudentPagePrimitives";
import { useStudentDashboard } from "../hooks/useStudentDashboard";
import { submitAssignmentFile } from "../services/assignmentSubmissionService";
import type { AssignmentSubmissionResult } from "../services/assignmentSubmissionService";
import { navigateToStudentTestPath } from "../services/studentTestAttemptStorage";
import type {
  Assignment,
  TestRecord,
  TestStatus,
} from "../types/student.types";

type TestFilter =
  | "All"
  | "Weekly"
  | "Monthly"
  | "Final"
  | "Mock"
  | "Coding Test";

type PriorityItem =
  | {
      assignment: Assignment;
      date: Date;
      expired: boolean;
      id: string;
      priorityScore: number;
      type: "assignment";
    }
  | {
      date: Date;
      expired: boolean;
      id: string;
      priorityScore: number;
      test: TestRecord;
      type: "test";
    };

const testFilters: TestFilter[] = [
  "All",
  "Weekly",
  "Monthly",
  "Final",
  "Mock",
  "Coding Test",
];

const testStatusTone: Record<
  TestStatus,
  "primary" | "blue" | "red" | "orange"
> = {
  Upcoming: "blue",
  Completed: "primary",
  Missed: "red",
  "Retake Available": "orange",
};

const assignmentStatusTone: Record<
  Assignment["status"],
  "primary" | "blue" | "red" | "orange"
> = {
  pending: "orange",
  submitted: "blue",
  overdue: "red",
  reviewed: "primary",
};

const priorityTone: Record<Assignment["priority"], "blue" | "orange" | "red"> =
  {
    low: "blue",
    medium: "orange",
    high: "red",
  };

export function StudentTests() {
  const { assignments, testPerformance, tests } = useStudentDashboard();
  const { isFeatureEnabled } = useInstituteFeatureAccess();

  const assignmentsEnabled = isFeatureEnabled("ASSIGNMENTS");
  const now = new Date();

  const [activeTestFilter, setActiveTestFilter] = useState<TestFilter>("All");
  const [activeAssignmentSubject, setActiveAssignmentSubject] = useState("All");

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(assignments[0]?.id ?? null);

  const [assignmentFiles, setAssignmentFiles] = useState<
    Record<string, File | undefined>
  >({});

  const [assignmentSubmissions, setAssignmentSubmissions] = useState<
    Record<string, AssignmentSubmissionResult>
  >({});

  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<
    string | null
  >(null);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const visibleTests = tests.filter((test) => shouldShowTest(test, now));

  const visibleAssignments = assignmentsEnabled
    ? assignments.filter((assignment) => shouldShowAssignment(assignment, now))
    : [];

  const completedTests = visibleTests.filter(
    (test) => test.status === "Completed",
  );

  const upcomingTests = visibleTests.filter(
    (test) =>
      test.status === "Upcoming" || test.status === "Retake Available",
  );

  const bestScore = completedTests.length
    ? Math.max(...completedTests.map((test) => test.score))
    : 0;

  const pendingAssignments = visibleAssignments.filter(
    (assignment) => assignment.status === "pending",
  );

  const submittedAssignments = visibleAssignments.filter(
    (assignment) => assignment.status === "submitted",
  );

  const overdueAssignments = visibleAssignments.filter(
    (assignment) => assignment.status === "overdue",
  );

  const reviewedAssignments = visibleAssignments.filter(
    (assignment) => assignment.status === "reviewed",
  );

  const assignmentSubjects = [
    "All",
    ...Array.from(
      new Set(visibleAssignments.map((assignment) => assignment.subject)),
    ),
  ];

  const selectedAssignment =
    visibleAssignments.find(
      (assignment) => assignment.id === selectedAssignmentId,
    ) ?? visibleAssignments[0];

  const filteredTests =
    activeTestFilter === "All"
      ? visibleTests
      : visibleTests.filter((test) => test.category === activeTestFilter);

  const filteredAssignments =
    activeAssignmentSubject === "All"
      ? visibleAssignments
      : visibleAssignments.filter(
          (assignment) => assignment.subject === activeAssignmentSubject,
        );

  const visibleAssignmentBoard = [
    ...filteredAssignments.filter(
      (assignment) => assignment.status === "pending",
    ),
    ...filteredAssignments.filter(
      (assignment) => assignment.status === "overdue",
    ),
    ...filteredAssignments.filter(
      (assignment) => assignment.status === "submitted",
    ),
    ...filteredAssignments.filter(
      (assignment) => assignment.status === "reviewed",
    ),
  ];

  const priorityItems = buildPriorityItems({
    assignments: visibleAssignments,
    now,
    tests: visibleTests,
  });

  const handleAssignmentFileChange = (
    assignmentId: string,
    file?: File,
  ) => {
    setSubmissionError(null);

    setAssignmentFiles((currentFiles) => ({
      ...currentFiles,
      [assignmentId]: file,
    }));
  };

  const handleSubmitAssignment = async (assignment: Assignment) => {
    const file = assignmentFiles[assignment.id];

    if (!file) {
      setSubmissionError(
        "Please upload an assignment file before submitting.",
      );
      return;
    }

    setSubmissionError(null);
    setSubmittingAssignmentId(assignment.id);

    try {
      const result = await submitAssignmentFile({
        assignmentId: assignment.id,
        file,
      });

      setAssignmentSubmissions((currentSubmissions) => ({
        ...currentSubmissions,
        [assignment.id]: result,
      }));
    } catch {
      setSubmissionError("Assignment submission failed. Please try again.");
    } finally {
      setSubmittingAssignmentId(null);
    }
  };

  const handleOpenAssignmentUpload = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);

    window.setTimeout(() => {
      document
        .getElementById("assignment-upload-box")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <StudentPage>
      <PageTitle
        title="Test & Assignment"
        description="Urgent tests and assignments appear first. Expired work is removed after 48 hours."
      />

      <section className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={ClipboardCheck}
            label="Average Score"
            value={`${testPerformance.averageScore}%`}
            helper="Completed tests"
            tone="primary"
          />

          <MetricCard
            icon={Trophy}
            label="Best Score"
            value={`${bestScore}%`}
            helper="Highest result"
            tone="yellow"
          />

          <MetricCard
            icon={CalendarClock}
            label="Active Tests"
            value={upcomingTests.length}
            helper="Upcoming / retake"
            tone="blue"
          />

          <MetricCard
            icon={Undo2}
            label="Pending Work"
            value={pendingAssignments.length + overdueAssignments.length}
            helper="Need action"
            tone="orange"
          />
        </div>

        <PageCard
          title="Today & Urgent Work"
          description="Tests and assignments are sorted by urgency."
        >
          {priorityItems.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {priorityItems.map((item) => (
                <PriorityWorkCard
                  key={item.id}
                  item={item}
                  now={now}
                  onOpenAssignmentUpload={handleOpenAssignmentUpload}
                />
              ))}
            </div>
          ) : (
            <CompactEmptyState
              title="No active work"
              description="New tests and assignments will appear here."
            />
          )}
        </PageCard>

        <div className="grid gap-5 xl:grid-cols-2">
          <ChartShell
            title="Weekly Test Performance"
            description="Weekly test score trend"
            height={230}
          >
            <BarChart
              data={testPerformance.weeklyTestScores}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 12,
                }}
              />

              <YAxis
                domain={[60, 100]}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 12,
                }}
              />

              <Tooltip contentStyle={chartTooltipStyle} />

              <Bar
                dataKey="score"
                fill="var(--blue)"
                radius={[10, 10, 0, 0]}
                name="Score"
                barSize={38}
              />
            </BarChart>
          </ChartShell>

          <ChartShell
            title="Monthly Score Trend"
            description="Monthly and final readiness"
            height={230}
          >
            <AreaChart
              data={testPerformance.monthlyTestScores}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 12,
                }}
              />

              <YAxis
                domain={[60, 100]}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 12,
                }}
              />

              <Tooltip contentStyle={chartTooltipStyle} />

              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--primary)"
                strokeWidth={3}
                fill="var(--primary-soft)"
                name="Score"
              />
            </AreaChart>
          </ChartShell>
        </div>

        <PageCard
          title="Test Records"
          description="Completed, upcoming, retake, and expired test records."
          action={
            <FilterTabs
              active={activeTestFilter}
              items={testFilters}
              onChange={(item: string) =>
                setActiveTestFilter(item as TestFilter)
              }
            />
          }
        >
          {filteredTests.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredTests.map((test) => (
                <TestCard key={test.id} now={now} test={test} />
              ))}
            </div>
          ) : (
            <CompactEmptyState
              title="No tests found"
              description="No tests match this filter."
            />
          )}
        </PageCard>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,58fr)_minmax(280px,42fr)]">
          <PageCard title="Upcoming Tests" description="Prepare for these tests.">
            {upcomingTests.length ? (
              <div className="space-y-2.5">
                {upcomingTests.map((test) => (
                  <TestMini key={test.id} now={now} test={test} />
                ))}
              </div>
            ) : (
              <CompactEmptyState
                title="No upcoming tests"
                description="No test is scheduled right now."
              />
            )}
          </PageCard>

          <PageCard
            title="Weak Topics"
            description="Focus here before tests."
          >
            <div className="flex flex-wrap gap-2">
              {testPerformance.weakTopics.map((topic) => (
                <ToneBadge key={topic} label={topic} tone="orange" />
              ))}
            </div>
          </PageCard>
        </div>
      </section>

      {assignmentsEnabled ? (
        <section className="mt-5 space-y-5">
          <SectionHeading
            title="Assignments"
            description="Select an assignment and upload the completed file below."
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={ClipboardList}
              label="Total Assignments"
              value={visibleAssignments.length}
              helper="Visible active"
              tone="blue"
            />

            <MetricCard
              icon={Clock3}
              label="Pending"
              value={pendingAssignments.length}
              helper="Need completion"
              tone="orange"
            />

            <MetricCard
              icon={AlertTriangle}
              label="Expired"
              value={overdueAssignments.length}
              helper="48 hours only"
              tone="red"
            />

            <MetricCard
              icon={CheckCircle2}
              label="Reviewed"
              value={reviewedAssignments.length}
              helper={`${submittedAssignments.length} submitted`}
              tone="primary"
            />
          </div>

          <PageCard
            title="Assignment Board"
            description="Urgent assignments appear first."
            action={
              <FilterTabs
                active={activeAssignmentSubject}
                items={assignmentSubjects}
                onChange={(item: string) =>
                  setActiveAssignmentSubject(item)
                }
              />
            }
          >
            {visibleAssignmentBoard.length ? (
              <div className="grid gap-3 xl:grid-cols-3">
                {visibleAssignmentBoard.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    isActive={selectedAssignment?.id === assignment.id}
                    now={now}
                    onOpenTask={handleOpenAssignmentUpload}
                  />
                ))}
              </div>
            ) : (
              <CompactEmptyState
                title="No assignments found"
                description="No assignments match this filter."
              />
            )}
          </PageCard>

          {selectedAssignment ? (
            <AssignmentDetailPanel
              assignment={selectedAssignment}
              file={assignmentFiles[selectedAssignment.id]}
              isSubmitting={submittingAssignmentId === selectedAssignment.id}
              onFileChange={handleAssignmentFileChange}
              onSubmitAssignment={handleSubmitAssignment}
              submission={assignmentSubmissions[selectedAssignment.id]}
              submissionError={submissionError}
            />
          ) : null}

          <div className="grid gap-5 lg:grid-cols-3">
            <AssignmentColumn
              assignments={pendingAssignments}
              now={now}
              onOpenTask={handleOpenAssignmentUpload}
              title="Pending"
            />

            <AssignmentColumn
              assignments={submittedAssignments}
              now={now}
              onOpenTask={handleOpenAssignmentUpload}
              title="Submitted"
            />

            <AssignmentColumn
              assignments={[...overdueAssignments, ...reviewedAssignments]}
              now={now}
              onOpenTask={handleOpenAssignmentUpload}
              title="Expired & Reviewed"
            />
          </div>
        </section>
      ) : null}
    </StudentPage>
  );
}

function PriorityWorkCard({
  item,
  now,
  onOpenAssignmentUpload,
}: {
  item: PriorityItem;
  now: Date;
  onOpenAssignmentUpload: (assignmentId: string) => void;
}) {
  if (item.type === "test") {
    const test = item.test;
    const canStart = canStartTestToday(test, now);

    return (
      <article
        className={
          item.expired
            ? "rounded-2xl border border-red/30 bg-red-soft p-4"
            : canStart
              ? "rounded-2xl border border-primary/30 bg-primary-soft p-4"
              : "rounded-2xl border border-border bg-surface-soft p-4"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-primary-dark shadow-card">
              <PlayCircle aria-hidden="true" size={20} strokeWidth={2.5} />
            </span>

            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase text-text-muted">
                Test
              </p>

              <h3 className="mt-1 truncate text-[16px] font-extrabold text-text-primary">
                {test.title}
              </h3>

              <p className="mt-1 text-[12px] font-semibold text-text-secondary">
                {test.subject} · {test.category}
              </p>
            </div>
          </div>

          <ToneBadge
            label={item.expired ? "Expired" : test.status}
            tone={item.expired ? "red" : testStatusTone[test.status]}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <DetailItem label="Date" value={formatDate(test.date)} />
          <DetailItem
            label="When"
            value={getRelativeDateLabel(test.date, now)}
          />
          <DetailItem
            label="Action"
            value={canStart ? "Start" : item.expired ? "Expired" : "Prepare"}
          />
        </div>

        {canStart ? (
          <button
            type="button"
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-extrabold text-white shadow-card transition hover:bg-primary-dark"
            onClick={() =>
              navigateToStudentTestPath(`/student/tests/${test.id}/start`)
            }
          >
            <PlayCircle aria-hidden="true" size={16} strokeWidth={2.5} />
            {test.status === "Retake Available" ? "Start Retake" : "Start Test"}
          </button>
        ) : (
          <p className="mt-4 rounded-xl bg-surface px-3 py-2 text-[12px] font-bold text-text-secondary">
            {item.expired
              ? "Expired. Removed after 48 hours."
              : "Available on test day."}
          </p>
        )}
      </article>
    );
  }

  const assignment = item.assignment;

  return (
    <article
      className={
        item.expired
          ? "rounded-2xl border border-red/30 bg-red-soft p-4"
          : "rounded-2xl border border-border bg-surface-soft p-4"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-text-primary shadow-card">
            <UploadCloud aria-hidden="true" size={20} strokeWidth={2.5} />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase text-text-muted">
              Assignment
            </p>

            <h3 className="mt-1 truncate text-[16px] font-extrabold text-text-primary">
              {assignment.title}
            </h3>

            <p className="mt-1 text-[12px] font-semibold text-text-secondary">
              {assignment.subject}
            </p>
          </div>
        </div>

        <ToneBadge
          label={item.expired ? "Expired" : assignment.priority}
          tone={item.expired ? "red" : priorityTone[assignment.priority]}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <DetailItem label="Due" value={formatDate(assignment.dueDate)} />
        <DetailItem
          label="When"
          value={getRelativeDateLabel(assignment.dueDate, now)}
        />
        <DetailItem
          label="Action"
          value={item.expired ? "Expired" : "Upload"}
        />
      </div>

      {item.expired ? (
        <p className="mt-4 rounded-xl bg-surface px-3 py-2 text-[12px] font-bold text-text-secondary">
          Expired. Removed after 48 hours.
        </p>
      ) : (
        <button
          type="button"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-extrabold text-white shadow-card transition hover:bg-primary-dark"
          onClick={() => onOpenAssignmentUpload(assignment.id)}
        >
          <UploadCloud aria-hidden="true" size={16} strokeWidth={2.5} />
          Upload Assignment
        </button>
      )}
    </article>
  );
}

function TestCard({ now, test }: { now: Date; test: TestRecord }) {
  const percentage =
    test.maxScore > 0 ? Math.round((test.score / test.maxScore) * 100) : 0;

  const expired = isExpiredWithin48Hours(test.date, now);
  const canStart = canStartTestToday(test, now);

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase text-text-muted">
            Test
          </p>

          <h3 className="mt-1 truncate text-[15px] font-extrabold text-text-primary">
            {test.title}
          </h3>

          <p className="mt-1 text-[12px] font-semibold text-text-secondary">
            {test.subject} · {test.category}
          </p>
        </div>

        <ToneBadge
          label={expired ? "Expired" : test.status}
          tone={expired ? "red" : testStatusTone[test.status]}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <DetailItem label="Date" value={formatDate(test.date)} />

        <DetailItem
          label="Score"
          value={test.status === "Completed" ? `${percentage}%` : "Pending"}
        />

        <DetailItem
          label="Action"
          value={canStart ? "Start" : expired ? "Expired" : "Prepare"}
        />
      </div>

      {canStart ? (
        <button
          type="button"
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white transition hover:bg-primary-dark"
          onClick={() =>
            navigateToStudentTestPath(`/student/tests/${test.id}/start`)
          }
        >
          <PlayCircle aria-hidden="true" size={15} strokeWidth={2.5} />
          Start Test
        </button>
      ) : null}
    </article>
  );
}

function TestMini({ now, test }: { now: Date; test: TestRecord }) {
  const canStart = canStartTestToday(test, now);

  return (
    <article className="rounded-2xl bg-surface-soft p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-extrabold text-text-primary">
            {test.title}
          </h3>

          <p className="mt-1 text-[12px] font-semibold text-text-secondary">
            {test.subject} · {formatDate(test.date)}
          </p>
        </div>

        <ToneBadge label={test.category} tone="neutral" />
      </div>

      {canStart ? (
        <button
          type="button"
          className="mt-2 h-8 rounded-lg bg-primary px-3 text-[11px] font-extrabold text-white"
          onClick={() =>
            navigateToStudentTestPath(`/student/tests/${test.id}/start`)
          }
        >
          Start
        </button>
      ) : null}
    </article>
  );
}

function AssignmentColumn({
  assignments,
  now,
  onOpenTask,
  title,
}: {
  assignments: Assignment[];
  now: Date;
  onOpenTask: (assignmentId: string) => void;
  title: string;
}) {
  return (
    <PageCard title={title}>
      {assignments.length ? (
        <div className="space-y-2.5">
          {assignments.map((assignment) => (
            <AssignmentMini
              key={assignment.id}
              assignment={assignment}
              now={now}
              onOpenTask={onOpenTask}
            />
          ))}
        </div>
      ) : (
        <CompactEmptyState title="No items" description="Nothing here." />
      )}
    </PageCard>
  );
}

function AssignmentCard({
  assignment,
  isActive,
  now,
  onOpenTask,
}: {
  assignment: Assignment;
  isActive: boolean;
  now: Date;
  onOpenTask: (assignmentId: string) => void;
}) {
  const expired = isExpiredWithin48Hours(assignment.dueDate, now);

  return (
    <article
      className={
        isActive
          ? "rounded-2xl border border-primary bg-primary-soft p-4"
          : expired
            ? "rounded-2xl border border-red/30 bg-red-soft p-4"
            : "rounded-2xl border border-border bg-surface-soft p-4"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase text-text-muted">
            Assignment
          </p>

          <h3 className="mt-1 truncate text-[15px] font-extrabold text-text-primary">
            {assignment.title}
          </h3>

          <p className="mt-1 text-[12px] font-semibold text-text-secondary">
            {assignment.subject}
          </p>
        </div>

        <ToneBadge
          label={expired ? "Expired" : assignment.priority}
          tone={expired ? "red" : priorityTone[assignment.priority]}
        />
      </div>

      <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-text-secondary">
        {assignment.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <ToneBadge
          label={expired ? "expired" : assignment.status}
          tone={expired ? "red" : assignmentStatusTone[assignment.status]}
        />

        <ToneBadge
          label={`Due ${formatDate(assignment.dueDate)}`}
          tone="neutral"
        />
      </div>

      {!expired ? (
        <button
          type="button"
          className="mt-3 h-9 rounded-xl bg-primary px-4 text-[12px] font-extrabold text-white transition hover:bg-primary-dark"
          onClick={() => onOpenTask(assignment.id)}
        >
          Upload
        </button>
      ) : null}
    </article>
  );
}

function AssignmentMini({
  assignment,
  now,
  onOpenTask,
}: {
  assignment: Assignment;
  now: Date;
  onOpenTask: (assignmentId: string) => void;
}) {
  const expired = isExpiredWithin48Hours(assignment.dueDate, now);

  return (
    <article className="rounded-2xl bg-surface-soft p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-extrabold text-text-primary">
            {assignment.title}
          </h3>

          <p className="mt-1 text-[12px] font-semibold text-text-secondary">
            {assignment.subject} · {formatDate(assignment.dueDate)}
          </p>
        </div>

        <ToneBadge
          label={expired ? "expired" : assignment.status}
          tone={expired ? "red" : assignmentStatusTone[assignment.status]}
        />
      </div>

      {!expired ? (
        <button
          type="button"
          className="mt-2 h-8 rounded-lg border border-border bg-surface px-3 text-[11px] font-extrabold text-text-primary"
          onClick={() => onOpenTask(assignment.id)}
        >
          Upload
        </button>
      ) : null}
    </article>
  );
}

function AssignmentDetailPanel({
  assignment,
  file,
  isSubmitting,
  onFileChange,
  onSubmitAssignment,
  submission,
  submissionError,
}: {
  assignment: Assignment;
  file?: File;
  isSubmitting: boolean;
  onFileChange: (assignmentId: string, file?: File) => void;
  onSubmitAssignment: (assignment: Assignment) => void;
  submission?: AssignmentSubmissionResult;
  submissionError: string | null;
}) {
  return (
    <div id="assignment-upload-box">
      <PageCard
        title="Assignment Upload"
        description="Choose your file and submit."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <section className="rounded-2xl border border-border bg-surface-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase text-text-muted">
                  Assignment
                </p>

                <h3 className="mt-1 text-[18px] font-extrabold leading-6 text-text-primary">
                  {assignment.title}
                </h3>

                <p className="mt-1 text-[12px] font-semibold text-text-secondary">
                  {assignment.subject}
                </p>
              </div>

              <ToneBadge
                label={assignment.status}
                tone={assignmentStatusTone[assignment.status]}
              />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <DetailItem label="Subject" value={assignment.subject} />
              <DetailItem
                label="Due"
                value={formatDate(assignment.dueDate)}
              />
              <DetailItem label="Status" value={assignment.status} />
            </div>

            <div className="mt-4 rounded-2xl bg-surface p-3">
              <p className="text-[11px] font-extrabold uppercase text-text-muted">
                Task
              </p>

              <p className="mt-1 text-[13px] leading-6 text-text-secondary">
                {assignment.description}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface-soft p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue">
                <FileUp aria-hidden="true" size={19} strokeWidth={2.5} />
              </span>

              <div className="min-w-0">
                <h3 className="text-[16px] font-extrabold text-text-primary">
                  Upload File
                </h3>

                <p className="mt-1 text-[12px] leading-5 text-text-secondary">
                  Attach your completed work.
                </p>
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-4 text-center transition hover:border-primary">
              <FileUp
                aria-hidden="true"
                size={22}
                strokeWidth={2.5}
                className="text-blue"
              />

              <span className="mt-2 text-[13px] font-extrabold text-text-primary">
                Upload file
              </span>

              <span className="mt-1 max-w-xs text-[11px] font-semibold leading-5 text-text-secondary">
                {file ? file.name : "PDF, document, image, or zip"}
              </span>

              <input
                className="sr-only"
                type="file"
                onChange={(event) =>
                  onFileChange(assignment.id, event.target.files?.[0])
                }
              />
            </label>

            {submissionError ? (
              <p className="mt-3 rounded-xl bg-red-soft px-3 py-2 text-[12px] font-bold text-red">
                {submissionError}
              </p>
            ) : null}

            {submission ? (
              <p className="mt-3 rounded-xl bg-primary-soft px-3 py-2 text-[12px] font-bold text-primary-dark">
                Submitted {submission.fileName}.
              </p>
            ) : null}

            <button
              type="button"
              className="mt-4 h-10 w-full rounded-xl bg-primary px-4 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!file || isSubmitting}
              onClick={() => onSubmitAssignment(assignment)}
            >
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </button>
          </section>
        </div>
      </PageCard>
    </div>
  );
}

function SectionHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div>
      <h2 className="text-[22px] font-extrabold leading-7 text-text-primary">
        {title}
      </h2>

      <p className="mt-1 max-w-3xl text-[13px] leading-5 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function CompactEmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-soft p-4 text-center">
      <p className="text-[15px] font-extrabold text-text-primary">{title}</p>
      <p className="mt-1 text-[12px] font-semibold text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <p className="text-[10px] font-extrabold uppercase text-text-muted">
        {label}
      </p>

      <p className="mt-1 truncate text-[12px] font-extrabold capitalize text-text-primary">
        {value}
      </p>
    </div>
  );
}

function buildPriorityItems({
  assignments,
  now,
  tests,
}: {
  assignments: Assignment[];
  now: Date;
  tests: TestRecord[];
}): PriorityItem[] {
  const testItems: PriorityItem[] = tests
    .filter((test) => shouldShowTest(test, now))
    .map((test) => {
      const date = toDate(test.date);
      const expired = isExpiredWithin48Hours(test.date, now);

      return {
        date,
        expired,
        id: `test-${test.id}`,
        priorityScore: getTestPriorityScore(test, now),
        test,
        type: "test",
      };
    });

  const assignmentItems: PriorityItem[] = assignments
    .filter((assignment) => shouldShowAssignment(assignment, now))
    .map((assignment) => {
      const date = toDate(assignment.dueDate);
      const expired = isExpiredWithin48Hours(assignment.dueDate, now);

      return {
        assignment,
        date,
        expired,
        id: `assignment-${assignment.id}`,
        priorityScore: getAssignmentPriorityScore(assignment, now),
        type: "assignment",
      };
    });

  return [...testItems, ...assignmentItems].sort((a, b) => {
    if (a.priorityScore !== b.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    return a.date.getTime() - b.date.getTime();
  });
}

function getTestPriorityScore(test: TestRecord, now: Date) {
  if (isExpiredWithin48Hours(test.date, now)) {
    return 60;
  }

  if (canStartTestToday(test, now)) {
    return 100;
  }

  if (test.status === "Retake Available") {
    return 95;
  }

  if (isTomorrow(test.date, now)) {
    return 80;
  }

  if (test.status === "Upcoming") {
    return 65;
  }

  return 20;
}

function getAssignmentPriorityScore(assignment: Assignment, now: Date) {
  if (isExpiredWithin48Hours(assignment.dueDate, now)) {
    return 70;
  }

  if (isToday(assignment.dueDate, now)) {
    return 98;
  }

  if (assignment.priority === "high") {
    return 90;
  }

  if (isTomorrow(assignment.dueDate, now)) {
    return 82;
  }

  if (assignment.priority === "medium") {
    return 60;
  }

  return 40;
}

function shouldShowTest(test: TestRecord, now: Date) {
  if (test.status === "Completed") {
    return true;
  }

  return !isOlderThan48Hours(test.date, now);
}

function shouldShowAssignment(assignment: Assignment, now: Date) {
  if (assignment.status === "reviewed" || assignment.status === "submitted") {
    return true;
  }

  return !isOlderThan48Hours(assignment.dueDate, now);
}

function canStartTestToday(test: TestRecord, now: Date) {
  return (
    test.status === "Retake Available" ||
    (test.status === "Upcoming" && isToday(test.date, now))
  );
}

function isExpiredWithin48Hours(value: string, now: Date) {
  const date = toDate(value);
  const diffMs = now.getTime() - date.getTime();

  return diffMs > 0 && diffMs <= 48 * 60 * 60 * 1000;
}

function isOlderThan48Hours(value: string, now: Date) {
  const date = toDate(value);
  const diffMs = now.getTime() - date.getTime();

  return diffMs > 48 * 60 * 60 * 1000;
}

function isToday(value: string, now: Date) {
  const date = toDate(value);

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isTomorrow(value: string, now: Date) {
  const date = toDate(value);
  const tomorrow = new Date(now);

  tomorrow.setDate(now.getDate() + 1);

  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}

function getRelativeDateLabel(value: string, now: Date) {
  if (isToday(value, now)) {
    return "Today";
  }

  if (isTomorrow(value, now)) {
    return "Tomorrow";
  }

  if (isExpiredWithin48Hours(value, now)) {
    return "Expired";
  }

  const date = toDate(value);
  const days = getDaysFromNow(date, now);

  if (days > 0) {
    return `${days} days left`;
  }

  return formatDate(value);
}

function getDaysFromNow(date: Date, now: Date) {
  const oneDay = 24 * 60 * 60 * 1000;

  return Math.ceil(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / oneDay,
  );
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(toDate(date));
}