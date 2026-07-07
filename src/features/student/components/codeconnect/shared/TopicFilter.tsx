type TopicFilterProps = {
  activeTopic: string;
  onTopicChange: (topic: string) => void;
  topics: string[];
};

export function TopicFilter({ activeTopic, onTopicChange, topics }: TopicFilterProps) {
  const topicOptions = ["All", ...topics];

  return (
    <section className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-3">
        <p className="text-[12px] font-extrabold uppercase text-text-muted">Topic filter</p>
        <h2 className="mt-1 text-[18px] font-extrabold text-text-primary">Choose topic</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {topicOptions.map((topic) => (
          <button
            key={topic}
            type="button"
            className={
              activeTopic === topic
                ? "rounded-2xl bg-primary px-3 py-2 text-[12px] font-extrabold text-white"
                : "rounded-2xl bg-surface-soft px-3 py-2 text-[12px] font-extrabold text-text-secondary transition hover:bg-primary-soft hover:text-primary-dark"
            }
            onClick={() => onTopicChange(topic)}
          >
            {topic}
          </button>
        ))}
      </div>
    </section>
  );
}
