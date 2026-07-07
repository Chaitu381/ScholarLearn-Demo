import { motion } from "framer-motion";
import { useInstituteFeatureAccess } from "../../../shared/feature-flags/InstituteFeatureAccess";
import { AttendanceAnalyticsCard } from "../components/dashboard/AttendanceAnalyticsCard";
import { CodingProgressCard } from "../components/dashboard/CodingProgressCard";
import { DailyProgressCard } from "../components/dashboard/DailyProgressCard";
import { LeaderboardPreviewCard } from "../components/dashboard/LeaderboardPreviewCard";
import { RecentActivityCard } from "../components/dashboard/RecentActivityCard";
import { RecommendationsCard } from "../components/dashboard/RecommendationsCard";
import { StudentGamificationSection } from "../components/dashboard/StudentGamificationSection";
import { StudentOverviewGrid } from "../components/dashboard/StudentOverviewGrid";
import { StudentWelcomeHero } from "../components/dashboard/StudentWelcomeHero";
import { SubjectPerformanceCard } from "../components/dashboard/SubjectPerformanceCard";
import { TestPerformanceCard } from "../components/dashboard/TestPerformanceCard";
import { UpcomingAssignmentsCard } from "../components/dashboard/UpcomingAssignmentsCard";
import { UpcomingTestsCard } from "../components/dashboard/UpcomingTestsCard";
import { useStudentDashboard } from "../hooks/useStudentDashboard";

export function StudentDashboard() {
  const dashboard = useStudentDashboard();
  const { isFeatureEnabled } = useInstituteFeatureAccess();
  const attendanceEnabled = isFeatureEnabled("ATTENDANCE");
  const assignmentsEnabled = isFeatureEnabled("ASSIGNMENTS");
  const codingEnabled = isFeatureEnabled("CODING");
  const gamificationEnabled = isFeatureEnabled("GAMIFICATION");
  const leaderboardEnabled = isFeatureEnabled("LEADERBOARD");
  const testsEnabled = isFeatureEnabled("TESTS");

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,65fr)_minmax(280px,35fr)]">
        <StudentWelcomeHero profile={dashboard.profile} />
        <DailyProgressCard progress={dashboard.dailyProgress} />
      </div>

      <StudentOverviewGrid stats={dashboard.overviewStats} />

      {gamificationEnabled ? <StudentGamificationSection /> : null}

      {attendanceEnabled || testsEnabled ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {attendanceEnabled ? (
            <AttendanceAnalyticsCard analytics={dashboard.attendanceAnalytics} overallPercentage={dashboard.attendanceSummary.percentage} />
          ) : null}
          {testsEnabled ? <TestPerformanceCard performance={dashboard.testPerformance} /> : null}
        </div>
      ) : null}

      {codingEnabled ? <CodingProgressCard coding={dashboard.codingPractice} /> : null}

      <div className="grid gap-6">
        <SubjectPerformanceCard subjects={dashboard.subjects} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,33fr)_minmax(0,33fr)_minmax(0,34fr)]">
        {assignmentsEnabled ? <UpcomingAssignmentsCard assignments={dashboard.assignments} /> : null}
        {testsEnabled ? <UpcomingTestsCard tests={dashboard.upcomingTests} /> : null}
        <RecentActivityCard activity={dashboard.recentActivity} />
      </div>

      <RecommendationsCard recommendations={dashboard.recommendations} />
    </motion.div>
  );
}
