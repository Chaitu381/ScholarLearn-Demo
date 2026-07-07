import { verbalQuestions } from "../../../data/codeconnectMockData";
import { MCQPracticeWorkspace } from "../shared/MCQPracticeWorkspace";

type VerbalWorkspaceProps = {
  initialQuestionId?: string;
  onBackToHub: () => void;
};

export function VerbalWorkspace({
  initialQuestionId,
  onBackToHub,
}: VerbalWorkspaceProps) {
  return (
    <MCQPracticeWorkspace
      category="verbal"
      initialQuestionId={initialQuestionId}
      onBackToHub={onBackToHub}
      questions={verbalQuestions}
      title="Verbal MCQ Workspace"
    />
  );
}
