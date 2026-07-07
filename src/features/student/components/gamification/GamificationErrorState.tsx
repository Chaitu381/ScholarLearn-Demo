export function GamificationErrorState({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-yellow bg-yellow-soft p-4 text-[14px] font-bold text-text-primary shadow-card">
      {message}
    </div>
  );
}
