import { useMemo } from 'react';
import { config } from '../config';
import { filterArticlesBySearch, paginateArticles } from '../utils/search';

/**
 * Applies client-side search + pagination on top of a fetched article list.
 */
export default function useClientSearchFeed({
  articles,
  searchQuery,
  page,
  apiCount,
  apiNext,
  apiPrevious,
  apiCurrentPage,
}) {
  const pageSize = config.articlesPerPage;
  const isClientSearch = Boolean(searchQuery);

  const filtered = useMemo(
    () => filterArticlesBySearch(articles, searchQuery),
    [articles, searchQuery]
  );

  const visible = useMemo(() => {
    if (!isClientSearch) return articles;
    return paginateArticles(filtered, page, pageSize);
  }, [articles, filtered, isClientSearch, page, pageSize]);

  const pagination = useMemo(() => {
    if (!isClientSearch) {
      return {
        currentPage: apiCurrentPage,
        hasNext: Boolean(apiNext),
        hasPrevious: Boolean(apiPrevious),
        totalCount: apiCount,
      };
    }
    return {
      currentPage: page,
      hasNext: page * pageSize < filtered.length,
      hasPrevious: page > 1,
      totalCount: filtered.length,
    };
  }, [
    isClientSearch,
    page,
    pageSize,
    filtered.length,
    apiCurrentPage,
    apiNext,
    apiPrevious,
    apiCount,
  ]);

  return {
    visible,
    filteredCount: filtered.length,
    isClientSearch,
    isEmpty: isClientSearch && filtered.length === 0,
    pagination,
  };
}
