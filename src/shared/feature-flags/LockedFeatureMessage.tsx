import { LockKeyhole } from "lucide-react";
import type { InstituteFeatureName } from "./InstituteFeatureAccess";

type LockedFeatureMessageProps = {
  featureName: InstituteFeatureName;
  roleLabel?: string;
};

export function LockedFeatureMessage({ featureName, roleLabel = "your institute" }: LockedFeatureMessageProps) {
  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-6 text-center shadow-card sm:p-8">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-orange-soft text-orange">
        <LockKeyhole aria-hidden="true" size={24} strokeWidth={2.5} />
      </span>
      <p className="mt-5 text-[12px] font-extrabold uppercase tracking-[0.12em] text-text-muted">Module disabled</p>
      <h1 className="mt-2 text-[28px] font-extrabold leading-tight text-text-primary">{formatFeatureLabel(featureName)} is locked</h1>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-text-secondary">
        This module is currently disabled for {roleLabel}. Please contact the institute administrator or ScholarLearn
        platform owner if you need access.
      </p>
    </section>
  );
}

function formatFeatureLabel(featureName: string) {
  return featureName
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
