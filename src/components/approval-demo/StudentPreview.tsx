import {
  BarChart3,
  BookOpenText,
  CalendarCheck2,
  ClipboardCheck,
  Code2,
  FileText,
  Trophy,
} from "lucide-react";
import { PreviewCard, PreviewLockedButton, PreviewSection } from "./DemoPreviewLayout";
import {
  studentDashboardPreviewData,
  type StudentPreviewHoverItem,
  type StudentPreviewSmallCard,
  type StudentPreviewTone,
} from "./demoPreviewData";

const toneClass: Record<StudentPreviewTone, string> = {
  blue: "bg-blue-soft text-blue",
  neutral: "bg-surface-soft text-text-secondary",
  orange: "bg-orange-soft text-orange",
  primary: "bg-primary-soft text-primary-dark",
  red: "bg-red-soft text-red",
  yellow: "bg-yellow-soft text-text-primary",
};

const graphToneClass: Record<StudentPreviewTone, string> = {
  blue: "bg-blue",
  neutral: "bg-text-muted",
  orange: "bg-orange",
  primary: "bg-primary",
  red: "bg-red",
  yellow: "bg-yellow",
};

export function StudentPreview() {
  const preview = studentDashboardPreviewData;

  return (
    <PreviewSection className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">Student dashboard preview</p>
          <h2 className="mt-2 text-[24px] font-extrabold text-text-primary">Your learning space after approval</h2>
          <p className="mt-3 max-w-2xl text-[14px] font-semibold leading-6 text-text-secondary">
            A read-only preview of attendance, notes, tests, assignments, coding practice, analytics, and ranking.
            Dashboard actions unlock only after approval.
          </p>
        </div>
        <PreviewLockedButton label="Available after approval" />
      </div>

      <PreviewSection className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,58fr)_minmax(320px,42fr)]">
        <AttendancePreview />
        <CodingPracticePreview />
      </PreviewSection>

      <PreviewSection className="mt-4 grid gap-4 lg:grid-cols-2">
        <NotesPreview />
        <TestsExamsPreview />
      </PreviewSection>

      <PreviewSection className="mt-4 grid gap-4 lg:grid-cols-2">
        <AssignmentsPreview />
        <AnalyticsPreview />
      </PreviewSection>

      <PreviewSection className="mt-4">
        <RankingPreview />
      </PreviewSection>
    </PreviewSection>
  );
}

function AttendancePreview() {
  const attendance = studentDashboardPreviewData.attendance;

  return (
    <PreviewCard className="group relative bg-surface-soft">
      <SectionHeader icon={CalendarCheck2} eyebrow="Attendance Preview" title="Attendance health" />
      <HoverPanel items={attendance.hover} title="Attendance details" />

      <div className="mt-5 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="grid place-items-center rounded-2xl bg-surface p-4">
          <div
            className="grid h-32 w-32 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary) ${attendance.percentage * 3.6}deg, var(--surface-soft) 0deg)`,
            }}
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-surface">
              <div className="text-center">
                <p className="text-[28px] font-extrabold text-text-primary">{attendance.percentage}%</p>
                <p className="text-[11px] font-extrabold uppercase text-text-muted">Overall</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-4">
          <p className="text-[12px] font-extrabold uppercase text-text-muted">Last 7 classes</p>
          <MiniBarGraph values={attendance.graph} tone="primary" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {attendance.summaryCards.map((card) => (
          <SmallStatCard key={card.label} card={card} />
        ))}
      </div>
    </PreviewCard>
  );
}

function NotesPreview() {
  const notes = studentDashboardPreviewData.notes.cards;

  return (
    <PreviewCard className="bg-surface-soft">
      <SectionHeader icon={BookOpenText} eyebrow="Notes Preview" title="Recently shared notes" />
      <div className="mt-5 grid gap-3">
        {notes.map((note) => (
          <PreviewCard key={note.title} className="group relative bg-surface">
            <HoverPanel
              items={[
                { label: "Subject", value: note.subject },
                { label: "Uploaded by", value: note.uploadedBy },
                { label: "Last updated", value: note.lastUpdated },
              ]}
              title="Note details"
            />
            <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${toneClass[note.tone]}`}>
              {note.subject}
            </p>
            <h3 className="mt-3 text-[15px] font-extrabold text-text-primary">{note.title}</h3>
            <p className="mt-1 text-[13px] font-semibold text-text-secondary">Locked until account approval</p>
          </PreviewCard>
        ))}
      </div>
    </PreviewCard>
  );
}

function TestsExamsPreview() {
  const tests = studentDashboardPreviewData.tests.cards;

  return (
    <PreviewCard className="bg-surface-soft">
      <SectionHeader icon={ClipboardCheck} eyebrow="Tests & Exams Preview" title="Readiness snapshot" />
      <div className="mt-5 grid gap-3">
        {tests.map((test) => (
          <PreviewCard key={test.label} className="group relative bg-surface">
            <HoverPanel
              items={[
                { label: "Score", value: test.score },
                { label: "Attempts", value: test.attempts },
                { label: "Weak topic", value: test.weakTopic },
                { label: "Rank", value: test.rank },
              ]}
              title="Test details"
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-extrabold text-text-primary">{test.label}</p>
                <p className="mt-1 text-[13px] font-semibold text-text-secondary">Preview score card</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${toneClass[test.tone]}`}>
                {test.value}
              </span>
            </div>
          </PreviewCard>
        ))}
      </div>
    </PreviewCard>
  );
}

