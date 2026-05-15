export function SkeletonCard() {
  return (
    <article className="story-card story-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--media" />
      <div className="story-card__body">
        <div className="skeleton skeleton--line skeleton--short" />
        <div className="skeleton skeleton--line skeleton--title" />
        <div className="skeleton skeleton--line" />
      </div>
    </article>
  );
}

export function SkeletonHero() {
  return (
    <div className="lead-story lead-story--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--hero-media" />
      <div className="skeleton skeleton--line skeleton--title" />
    </div>
  );
}
