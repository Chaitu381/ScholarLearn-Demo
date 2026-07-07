export type MCQPracticeCategory = "aptitude" | "reasoning" | "verbal";
export type MCQDifficulty = "easy" | "medium" | "hard";
export type MCQStatus = "solved" | "attempted" | "not-started" | "in-progress" | "review";

export type MCQOptionObject = {
  id?: string;
  label?: string;
  text?: string;
  value?: string;
};

export type MCQPracticeQuestion = {
  id: string;
  topic: string;
  difficulty: MCQDifficulty;
  title?: string;
  question?: string;
  prompt?: string;
  description?: string;
  passage?: string;
  vocabularyNote?: string;
  options?: string[] | MCQOptionObject[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
  xp?: number;
  accuracy?: number;
  questionNumber?: string | number;
  problemNumber?: string | number;
  status?: MCQStatus;
  bookmarked?: boolean;
};

export type NormalizedMCQOption = {
  key: string;
  label: string;
  value: string;
};

const optionLetters = ["A", "B", "C", "D", "E", "F"];

export function formatCategoryLabel(category: MCQPracticeCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function formatDifficultyLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ");
}

export function getQuestionTitle(question: MCQPracticeQuestion) {
  return (
    question.title ??
    question.question ??
    question.prompt ??
    question.description ??
    "Untitled question"
  );
}

export function getQuestionText(question: MCQPracticeQuestion) {
  return (
    question.question ??
    question.prompt ??
    question.description ??
    question.title ??
    "Untitled question"
  );
}

export function getQuestionNumber(question: MCQPracticeQuestion) {
  return question.questionNumber ?? question.problemNumber ?? question.id;
}

export function getQuestionPoints(question: MCQPracticeQuestion) {
  if (typeof question.points === "number") {
    return question.points;
  }

  if (typeof question.xp === "number") {
    return question.xp;
  }

  if (question.difficulty === "hard") {
    return 40;
  }

  if (question.difficulty === "medium") {
    return 25;
  }

  return 15;
}

export function normalizeQuestionOptions(question: MCQPracticeQuestion) {
  const rawOptions = question.options ?? [];

  return rawOptions.map<NormalizedMCQOption>((option, index) => {
    const fallbackLabel = optionLetters[index] ?? `${index + 1}`;

    if (typeof option === "string") {
      return {
        key: option,
        label: fallbackLabel,
        value: option,
      };
    }

    const value = option.value ?? option.text ?? option.label ?? option.id ?? "";

    return {
      key: option.id ?? option.value ?? option.text ?? `${fallbackLabel}-${index}`,
      label: option.label ?? fallbackLabel,
      value,
    };
  });
}

export function getCorrectAnswerValue(question: MCQPracticeQuestion) {
  const correctAnswer = question.correctAnswer ?? "";
  const options = normalizeQuestionOptions(question);

  const byLetter = options.find(
    (option) => option.label.toLowerCase() === correctAnswer.toLowerCase(),
  );

  if (byLetter) {
    return byLetter.value;
  }

  const byValue = options.find(
    (option) => option.value.toLowerCase() === correctAnswer.toLowerCase(),
  );

  return byValue?.value ?? correctAnswer;
}

export function isAnswerCorrect(question: MCQPracticeQuestion, answer?: string) {
  if (!answer) {
    return false;
  }

  return answer.trim().toLowerCase() === getCorrectAnswerValue(question).trim().toLowerCase();
}
