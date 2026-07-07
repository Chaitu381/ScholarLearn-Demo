import { verbalQuestions } from "../../../data/codeconnectMockData";
import { QuestionList } from "../shared/QuestionList";

type VerbalPlatformProps = {
  initialQuestionId?: string;
  onSelectQuestion?: (questionId: string) => void;
};

export function VerbalPlatform({
  initialQuestionId,
  onSelectQuestion,
}: VerbalPlatformProps) {
  return (
    <QuestionList
      activeQuestionId={initialQuestionId}
      category="verbal"
      description="Practice verbal questions, comprehension, and vocabulary by topic. Start opens the real MCQ workspace with visible answer options."
      onSelectQuestion={onSelectQuestion}
      questions={verbalQuestions}
      title="Verbal Questions"
    />
  );
}
