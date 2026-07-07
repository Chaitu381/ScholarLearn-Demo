import { StudentPage } from "../StudentPagePrimitives";

export function GamificationSkeleton({
  cardCount = 4,
  fullPage = false,
}: {
  cardCount?: number;
  fullPage?: boolean;
}) {
  const content = (
    <>
      <div className="h-8 w-64 animate-pulse rounded-full bg-surface-soft" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-border bg-surface p-5 shadow-card">
            <div className="h-4 w-24 animate-pulse rounded-full bg-surface-soft" />
            <div className="mt-4 h-8 w-28 animate-pulse rounded-full bg-surface-soft" />
            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-surface-soft" />
          </div>
        ))}
      </div>
    </>
  );

  if (fullPage) {
    return (
      <StudentPage>
        {content}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-72 animate-pulse rounded-3xl border border-border bg-surface shadow-card" />
          <div className="h-72 animate-pulse rounded-3xl border border-border bg-surface shadow-card" />
        </div>
      </StudentPage>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      {content}
    </section>
  );
}
