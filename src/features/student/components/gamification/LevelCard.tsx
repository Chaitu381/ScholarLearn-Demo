import { Star } from "lucide-react";
import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import type { StudentLevel } from "../../types/gamification.types";
import { formatGamificationLevel, readGamificationProgress } from "./gamificationUtils";
import { GamificationMetricPanel } from "./GamificationMetricPanel";

export function LevelCard({ level }: { level: StudentLevel | null }) {
  return (
    <GamificationMetricPanel
      icon={Star}
      label="Level"
      tone="blue"
      value={formatGamificationLevel(level)}
      helper={level?.level ? `Level number ${level.level}` : "Level data unavailable"}
    >
      <ProgressBar value={readGamificationProgress(level?.progressPercentage)} tone="blue" showValue />
    </GamificationMetricPanel>
  );
}
