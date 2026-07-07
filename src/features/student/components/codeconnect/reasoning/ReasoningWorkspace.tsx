import { reasoningQuestions } from "../../../data/codeconnectMockData";
import { MCQPracticeWorkspace } from "../shared/MCQPracticeWorkspace";

type ReasoningWorkspaceProps = {
  initialQuestionId?: string;
  onBackToHub: () => void;
};

export function ReasoningWorkspace({
  initialQuestionId,
  onBackToHub,
}: ReasoningWorkspaceProps) {
  return (
    <MCQPracticeWorkspace
      category="reasoning"
      initialQuestionId={initialQuestionId}
      onBackToHub={onBackToHub}
      questions={reasoningQuestions}
      title="Reasoning MCQ Workspace"
    />
  );
}
