import { useEffect, useMemo } from 'react';
import { config } from '../config';
import { filterArticlesBySearch, paginateArticles } from '../utils/search';

/**
 * Applies client-side search + pagination on top of a fetched article list.
 * Waits for `isLoading` to finish before filtering so direct URL search
 * does not flash empty results on an empty pre-fetch list.
 */
export default function useClientSearchFeed({
  articles,
  searchQuery,
  page,
  isLoading = false,
  apiCount,
  apiNext,
  apiPrevious,
  apiCurrentPage,
}) {
  const pageSize = config.articlesPerPage;
  const isClientSearch = Boolean(searchQuery);
  const searchReady = !isClientSearch || !isLoading;

  const filtered = useMemo(() => {
    if (!isClientSearch) return articles || [];
    if (isLoading) return [];
    return filterArticlesBySearch(articles, searchQuery);
  }, [articles, searchQuery, isClientSearch, isLoading]);

  const visible = useMemo(() => {
    if (!isClientSearch) return articles || [];
    if (isLoading) return [];
    return paginateArticles(filtered, page, pageSize);
  }, [articles, filtered, isClientSearch, isLoading, page, pageSize]);

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

  useEffect(() => {
    if (isClientSearch && searchReady) {
      console.log('Raw Articles:', articles, 'Search Query:', searchQuery);
    }
  }, [isClientSearch, searchReady, articles, searchQuery, filtered]);

  return {
    visible,
    filtered,
    filteredCount: filtered.length,
    isClientSearch,
    searchReady,
    isSearchLoading: isClientSearch && isLoading,
    isEmpty: isClientSearch && searchReady && filtered.length === 0,
    pagination,
  };
}
