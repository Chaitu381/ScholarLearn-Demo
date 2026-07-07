import type { GamificationLeaderboardEntry } from "../../types/gamification.types";
import { cn } from "../../../../shared/utils/cn";
import { ToneBadge } from "../StudentPagePrimitives";
import { formatGamificationNumber, getGamificationInitials } from "./gamificationUtils";

export function LeaderboardTable({
  compact = false,
  currentStudentId,
  entries,
}: {
  compact?: boolean;
  currentStudentId?: string | number;
  entries: GamificationLeaderboardEntry[];
}) {
  if (compact) {
    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <LeaderboardCompactRow
            current={isCurrentStudent(entry, currentStudentId)}
            entry={entry}
            key={String(entry.studentId)}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="overflow-x-auto rounded-3xl border border-border bg-surface shadow-card">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[90px_2fr_1fr_1fr_1fr_1fr] border-b border-border bg-surface-soft px-4 py-3 text-[12px] font-extrabold uppercase text-text-muted">
          <span>Rank</span>
          <span>Student</span>
          <span>XP</span>
          <span>Level</span>
          <span>Badges</span>
          <span>Coins</span>
        </div>
        <div className="divide-y divide-border">
          {entries.map((entry) => (
            <LeaderboardRow
              current={isCurrentStudent(entry, currentStudentId)}
              entry={entry}
              key={String(entry.studentId)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function LeaderboardRow({ current, entry }: { current: boolean; entry: GamificationLeaderboardEntry }) {
  return (
    <article
      className={cn(
        "grid grid-cols-[90px_2fr_1fr_1fr_1fr_1fr] items-center gap-3 px-4 py-4 text-[14px]",
        current ? "bg-primary-soft text-primary-dark" : "bg-surface text-text-primary hover:bg-surface-soft",
      )}
    >
      <span className="font-extrabold">#{entry.rank}</span>
      <div className="flex min-w-0 items-center gap-3">
        <LeaderboardAvatar entry={entry} />
        <div className="min-w-0">
          <p className="truncate font-extrabold">{entry.studentName}</p>
          {current ? <p className="mt-1 text-[12px] font-extrabold">You</p> : null}
        </div>
      </div>
      <span className="font-extrabold">{formatGamificationNumber(entry.totalXp ?? entry.points)}</span>
      <span className="font-bold">{entry.level ? `Level ${entry.level}` : "-"}</span>
      <span className="font-bold">{formatGamificationNumber(entry.badgesCount)}</span>
      <span className="font-bold">{formatGamificationNumber(entry.coins)}</span>
    </article>
  );
}

function LeaderboardCompactRow({ current, entry }: { current: boolean; entry: GamificationLeaderboardEntry }) {
  return (
    <article className={current ? "rounded-2xl bg-primary-soft p-4 text-primary-dark" : "rounded-2xl bg-surface p-4"}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-[13px] font-extrabold text-text-primary">
            #{entry.rank}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-extrabold">{entry.studentName}</p>
            <p className="mt-1 text-[12px] font-semibold opacity-80">{formatGamificationNumber(entry.totalXp ?? entry.points)} XP</p>
          </div>
        </div>
        <div className="text-right">
          {entry.level ? <p className="text-[13px] font-extrabold">Lv {entry.level}</p> : null}
          {current ? <ToneBadge label="You" tone="primary" /> : null}
        </div>
      </div>
    </article>
  );
}

function LeaderboardAvatar({ entry }: { entry: GamificationLeaderboardEntry }) {
  if (entry.avatarUrl) {
    return (
      <img
        alt={`${entry.studentName} avatar`}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
        src={entry.avatarUrl}
      />
    );
  }

  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-soft text-[13px] font-extrabold text-blue">
      {getGamificationInitials(entry.studentName)}
    </span>
  );
}

function isCurrentStudent(entry: GamificationLeaderboardEntry, currentStudentId: string | number | undefined) {
  return currentStudentId !== undefined && String(entry.studentId) === String(currentStudentId);
}
