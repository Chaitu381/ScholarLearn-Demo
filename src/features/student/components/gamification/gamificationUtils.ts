import type {
  GamificationProgressStatus,
  StudentLevel,
  StudentStreak,
  StudentXp,
} from "../../types/gamification.types";

export function formatGamificationNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? new Intl.NumberFormat("en-IN").format(value) : "-";
}

export function formatGamificationDate(value: string | undefined, withYear = true) {
  if (!value) {
    return "Not reported";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: withYear ? "numeric" : undefined,
      }).format(date);
}

export function formatGamificationLevel(level: StudentLevel | null) {
  if (!level) {
    return "-";
  }

  return level.levelName || `Level ${level.level}`;
}

export function formatRecentXp(xp: StudentXp | null) {
  if (!xp) {
    return "Recent XP not reported";
  }

  const parts = [
    typeof xp.earnedToday === "number" ? `${formatGamificationNumber(xp.earnedToday)} today` : "",
    typeof xp.earnedThisWeek === "number" ? `${formatGamificationNumber(xp.earnedThisWeek)} this week` : "",
    typeof xp.earnedThisMonth === "number" ? `${formatGamificationNumber(xp.earnedThisMonth)} this month` : "",
  ].filter(Boolean);

  return parts.length ? parts.join(" | ") : "Recent XP not reported";
}

export function readGamificationProgress(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
}

export function calculateGamificationProgress(currentValue: number | undefined, targetValue?: number) {
  const current = currentValue ?? 0;
  return targetValue && targetValue > 0 ? Math.min(Math.max((current / targetValue) * 100, 0), 100) : 0;
}

export function findGamificationStreak(streaks: StudentStreak[], type: "ATTENDANCE" | "CODING" | "TEST") {
  return streaks.find((streak) => streak.streakType?.toUpperCase().includes(type));
}

export function formatGamificationStreak(streak: StudentStreak | undefined) {
  return streak ? `${streak.currentCount} day${streak.currentCount === 1 ? "" : "s"}` : "-";
}

export function formatBestGamificationStreak(streaks: StudentStreak[]) {
  const best = streaks.reduce((max, streak) => Math.max(max, streak.longestCount ?? streak.currentCount), 0);
  return best ? `${best} day${best === 1 ? "" : "s"}` : "-";
}

export function getGamificationStatusStyle(status: GamificationProgressStatus) {
  if (status === "COMPLETED" || status === "CLAIMED") {
    return {
      className: "bg-primary-soft text-primary-dark",
      label: "Completed",
      tone: "primary" as const,
    };
  }

  if (status === "EXPIRED" || status === "FAILED") {
    return {
      className: "bg-red-soft text-red",
      label: "Expired",
      tone: "red" as const,
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      className: "bg-blue-soft text-blue",
      label: "Active",
      tone: "blue" as const,
    };
  }

  return {
    className: "bg-yellow-soft text-text-primary",
    label: "Not started",
    tone: "yellow" as const,
  };
}

export function getGamificationTime(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function getGamificationInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "S") + (parts[1]?.[0] ?? "");
}
