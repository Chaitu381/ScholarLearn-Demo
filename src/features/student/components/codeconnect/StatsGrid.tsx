import { BarChart3, Flame, Medal, Target, Trophy, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PracticeHubStats } from "../../types/codeconnect.types";

type StatsGridProps = {
  stats: PracticeHubStats;
};

type StatItem = {
  helper: string;
  icon: LucideIcon;
  label: string;
  toneClass: string;
  value: string | number;
};

export function StatsGrid({ stats }: StatsGridProps) {
  const statItems: StatItem[] = [
    {
      helper: "Daily practice active",
      icon: Flame,
      label: "Current Streak",
      toneClass: "bg-orange-soft text-orange",
      value: `${stats.activeStreakDays} days`,
    },
    {
      helper: "Coding problems solved",
      icon: Trophy,
      label: "Total Solved",
      toneClass: "bg-primary-soft text-primary-dark",
      value: stats.totalSolved,
    },
    {
      helper: "Across practice attempts",
      icon: BarChart3,
      label: "Success Rate",
      toneClass: "bg-blue-soft text-blue",
      value: `${stats.averageAccuracy}%`,
    },
    {
      helper: "Personal best run",
      icon: Target,
      label: "Best Streak",
      toneClass: "bg-yellow-soft text-text-primary",
      value: `${stats.bestStreakDays} days`,
    },
    {
      helper: "Practice points",
      icon: Zap,
      label: "Practice XP",
      toneClass: "bg-primary-soft text-primary-dark",
      value: stats.practiceXp,
    },
    {
      helper: "Current progress tier",
      icon: Medal,
      label: "Current Level",
      toneClass: "bg-orange-soft text-orange",
      value: stats.currentLevel,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {statItems.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.label} className="rounded-3xl border border-border bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold uppercase text-text-muted">{item.label}</p>
                <p className="mt-3 text-[26px] font-extrabold leading-none text-text-primary">{item.value}</p>
              </div>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.toneClass}`}>
                <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-text-secondary">{item.helper}</p>
          </article>
        );
      })}
    </section>
  );
}
