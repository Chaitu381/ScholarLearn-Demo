import { aptitudeQuestions } from "../../../data/codeconnectMockData";
import { QuestionList } from "../shared/QuestionList";

type AptitudePlatformProps = {
  initialQuestionId?: string;
  onSelectQuestion?: (questionId: string) => void;
};

export function AptitudePlatform({
  initialQuestionId,
  onSelectQuestion,
}: AptitudePlatformProps) {
  return (
    <QuestionList
      activeQuestionId={initialQuestionId}
      category="aptitude"
      description="Practice aptitude by topic and difficulty. Start opens the real MCQ workspace with visible answer options."
      onSelectQuestion={onSelectQuestion}
      questions={aptitudeQuestions}
      title="Aptitude Questions"
    />
  );
}
