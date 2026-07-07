import type { PracticeQuestion } from "../../../types/codeconnect.types";

export function getPracticeQuestionPoints(question: PracticeQuestion) {
  if (question.points) {
    return question.points;
  }

  if (question.difficulty === "hard") {
    return 40;
  }

  if (question.difficulty === "medium") {
    return 25;
  }

  return 15;
}

export function formatPracticeLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ");
}
