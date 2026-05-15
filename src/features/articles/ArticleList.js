import ArticleCard from './ArticleCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function ArticleList({ articles, loading, leadArticle }) {
  const rest = leadArticle
    ? articles.filter((a) => a.slug !== leadArticle.slug)
    : articles;

  if (loading) {
    return (
      <section className="story-section">
        <SectionHeader title="Latest Stories" />
        <div className="story-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!rest.length) return null;

  const [first, ...others] = rest;

  return (
    <section className="story-section" aria-label="Latest stories">
      <SectionHeader title="Latest Stories" subtitle="Curated AI and technology coverage" />
      <div className="story-grid story-grid--lead">
        {first && <ArticleCard article={first} variant="wide" />}
      </div>
      <div className="story-grid">
        {others.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