function AssignmentsPreview() {
  const assignments = studentDashboardPreviewData.assignments.cards;

  return (
    <PreviewCard className="bg-surface-soft">
      <SectionHeader icon={FileText} eyebrow="Assignments Preview" title="Submission overview" />
      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {assignments.map((assignment) => (
          <PreviewCard key={assignment.label} className="group relative bg-surface">
            <HoverPanel
              items={[
                { label: "Due date", value: assignment.dueDate },
                { label: "Subject", value: assignment.subject },
                { label: "Submission status", value: assignment.status },
              ]}
              title="Assignment details"
            />
            <p className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${toneClass[assignment.tone]}`}>
              {assignment.label}
            </p>
            <p className="mt-3 text-[24px] font-extrabold text-text-primary">{assignment.value}</p>
            <p className="mt-1 text-[13px] font-semibold text-text-secondary">{assignment.subject}</p>
          </PreviewCard>
        ))}
      </div>
    </PreviewCard>
  );
}

function CodingPracticePreview() {
  const coding = studentDashboardPreviewData.coding;

  return (
    <PreviewCard className="group relative bg-surface-soft">
      <SectionHeader icon={Code2} eyebrow="Coding Practice Preview" title="Practice momentum" />
      <HoverPanel items={coding.hover} title="Coding details" />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SmallStatCard card={{ label: "Solved problems", value: coding.solvedProblems, tone: "primary" }} />
        <SmallStatCard card={{ label: "Coding streak", value: coding.streak, tone: "orange" }} />
        <SmallStatCard card={{ label: "Ranking", value: coding.rank, tone: "blue" }} />
        <SmallStatCard card={{ label: "Accuracy", value: coding.accuracy, tone: "yellow" }} />
      </div>
      <div className="mt-4 rounded-2xl bg-surface p-4">
        <p className="text-[12px] font-extrabold uppercase text-text-muted">Weekly submissions</p>
        <MiniBarGraph values={[44, 52, 58, 61, 69, 74, 84]} tone="blue" />
      </div>
    </PreviewCard>
  );
}

function AnalyticsPreview() {
  const analytics = studentDashboardPreviewData.analytics;

  return (
    <PreviewCard className="group relative bg-surface-soft">
      <SectionHeader icon={BarChart3} eyebrow="Analytics Preview" title="Progress insights" />
      <HoverPanel items={analytics.hover} title="Analytics details" />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {analytics.progressCards.map((card) => (
          <SmallStatCard key={card.label} card={card} />
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-surface p-4">
        <p className="text-[12px] font-extrabold uppercase text-text-muted">Monthly growth</p>
        <MiniLineGraph values={analytics.graphs} />
      </div>
    </PreviewCard>
  );
}

function RankingPreview() {
  const ranking = studentDashboardPreviewData.ranking;

  return (
    <PreviewCard className="group relative bg-surface-soft">
      <SectionHeader icon={Trophy} eyebrow="Ranking Preview" title="Leaderboard position" />
      <HoverPanel items={ranking.hover} title="Ranking details" />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {ranking.cards.map((card) => (
          <SmallStatCard key={card.label} card={card} />
        ))}
      </div>
      <div className="mt-4">
        <PreviewLockedButton label="Leaderboard available after approval" />
      </div>
    </PreviewCard>
  );
}

function SectionHeader({
  eyebrow,
  icon: Icon,
  title,
}: {
  eyebrow: string;
  icon: typeof CalendarCheck2;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[12px] font-extrabold uppercase text-text-muted">{eyebrow}</p>
        <h3 className="mt-1 text-[18px] font-extrabold text-text-primary">{title}</h3>
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
      </span>
    </div>
  );
}

function SmallStatCard({ card }: { card: StudentPreviewSmallCard }) {
  return (
    <div className={`rounded-2xl p-4 ${toneClass[card.tone]}`}>
      <p className="text-[11px] font-extrabold uppercase opacity-80">{card.label}</p>
      <p className="mt-1 text-[20px] font-extrabold">{card.value}</p>
    </div>
  );
}

function HoverPanel({ items, title }: { items: StudentPreviewHoverItem[]; title: string }) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 w-64 translate-y-1 rounded-2xl border border-border bg-surface p-4 opacity-0 shadow-card transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
      <p className="text-[12px] font-extrabold uppercase text-text-muted">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-3 text-[12px]">
            <span className="font-bold text-text-secondary">{item.label}</span>
            <span className="max-w-[130px] text-right font-extrabold text-text-primary">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBarGraph({ tone, values }: { tone: StudentPreviewTone; values: number[] }) {
  const maxValue = Math.max(...values);

  return (
    <div className="mt-4 flex h-24 items-end gap-2">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex h-full flex-1 items-end rounded-t-xl bg-surface-soft">
          <div
            className={`w-full rounded-t-xl ${graphToneClass[tone]}`}
            style={{ height: `${Math.max(20, (value / maxValue) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function MiniLineGraph({ values }: { values: number[] }) {
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 88 - ((value - minValue) / (maxValue - minValue || 1)) * 70;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="mt-4 h-28 w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" points={points} stroke="var(--primary)" strokeLinecap="round" strokeWidth="4" />
      <polyline fill="none" opacity="0.18" points="0,88 100,88" stroke="var(--text-muted)" strokeWidth="1" />
      <polyline fill="none" opacity="0.18" points="0,52 100,52" stroke="var(--text-muted)" strokeWidth="1" />
      <polyline fill="none" opacity="0.18" points="0,18 100,18" stroke="var(--text-muted)" strokeWidth="1" />
    </svg>
  );
}
