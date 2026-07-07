import { ToneBadge } from "../StudentPagePrimitives";
import type { GamificationProgressStatus } from "../../types/gamification.types";
import { cn } from "../../../../shared/utils/cn";
import { formatGamificationNumber, getGamificationStatusStyle } from "./gamificationUtils";
import { ChallengeProgress } from "./ChallengeProgress";

export type ChallengeCardItem = {
  coinReward?: number;
  description?: string;
  id: string | number;
  progress: number;
  status: GamificationProgressStatus;
  subtitle?: string;
  title: string;
  xpReward?: number;
};

export function ChallengeCard({ item }: { item: ChallengeCardItem }) {
  const status = getGamificationStatusStyle(item.status);

  return (
    <article className="rounded-2xl bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-extrabold text-text-primary">{item.title}</h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-text-secondary">
            {item.subtitle ?? item.description ?? "No description returned."}
          </p>
        </div>
        <span className={cn("h-7 shrink-0 rounded-full px-3 text-[12px] font-extrabold leading-7", status.className)}>
          {status.label}
        </span>
      </div>
      <div className="mt-4">
        <ChallengeProgress progress={item.progress} status={item.status} />
      </div>
      <RewardLine xp={item.xpReward} coins={item.coinReward} />
    </article>
  );
}

function RewardLine({ coins, xp }: { coins?: number; xp?: number }) {
  if (!coins && !xp) {
    return <p className="mt-3 text-[12px] font-bold text-text-muted">Reward not reported</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {xp ? <ToneBadge label={`${formatGamificationNumber(xp)} XP`} tone="blue" /> : null}
      {coins ? <ToneBadge label={`${formatGamificationNumber(coins)} coins`} tone="yellow" /> : null}
    </div>
  );
}
