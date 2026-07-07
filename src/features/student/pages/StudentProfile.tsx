import { Award, CalendarCheck, GraduationCap, Medal, UserRound } from "lucide-react";
import { RoleProfilePage } from "../../../shared/components/profile/RoleProfilePage";
import { InfoRow, MetricCard, PageCard, StudentPage, ToneBadge } from "../components/StudentPagePrimitives";
import { useStudentDashboard } from "../hooks/useStudentDashboard";

export function StudentProfile() {
  const {
    achievements,
    attendanceSummary,
    codingPractice,
    leaderboardPreview,
    profile,
    testPerformance,
  } = useStudentDashboard();

  return (
    <StudentPage>
      <RoleProfilePage
        roleKind="student"
        roleLabel="Student"
        extraContent={
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={CalendarCheck} label="Attendance" value={`${attendanceSummary.percentage}%`} helper="Semester attendance" tone="primary" />
              <MetricCard icon={Award} label="Average Score" value={`${testPerformance.averageScore}%`} helper="Across assessments" tone="blue" />
              <MetricCard icon={Medal} label="Current Rank" value={`#${leaderboardPreview.currentRank}`} helper={`${leaderboardPreview.totalStudents} batch students`} tone="yellow" />
              <MetricCard icon={GraduationCap} label="Coding Streak" value={`${codingPractice.streakDays} days`} helper={`Best: ${codingPractice.bestStreakDays} days`} tone="orange" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <PageCard title="Student Details" description="Course context and enrollment information." icon={UserRound}>
                <div className="rounded-2xl bg-surface-soft p-4">
                  <InfoRow label="Course" value={profile.course} />
                  <InfoRow label="Batch" value={profile.batch} />
                  <InfoRow label="Student ID" value={profile.id} />
                  <InfoRow label="Mentor" value={profile.mentor} />
                  <InfoRow label="Enrollment" value={formatDate(profile.enrollmentDate)} />
                  <InfoRow label="Location" value={profile.location} />
                </div>
              </PageCard>

              <PageCard title="Academic Summary" description="Current semester health snapshot.">
                <div className="rounded-2xl bg-surface-soft p-4">
                  <InfoRow label="Rank" value={`#${leaderboardPreview.currentRank}`} />
                  <InfoRow label="Attendance" value={`${attendanceSummary.percentage}%`} />
                  <InfoRow label="Average Score" value={`${testPerformance.averageScore}%`} />
                  <InfoRow label="Problems Solved" value={codingPractice.totalProblemsSolved} />
                  <InfoRow label="XP Points" value={leaderboardPreview.currentStudent.points} />
                </div>
              </PageCard>
            </div>

            <PageCard title="Achievements & Badges" description="Progress markers earned through steady work.">
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <article key={achievement.id} className="rounded-2xl bg-surface-soft p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-yellow-soft text-text-primary">
                        <Award aria-hidden="true" size={19} strokeWidth={2.5} />
                      </span>
                      <div>
                        <ToneBadge label={achievement.title} tone={achievement.tone} />
                        <p className="mt-2 text-[13px] leading-5 text-text-secondary">{achievement.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </PageCard>
          </>
        }
      />
    </StudentPage>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}
