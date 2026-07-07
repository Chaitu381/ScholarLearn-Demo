import { Coins } from "lucide-react";
import type { CoinBalance } from "../../types/gamification.types";
import { formatGamificationDate, formatGamificationNumber } from "./gamificationUtils";
import { GamificationMetricPanel } from "./GamificationMetricPanel";

export function CoinsCard({ coins }: { coins: CoinBalance | null }) {
  return (
    <GamificationMetricPanel
      icon={Coins}
      label="Coins"
      tone="yellow"
      value={formatGamificationNumber(coins?.availableCoins ?? coins?.totalCoins)}
      helper={coins?.updatedAt ? `Updated ${formatGamificationDate(coins.updatedAt, false)}` : "Coin balance from backend"}
    />
  );
}
