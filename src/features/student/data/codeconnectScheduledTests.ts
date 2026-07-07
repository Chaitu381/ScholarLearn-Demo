import {
  aptitudeQuestions,
  reasoningQuestions,
  verbalQuestions,
} from "./codeconnectMockData";
import type {
  CodeConnectScheduledTest,
  PracticeQuestion,
} from "../types/codeconnect.types";

type ScheduledTestInput = Omit<
  CodeConnectScheduledTest,
  "questionIds" | "totalPoints" | "totalQuestions"
> & {
  questions: PracticeQuestion[];
  requestedQuestions: number;
};

type PracticeQuestionWithOptionalPoints = PracticeQuestion & {
  points?: number;
  xp?: number;
};

const nowMs = Date.now();

const activeFrom = new Date(nowMs - 15 * 60 * 1000);
const activeUntil = new Date(nowMs + 2 * 60 * 60 * 1000);

const upcomingFrom = new Date(nowMs + 20 * 60 * 1000);
const upcomingUntil = new Date(nowMs + 2 * 60 * 60 * 1000);

export const codeconnectScheduledTests: CodeConnectScheduledTest[] = [
  createScheduledTest({
    id: "scheduled-aptitude-full-mock",
    title: "Full Aptitude Mock Test",
    category: "aptitude",
    description:
      "Teacher-scheduled aptitude mock covering percentages, ratios, probability, profit-loss, and time-work.",
    durationMinutes: 90,
    scheduledAt: "2026-07-04T09:00:00+05:30",
    availableFrom: "2026-07-04T09:00:00+05:30",
    availableUntil: "2026-07-04T10:30:00+05:30",
    status: "available",
    createdBy: "Senior Lecturer",
    requestedQuestions: 66,
    questions: aptitudeQuestions,
  }),
  createScheduledTest({
    id: "scheduled-reasoning-weekly",
    title: "Reasoning Weekly Test",
    category: "reasoning",
    description:
      "Weekly reasoning test focused on series, directions, blood relations, analogy, and syllogism.",
    durationMinutes: 45,
    scheduledAt: "2026-07-04T15:00:00+05:30",
    availableFrom: "2026-07-04T15:00:00+05:30",
    availableUntil: "2026-07-04T15:45:00+05:30",
    status: "upcoming",
    createdBy: "Reasoning Faculty",
    requestedQuestions: 45,
    questions: reasoningQuestions,
  }),
  createScheduledTest({
    id: "scheduled-verbal-grammar",
    title: "Verbal Grammar Test",
    category: "verbal",
    description:
      "Timed verbal grammar mock covering vocabulary, sentence correction, grammar, and reading comprehension.",
    durationMinutes: 40,
    scheduledAt: "2026-07-04T17:00:00+05:30",
    availableFrom: "2026-07-04T17:00:00+05:30",
    availableUntil: "2026-07-04T17:40:00+05:30",
    status: "upcoming",
    createdBy: "Verbal Faculty",
    requestedQuestions: 40,
    questions: verbalQuestions,
  }),
  createScheduledTest({
    id: "scheduled-demo-active-test",
    title: "Demo Weekly Active Test",
    category: "aptitude",
    description:
      "Demo weekly test that is active immediately so notification and Start Test behavior can be verified.",
    durationMinutes: 30,
    scheduledAt: activeFrom.toISOString(),
    availableFrom: activeFrom.toISOString(),
    availableUntil: activeUntil.toISOString(),
    status: "available",
    createdBy: "Senior Lecturer",
    requestedQuestions: 10,
    questions: aptitudeQuestions,
  }),
  createScheduledTest({
    id: "scheduled-demo-upcoming-test",
    title: "Demo Monthly Upcoming Test",
    category: "reasoning",
    description:
      "Demo monthly reasoning test that starts later today and shows the waiting countdown before entry.",
    durationMinutes: 20,
    scheduledAt: upcomingFrom.toISOString(),
    availableFrom: upcomingFrom.toISOString(),
    availableUntil: upcomingUntil.toISOString(),
    status: "upcoming",
    createdBy: "Reasoning Faculty",
    requestedQuestions: 8,
    questions: reasoningQuestions,
  }),
];

function createScheduledTest({
  category,
  createdBy,
  description,
  durationMinutes,
  id,
  questions,
  requestedQuestions,
  scheduledAt,
  status,
  title,
  availableFrom,
  availableUntil,
}: ScheduledTestInput): CodeConnectScheduledTest {
  const selectedQuestions = questions.slice(0, requestedQuestions);

  return {
    id,
    title,
    category,
    description,
    durationMinutes,
    scheduledAt,
    availableFrom,
    availableUntil,
    status,
    createdBy,
    questionIds: selectedQuestions.map((question) => question.id),
    totalQuestions: selectedQuestions.length,
    totalPoints: selectedQuestions.reduce(
      (total, question) => total + getQuestionPoints(question),
      0,
    ),
  };
}

function getQuestionPoints(question: PracticeQuestion): number {
  const questionWithPoints = question as PracticeQuestionWithOptionalPoints;

  if (typeof questionWithPoints.points === "number") {
    return questionWithPoints.points;
  }

  if (typeof questionWithPoints.xp === "number") {
    return questionWithPoints.xp;
  }

  if (question.difficulty === "hard") {
    return 40;
  }

  if (question.difficulty === "medium") {
    return 25;
  }

  return 15;
}