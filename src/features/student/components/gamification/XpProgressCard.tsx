import { Zap } from "lucide-react";
import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import type { StudentLevel, StudentXp } from "../../types/gamification.types";
import { formatGamificationNumber, readGamificationProgress } from "./gamificationUtils";
import { GamificationMetricPanel } from "./GamificationMetricPanel";

export function XpProgressCard({ level, xp }: { level: StudentLevel | null; xp: StudentXp | null }) {
  const totalXp = xp?.totalXp ?? xp?.lifetimeXp ?? level?.totalXp;
  const nextLevelXp = level?.nextLevelXp ?? xp?.xpToNextLevel;
  const progress = readGamificationProgress(level?.progressPercentage);

  return (
    <GamificationMetricPanel
      icon={Zap}
      label="XP"
      tone="primary"
      value={formatGamificationNumber(totalXp)}
      helper={nextLevelXp ? `Next level at ${formatGamificationNumber(nextLevelXp)} XP` : "Next level XP unavailable"}
    >
      <ProgressBar value={progress} tone="primary" showValue />
    </GamificationMetricPanel>
  );
}
