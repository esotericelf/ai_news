import { Link, useSearchParams } from 'react-router-dom';

export default function Pagination({ currentPage, hasNext, hasPrevious, totalCount }) {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const buildLink = (page) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (search) params.set('search', search);
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  };

  if (!hasNext && !hasPrevious) return null;

  return (
    <nav className="pagination" aria-label="Article pages">
      {hasPrevious ? (
        <Link to={buildLink(currentPage - 1)} className="btn btn--ghost pagination__prev" rel="prev">
          ← Newer
        </Link>
      ) : null}
      {totalCount != null && (
        <span className="pagination__meta">{totalCount} articles</span>
      )}
      {hasNext ? (
        <Link to={buildLink(currentPage + 1)} className="btn btn--ghost pagination__next" rel="next">
          Older →
        </Link>
      ) : null}
    </nav>
  );
}
