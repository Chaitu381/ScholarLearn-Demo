import { Flame } from "lucide-react";
import type { StudentStreak } from "../../types/gamification.types";
import { findGamificationStreak, formatGamificationStreak } from "./gamificationUtils";
import { GamificationMetricPanel } from "./GamificationMetricPanel";

export function StreakCard({ streaks }: { streaks: StudentStreak[] }) {
  const attendance = findGamificationStreak(streaks, "ATTENDANCE");
  const test = findGamificationStreak(streaks, "TEST");
  const coding = findGamificationStreak(streaks, "CODING");

  return (
    <GamificationMetricPanel
      icon={Flame}
      label="Streaks"
      tone="orange"
      value={formatGamificationStreak(attendance)}
      helper="Attendance, tests, and coding"
    >
      <div className="grid gap-2 text-[13px] font-bold text-text-secondary">
        <StreakLine label="Attendance" streak={attendance} />
        <StreakLine label="Test" streak={test} />
        <StreakLine label="Coding" streak={coding} />
      </div>
    </GamificationMetricPanel>
  );
}

function StreakLine({ label, streak }: { label: string; streak: StudentStreak | undefined }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
      <span>{label}</span>
      <span className="font-extrabold text-text-primary">{formatGamificationStreak(streak)}</span>
    </div>
  );
}
