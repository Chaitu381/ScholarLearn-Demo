import { Medal, TrendingUp, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProgressBar } from "../../../../shared/components/ui/ProgressBar";
import type { LeaderboardEntry, LeaderboardPreview } from "../../types/student.types";
import { cn } from "../../../../shared/utils/cn";

type LeaderboardPreviewCardProps = {
  preview: LeaderboardPreview;
};

export function LeaderboardPreviewCard({ preview }: LeaderboardPreviewCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-extrabold uppercase text-text-muted">Leaderboard preview</p>
          <h2 className="mt-2 text-[21px] font-extrabold text-text-primary">Rank #{preview.currentRank}</h2>
          <p className="mt-1 text-[14px] leading-6 text-text-secondary">Friendly batch competition snapshot</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow-soft text-text-primary">
          <Medal aria-hidden="true" size={24} strokeWidth={2.5} />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniMetric icon={UsersRound} label="Batch" value={`${preview.totalStudents} students`} />
        <MiniMetric icon={TrendingUp} label="Weekly gain" value={`+${preview.weeklyImprovement} ranks`} />
      </div>

      <div className="mt-5 space-y-3">
        {preview.topStudents.map((entry) => (
          <RankRow key={entry.rank} entry={entry} />
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-primary-soft p-4 text-primary-dark">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[14px] font-extrabold">{preview.currentStudent.points} XP</p>
            <p className="mt-1 text-[13px] font-semibold">
              {preview.nextRankPointsGap} XP needed to challenge rank #{preview.currentRank - 1}.
            </p>
          </div>
          <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-primary">
            #{preview.currentRank}
          </span>
        </div>
        <div className="mt-4">
          <ProgressBar label="Progress toward next rank" value={preview.progressToNextRank} tone="primary" />
        </div>
      </div>
    </section>
  );
}

function RankRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-soft p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-extrabold",
            entry.rank === 1 ? "bg-yellow-soft text-text-primary" : "bg-blue-soft text-blue",
          )}
        >
          #{entry.rank}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-extrabold text-text-primary">{entry.studentName}</p>
          <p className="text-[12px] font-semibold text-text-secondary">{entry.points} XP</p>
        </div>
      </div>
      <span className="text-[13px] font-extrabold text-text-primary">{entry.score}%</span>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-soft p-3">
      <Icon aria-hidden="true" className="text-blue" size={17} strokeWidth={2.5} />
      <p className="mt-2 text-[12px] font-bold text-text-muted">{label}</p>
      <p className="mt-1 text-[14px] font-extrabold text-text-primary">{value}</p>
    </div>
  );
}
