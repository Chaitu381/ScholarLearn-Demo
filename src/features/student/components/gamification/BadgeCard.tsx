import { BadgeCheck, LockKeyhole } from "lucide-react";
import { ToneBadge } from "../StudentPagePrimitives";
import type { Badge, StudentBadge } from "../../types/gamification.types";
import { formatGamificationDate } from "./gamificationUtils";

type BadgeCardProps =
  | {
      badge: Badge;
      locked: true;
      studentBadge?: never;
    }
  | {
      badge?: never;
      locked?: false;
      studentBadge: StudentBadge;
    };

export function BadgeCard(props: BadgeCardProps) {
  if (props.locked) {
    return <LockedBadgeCard badge={props.badge} />;
  }

  const badge = props.studentBadge;

  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-soft text-text-primary">
          <BadgeCheck aria-hidden="true" size={23} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-extrabold text-text-primary">{badge.badge?.name ?? `Badge ${badge.badgeId}`}</h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-text-secondary">{badge.badge?.description ?? "No description returned."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {badge.badge?.rarity ? <ToneBadge label={badge.badge.rarity} tone="yellow" /> : null}
            <ToneBadge label={badge.awardedAt ? `Earned ${formatGamificationDate(badge.awardedAt)}` : "Earned"} tone="primary" />
          </div>
        </div>
      </div>
    </article>
  );
}

function LockedBadgeCard({ badge }: { badge: Badge }) {
  return (
    <article className="rounded-2xl border border-dashed border-border bg-surface-soft p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface text-text-muted shadow-card">
          <LockKeyhole aria-hidden="true" size={22} strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-extrabold text-text-primary">{badge.name}</h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-text-secondary">{badge.description ?? "Locked badge description unavailable."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {badge.rarity ? <ToneBadge label={badge.rarity} tone="neutral" /> : null}
            <ToneBadge label="Locked" tone="neutral" />
          </div>
        </div>
      </div>
    </article>
  );
}
