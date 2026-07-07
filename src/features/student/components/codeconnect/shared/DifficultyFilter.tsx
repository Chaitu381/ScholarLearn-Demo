import type { Difficulty } from "../../../types/codeconnect.types";

export type DifficultyFilterValue = "all" | Difficulty;

type DifficultyFilterProps = {
  activeDifficulty: DifficultyFilterValue;
  onDifficultyChange: (difficulty: DifficultyFilterValue) => void;
};

const difficultyOptions: Array<{ label: string; value: DifficultyFilterValue }> = [
  { label: "All", value: "all" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

export function DifficultyFilter({ activeDifficulty, onDifficultyChange }: DifficultyFilterProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-3">
        <p className="text-[12px] font-extrabold uppercase text-text-muted">Difficulty filter</p>
        <h2 className="mt-1 text-[18px] font-extrabold text-text-primary">Select level</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {difficultyOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              activeDifficulty === option.value
                ? "h-10 rounded-2xl bg-primary px-3 text-[13px] font-extrabold text-white"
                : "h-10 rounded-2xl bg-surface-soft px-3 text-[13px] font-extrabold text-text-secondary transition hover:bg-primary-soft hover:text-primary-dark"
            }
            onClick={() => onDifficultyChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
