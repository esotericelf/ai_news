import { Link } from 'react-router-dom';

export default function SearchEmptyState({ query }) {
  return (
    <div className="search-results__empty" role="status">
      <p className="search-results__empty-title">
        No articles found matching &lsquo;{query}&rsquo;.
      </p>
      <p className="search-results__empty-hint">
        Try a shorter phrase, check spelling, or pick a related topic below.
      </p>
      <Link to="/topics" className="search-results__empty-link">
        Browse all topics →
      </Link>
    </div>
  );
}
