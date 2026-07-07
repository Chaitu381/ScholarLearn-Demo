import type { ChallengeCardItem } from "./ChallengeCard";
import { ChallengeCard } from "./ChallengeCard";

export type QuestCardItem = ChallengeCardItem & {
  type?: string;
};

export function QuestCard({ item }: { item: QuestCardItem }) {
  return <ChallengeCard item={item} />;
}
