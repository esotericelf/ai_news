import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Pagination from '../../components/ui/Pagination';
import SearchEmptyState from './SearchEmptyState';
import SearchKeywordSuggestions from './SearchKeywordSuggestions';
import SearchResultsList from './SearchResultsList';

export default function SearchResultsView({
  display,
  visible,
  filtered,
  feedArticles,
  isEmpty,
  isSearchLoading,
  pagination,
}) {
  const hasMatches = filtered.length > 0;

  return (
    <div className="search-results-container">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Search Results' },
          { label: `"${display}"` },
        ]}
      />

      <header className="search-results__header">
        <h1 className="search-results__title">Search Results</h1>
        <p className="search-results__summary">
          {isSearchLoading ? (
            'Searching articles…'
          ) : hasMatches ? (
            <>
              <strong>{pagination.totalCount}</strong> article
              {pagination.totalCount === 1 ? '' : 's'} matching &lsquo;{display}&rsquo;
            </>
          ) : (
            <>No matches for &lsquo;{display}&rsquo;</>
          )}
        </p>
      </header>

      {isEmpty ? (
        <SearchEmptyState query={display} />
      ) : (
        <>
          <SearchResultsList articles={visible} loading={isSearchLoading} />
          {hasMatches && (
            <Pagination
              currentPage={pagination.currentPage}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              totalCount={pagination.totalCount}
            />
          )}
        </>
      )}

      <SearchKeywordSuggestions
        query={display}
        articles={feedArticles}
        matchedArticles={filtered}
        hasMatches={hasMatches}
      />
    </div>
  );
}
