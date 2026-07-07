import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CalendarCheck,
  Clock3,
  Medal,
  Target,
  UserCheck,
  UserX,
} from "lucide-react";
import { useInstituteFeatureAccess } from "../../../shared/feature-flags/InstituteFeatureAccess";
import { PageTitle } from "../../../shared/components/ui/PageTitle";
import {
  ChartShell,
  MetricCard,
  MiniProgress,
  PageCard,
  StudentPage,
  ToneBadge,
  chartTooltipStyle,
  toneForPercentage,
} from "../components/StudentPagePrimitives";
import { useStudentDashboard } from "../hooks/useStudentDashboard";

export function StudentAnalytics() {
  const {
    attendance,
    attendanceAnalytics,
    attendanceSummary,
    codingPractice,
    recommendations,
    subjects,
    testPerformance,
  } = useStudentDashboard();
  const { isFeatureEnabled } = useInstituteFeatureAccess();
  const attendanceEnabled = isFeatureEnabled("ATTENDANCE");
  const codingEnabled = isFeatureEnabled("CODING");
  const testsEnabled = isFeatureEnabled("TESTS");

  const subjectComparison = subjects.map((subject) => ({
    subject: subject.name,
    progress: subject.progress,
    attendance: subject.attendance,
    tests: subject.testAverage,
  }));
  const lowAttendanceSubjects = attendanceSummary.subjectWise.filter((subject) => subject.percentage < 90);

  const radarData = [
    { metric: "Attendance", value: Math.round(subjects.reduce((sum, subject) => sum + subject.attendance, 0) / subjects.length) },
    { metric: "Tests", value: testPerformance.averageScore },
    { metric: "Coding", value: codingPractice.successRate },
    { metric: "Subjects", value: Math.round(subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length) },
  ];

  return (
    <StudentPage>
      <PageTitle
        title="Performance Analytics"
        description="Deeper trends across performance, tests, coding practice, attendance, and improvement areas."
      />

      <section className="space-y-6">

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {testsEnabled ? <MetricCard icon={BarChart3} label="Test Average" value={`${testPerformance.averageScore}%`} helper={testPerformance.metricLabel} tone="primary" /> : null}
          {codingEnabled ? <MetricCard icon={Target} label="Coding Success" value={`${codingPractice.successRate}%`} helper={`${codingPractice.totalProblemsSolved} problems solved`} tone="blue" /> : null}
          <MetricCard icon={Medal} label="Average Progress" value={`${Math.round(subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length)}%`} helper="Across active subjects" tone="yellow" />
          <MetricCard icon={Brain} label="Focus Areas" value={recommendations.length} helper="Priority recommendations" tone="orange" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,62fr)_minmax(320px,38fr)]">
          <ChartShell title="Subject Performance Comparison" description="Progress, attendance, and test average by subject" height={340}>
            <BarChart data={subjectComparison} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="subject" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis domain={[40, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="progress" fill="var(--primary)" radius={[8, 8, 0, 0]} name="Progress" />
              <Bar dataKey="attendance" fill="var(--blue)" radius={[8, 8, 0, 0]} name="Attendance" />
              <Bar dataKey="tests" fill="var(--orange)" radius={[8, 8, 0, 0]} name="Tests" />
            </BarChart>
          </ChartShell>

          <ChartShell title="Academic Balance" description="Weighted view of overall learning health" height={340}>
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Radar dataKey="value" stroke="var(--blue)" fill="var(--blue-soft)" fillOpacity={0.75} strokeWidth={2} name="Score" />
            </RadarChart>
          </ChartShell>
        </div>

        <div className="grid gap-6">
          <PageCard title="Weak Area Analysis" description="Recommended actions based on attendance, tests, coding, and assignments.">
            <div className="grid gap-3 md:grid-cols-2">
              {recommendations.map((recommendation) => (
                <article key={recommendation.id} className="rounded-2xl bg-surface-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <ToneBadge label={recommendation.category} tone={recommendation.tone} />
                      <h3 className="mt-3 text-[15px] font-extrabold text-text-primary">{recommendation.title}</h3>
                    </div>
                    <ToneBadge label={recommendation.priority} tone={recommendation.priority === "high" ? "red" : "orange"} />
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-text-secondary">{recommendation.suggestedAction}</p>
                </article>
              ))}
            </div>
          </PageCard>
        </div>
      </section>

      {testsEnabled ? <section className="space-y-6">
        <SectionHeading
          title="Test Analytics"
          description="Track assessment trends, weekly scores, monthly movement, and readiness indicators."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={BarChart3} label="Average Score" value={`${testPerformance.averageScore}%`} helper="Across completed tests" tone="primary" />
          <MetricCard icon={Target} label="Weekly Score" value={`${testPerformance.weeklyScore}%`} helper="Weekly assessment average" tone="blue" />
          <MetricCard icon={Medal} label="Monthly Score" value={`${testPerformance.monthlyScore}%`} helper="Monthly readiness" tone="yellow" />
          <MetricCard icon={Brain} label="Mock Score" value={`${testPerformance.mockScore}%`} helper="Mock test performance" tone="orange" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartShell title="Test Score Trend" description="Monthly score movement" height={300}>
            <AreaChart data={testPerformance.monthlyTestScores} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis domain={[60, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area dataKey="score" stroke="var(--blue)" strokeWidth={3} fill="var(--blue-soft)" name="Score" />
            </AreaChart>
          </ChartShell>

          <ChartShell title="Weekly Test Performance" description="Score trend for weekly tests" height={300}>
            <BarChart data={testPerformance.weeklyTestScores} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis domain={[60, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="score" fill="var(--primary)" radius={[12, 12, 0, 0]} name="Score" />
            </BarChart>
          </ChartShell>
        </div>
      </section> : null}

      {codingEnabled ? <section className="space-y-6">
        <SectionHeading
          title="Coding Analytics"
          description="Review coding practice momentum, success rate, solved volume, and topic coverage."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Target} label="Success Rate" value={`${codingPractice.successRate}%`} helper={`${codingPractice.totalProblemsSolved} total solved`} tone="primary" />
          <MetricCard icon={BarChart3} label="Solved This Week" value={codingPractice.solvedThisWeek} helper={`${codingPractice.weeklyTarget} weekly target`} tone="blue" />
          <MetricCard icon={Medal} label="Weekly Target" value={codingPractice.weeklyTarget} helper="Practice problems planned" tone="yellow" />
          <MetricCard icon={Brain} label="Recent Topics" value={codingPractice.recentTopics.length} helper="Topics practiced recently" tone="orange" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartShell title="Coding Progress Trend" description="Monthly solved problem count" height={300}>
            <AreaChart data={codingPractice.monthlyTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area dataKey="solved" stroke="var(--primary)" strokeWidth={3} fill="var(--primary-soft)" name="Solved" />
            </AreaChart>
          </ChartShell>

          <ChartShell title="Weekly Coding Mix" description="Easy, medium, and hard problems solved by week" height={300}>
            <BarChart data={codingPractice.weeklyProgress} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="easy" stackId="level" fill="var(--primary)" radius={[0, 0, 8, 8]} name="Easy" />
              <Bar dataKey="medium" stackId="level" fill="var(--orange)" name="Medium" />
              <Bar dataKey="hard" stackId="level" fill="var(--red)" radius={[8, 8, 0, 0]} name="Hard" />
            </BarChart>
          </ChartShell>
        </div>
      </section> : null}

      {attendanceEnabled ? <section className="space-y-6">
        <SectionHeading
          title="Attendance Analytics"
          description="Track overall attendance, monthly movement, subject-wise risk, and recovery actions."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={CalendarCheck} label="Overall Attendance" value={`${attendanceSummary.percentage}%`} helper={attendanceAnalytics.improvement} tone={toneForPercentage(attendanceSummary.percentage)} />
          <MetricCard icon={UserCheck} label="Present" value={attendanceSummary.presentDays} helper="Classes attended" tone="primary" />
          <MetricCard icon={Clock3} label="Late" value={attendanceSummary.lateDays} helper="Late arrivals" tone="orange" />
          <MetricCard icon={UserX} label="Absent" value={attendanceSummary.absentDays} helper="Classes missed" tone="red" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartShell title="Monthly Attendance Chart" description="Attendance percentage by month" height={300}>
            <BarChart data={attendance} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis domain={[70, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="percentage" fill="var(--primary)" radius={[12, 12, 0, 0]} name="Attendance %" />
            </BarChart>
          </ChartShell>

          <ChartShell title="Weekly Attendance Trend" description="Present, late, and absent classes this week" height={300}>
            <LineChart data={attendanceAnalytics.weeklyTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line dataKey="present" stroke="var(--primary)" strokeWidth={3} name="Present" />
              <Line dataKey="late" stroke="var(--orange)" strokeWidth={3} name="Late" />
              <Line dataKey="absent" stroke="var(--red)" strokeWidth={3} name="Absent" />
            </LineChart>
          </ChartShell>
        </div>

        <PageCard title="Subject-wise Attendance" description="85% and above is safe, 75-84% needs caution, below 75% is critical.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {attendanceSummary.subjectWise.map((subject) => (
              <article key={subject.subject} className="rounded-3xl border border-border bg-surface-soft p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-text-primary">{subject.subject}</h3>
                    <p className="mt-1 text-[13px] text-text-secondary">{subject.attendedClasses}/{subject.totalClasses} classes attended</p>
                  </div>
                  <ToneBadge label={`${subject.percentage}%`} tone={toneForPercentage(subject.percentage)} />
                </div>
                <div className="mt-5">
                  <MiniProgress label="Attendance" value={subject.percentage} tone={toneForPercentage(subject.percentage)} />
                </div>
              </article>
            ))}
          </div>
        </PageCard>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
          <PageCard title="Low Attendance Warnings" description="Subjects requiring immediate attendance recovery." icon={AlertTriangle}>
            <div className="space-y-3">
              {lowAttendanceSubjects.map((subject) => (
                <article key={subject.subject} className="rounded-2xl bg-red-soft p-4 text-red">
                  <h3 className="text-[15px] font-extrabold">{subject.subject}: {subject.percentage}%</h3>
                  <p className="mt-1 text-[13px] font-semibold">Attend the next 3 classes to recover toward your semester average.</p>
                </article>
              ))}
            </div>
          </PageCard>

          <PageCard title="Improvement Recommendation" description="A simple recovery plan for the next week.">
            <div className="grid gap-3 md:grid-cols-3">
              <RecoveryStep title="Attend" text="Prioritize React and Python classes this week." />
              <RecoveryStep title="Review" text="Check missed class notes before each lab." />
              <RecoveryStep title="Confirm" text="Ask mentor to verify attendance after sessions." />
            </div>
          </PageCard>
        </div>
      </section> : null}
    </StudentPage>
  );
}

function SectionHeading({ description, title }: { description: string; title: string }) {
  return (
    <div>
      <h2 className="text-[24px] font-extrabold leading-8 text-text-primary">{title}</h2>
      <p className="mt-1 max-w-3xl text-[14px] leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

function RecoveryStep({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-2xl bg-surface-soft p-4">
      <h3 className="text-[15px] font-extrabold text-text-primary">{title}</h3>
      <p className="mt-2 text-[13px] leading-5 text-text-secondary">{text}</p>
    </div>
  );
}
