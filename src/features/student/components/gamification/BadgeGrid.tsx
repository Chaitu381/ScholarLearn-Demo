import type { Badge, StudentBadge } from "../../types/gamification.types";
import { BadgeCard } from "./BadgeCard";
import { GamificationEmptyState } from "./GamificationEmptyState";

export function BadgeGrid({
  badges,
  emptyDescription,
  emptyTitle,
  locked = false,
}: {
  badges: Array<Badge | StudentBadge>;
  emptyDescription: string;
  emptyTitle: string;
  locked?: boolean;
}) {
  if (!badges.length) {
    return <GamificationEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {badges.map((badge) =>
        locked ? (
          <BadgeCard key={String((badge as Badge).badgeId)} badge={badge as Badge} locked />
        ) : (
          <BadgeCard
            key={String((badge as StudentBadge).studentBadgeId ?? `${(badge as StudentBadge).badgeId}-${(badge as StudentBadge).awardedAt ?? "earned"}`)}
            studentBadge={badge as StudentBadge}
          />
        ),
      )}
    </div>
  );
}
