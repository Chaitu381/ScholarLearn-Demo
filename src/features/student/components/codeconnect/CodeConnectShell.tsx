import type { PracticeCategory } from "../../types/codeconnect.types";
import { AptitudeWorkspace } from "./aptitude/AptitudeWorkspace";
import { CodingPlatform } from "./coding/CodingPlatform";
import { ReasoningWorkspace } from "./reasoning/ReasoningWorkspace";
import { VerbalWorkspace } from "./verbal/VerbalWorkspace";

type CodeConnectShellProps = {
  activePracticeMode: PracticeCategory;
  onBackToHub: () => void;
  selectedItemId?: string;
};

export function CodeConnectShell({
  activePracticeMode,
  onBackToHub,
  selectedItemId,
}: CodeConnectShellProps) {
  if (activePracticeMode === "coding") {
    return (
      <CodingPlatform
        initialProblemId={selectedItemId}
      />
    );
  }

  if (activePracticeMode === "aptitude") {
    return (
      <AptitudeWorkspace
        initialQuestionId={selectedItemId}
        onBackToHub={onBackToHub}
      />
    );
  }

  if (activePracticeMode === "reasoning") {
    return (
      <ReasoningWorkspace
        initialQuestionId={selectedItemId}
        onBackToHub={onBackToHub}
      />
    );
  }

  if (activePracticeMode === "verbal") {
    return (
      <VerbalWorkspace
        initialQuestionId={selectedItemId}
        onBackToHub={onBackToHub}
      />
    );
  }

  return null;
}
