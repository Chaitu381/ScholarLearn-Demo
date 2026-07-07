import { aptitudeQuestions } from "../../../data/codeconnectMockData";
import { MCQPracticeWorkspace } from "../shared/MCQPracticeWorkspace";

type AptitudeWorkspaceProps = {
  initialQuestionId?: string;
  onBackToHub: () => void;
};

export function AptitudeWorkspace({
  initialQuestionId,
  onBackToHub,
}: AptitudeWorkspaceProps) {
  return (
    <MCQPracticeWorkspace
      category="aptitude"
      initialQuestionId={initialQuestionId}
      onBackToHub={onBackToHub}
      questions={aptitudeQuestions}
      title="Aptitude MCQ Workspace"
    />
  );
}
