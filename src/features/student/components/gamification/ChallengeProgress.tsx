import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import type { GamificationProgressStatus } from "../../types/gamification.types";
import { getGamificationStatusStyle } from "./gamificationUtils";

export function ChallengeProgress({
  progress,
  status,
}: {
  progress: number;
  status: GamificationProgressStatus;
}) {
  const statusStyle = getGamificationStatusStyle(status);

  return <ProgressBar value={progress} tone={statusStyle.tone} showValue />;
}
