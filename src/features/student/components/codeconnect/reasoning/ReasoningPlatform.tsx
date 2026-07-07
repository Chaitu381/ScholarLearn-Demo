import { reasoningQuestions } from "../../../data/codeconnectMockData";
import { QuestionList } from "../shared/QuestionList";

type ReasoningPlatformProps = {
  initialQuestionId?: string;
  onSelectQuestion?: (questionId: string) => void;
};

export function ReasoningPlatform({
  initialQuestionId,
  onSelectQuestion,
}: ReasoningPlatformProps) {
  return (
    <QuestionList
      activeQuestionId={initialQuestionId}
      category="reasoning"
      description="Practice reasoning by topic and difficulty. Start opens the real MCQ workspace with visible answer options."
      onSelectQuestion={onSelectQuestion}
      questions={reasoningQuestions}
      title="Reasoning Questions"
    />
  );
}
