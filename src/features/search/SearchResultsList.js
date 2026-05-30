import ArticleCard from '../articles/ArticleCard';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function SearchResultsList({ articles, loading }) {
  if (loading) {
    return (
      <div className="search-results__grid search-results__grid--loading" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!articles.length) return null;

  return (
    <ul className="search-results__grid" aria-label="Search results">
      {articles.map((article) => (
        <li key={article.id || article.slug}>
          <ArticleCard article={article} />
        </li>
      ))}
    </ul>
  );
}
