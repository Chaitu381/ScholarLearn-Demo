export type ScholarLearnTestNotificationStatus = "live" | "starts-soon" | "upcoming";

export type ScholarLearnTestNotificationType = "Weekly" | "Monthly" | "Final" | "Practice" | "Coding";

export type ScholarLearnHeaderTestNotification = {
  id: string;
  startTime: string;
  status: ScholarLearnTestNotificationStatus;
  targetPage: "coding" | "tests";
  testName: string;
  testType: ScholarLearnTestNotificationType;
};

export const scholarLearnHeaderTestNotifications: ScholarLearnHeaderTestNotification[] = [
  {
    id: "weekly-java-foundations",
    startTime: "Today, 4:00 PM",
    status: "live",
    targetPage: "tests",
    testName: "Java Foundations Weekly Test",
    testType: "Weekly",
  },
  {
    id: "monthly-aptitude-sprint",
    startTime: "Today, 6:30 PM",
    status: "starts-soon",
    targetPage: "tests",
    testName: "Aptitude Monthly Sprint",
    testType: "Monthly",
  },
  {
    id: "coding-arrays-practice",
    startTime: "Tomorrow, 10:00 AM",
    status: "upcoming",
    targetPage: "coding",
    testName: "Arrays & Strings Coding Drill",
    testType: "Coding",
  },
  {
    id: "final-module-mock",
    startTime: "Fri, 9:00 AM",
    status: "upcoming",
    targetPage: "tests",
    testName: "Full Stack Final Mock",
    testType: "Final",
  },
  {
    id: "practice-verbal-review",
    startTime: "Sat, 11:30 AM",
    status: "upcoming",
    targetPage: "tests",
    testName: "Verbal Practice Review",
    testType: "Practice",
  },
];
