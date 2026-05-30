import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import SectionHeader from '../components/ui/SectionHeader';
import ArticleHero from '../features/articles/ArticleHero';
import ArticleList from '../features/articles/ArticleList';
import SearchResultsView from '../features/search/SearchResultsView';
import TrendingTags from '../features/trending/TrendingTags';
import useClientSearchFeed from '../hooks/useClientSearchFeed';
import useUrlSearch from '../hooks/useUrlSearch';
import JsonLd from '../seo/JsonLd';
import SeoHead from '../seo/SeoHead';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearServerSearch,
  loadArticles,
  loadArticlesServerSearch,
} from '../store/slices/articlesSlice';
import { config } from '../config';
import { filterPublishedListArticles, filterSearchableArticles } from '../utils/article';
import { filterArticlesBySearch } from '../utils/search';
import { buildWebsiteJsonLd } from '../utils/seo';

function buildHomeCanonical(siteUrl, { search, page }) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${siteUrl}/?${qs}` : siteUrl;
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const { query, display, hasSearch } = useUrlSearch();

  const dispatch = useAppDispatch();
  const { list, listStatus, listError, count, next, previous, currentPage, serverSearch } =
    useAppSelector((state) => state.articles);

  useEffect(() => {
    if (hasSearch) {
      dispatch(clearServerSearch());
      dispatch(
        loadArticles({ page: 1, page_size: config.clientSearchFetchSize })
      );
    }
  }, [dispatch, hasSearch, query]);

  useEffect(() => {
    if (!hasSearch) {
      dispatch(clearServerSearch());
      dispatch(loadArticles({ page }));
    }
  }, [dispatch, page, hasSearch]);

  const searchable = filterSearchableArticles(list);
  const ready = filterPublishedListArticles(list);

  const localFiltered = useMemo(() => {
    if (!hasSearch || listStatus !== 'succeeded') return [];
    return filterArticlesBySearch(searchable, query);
  }, [hasSearch, listStatus, searchable, query]);

  const serverSearchActive =
    hasSearch &&
    localFiltered.length === 0 &&
    serverSearch.query === query &&
    serverSearch.status === 'succeeded' &&
    serverSearch.list.length > 0;

  useEffect(() => {
    if (!hasSearch || !query) {
      dispatch(clearServerSearch());
      return;
    }
    if (listStatus !== 'succeeded') return;
    if (localFiltered.length > 0) {
      if (serverSearch.query) dispatch(clearServerSearch());
      return;
    }
    if (serverSearch.status === 'loading') return;
    if (serverSearch.query === query && serverSearch.status !== 'idle') return;

    dispatch(
      loadArticlesServerSearch({
        search: display,
        page_size: config.clientSearchFetchSize,
      })
    );
  }, [
    dispatch,
    hasSearch,
    query,
    display,
    listStatus,
    localFiltered.length,
    serverSearch.status,
    serverSearch.query,
  ]);

  const feedArticles = hasSearch
    ? serverSearchActive
      ? filterSearchableArticles(serverSearch.list)
      : searchable
    : ready;

  const searchLoading =
    (hasSearch && listStatus !== 'succeeded' && listStatus !== 'failed') ||
    (hasSearch &&
      listStatus === 'succeeded' &&
      localFiltered.length === 0 &&
      serverSearch.status !== 'succeeded' &&
      serverSearch.status !== 'failed');

  const {
    visible,
    filtered,
    isEmpty,
    isSearchLoading,
    pagination,
  } = useClientSearchFeed({
    articles: feedArticles,
    searchQuery: query,
    page,
    isLoading: searchLoading,
    useServerResults: serverSearchActive,
    apiCount: count,
    apiNext: next,
    apiPrevious: previous,
    apiCurrentPage: currentPage,
  });

  const lead = !hasSearch && page === 1 ? visible[0] : null;
  const listArticles = lead ? visible.filter((a) => a.slug !== lead.slug) : visible;

  const pageTitle = hasSearch ? `Search: ${display}` : 'Latest AI News';
  const pageDesc = hasSearch
    ? `Articles about “${display}” — ${config.siteDescription}`
    : config.siteDescription;

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={pageDesc}
        canonical={buildHomeCanonical(config.siteUrl, { search: display, page })}
        keywords={hasSearch ? [display, 'AI', 'technology'] : ['artificial intelligence', 'AI news']}
      />
      <JsonLd data={buildWebsiteJsonLd()} />

      <div className={`page page--home${hasSearch ? ' page--home-search' : ''}`}>
        {!hasSearch && page === 1 && (
          <header className="page-masthead">
            <h1 className="page-masthead__title">The Latest in AI &amp; Technology</h1>
            <p className="page-masthead__dek">{config.siteDescription}</p>
          </header>
        )}

        {hasSearch ? (
          <>
            {listStatus === 'failed' && (
              <ErrorState
                message={listError}
                onRetry={() =>
                  dispatch(
                    loadArticles({ page: 1, page_size: config.clientSearchFetchSize })
                  )
                }
              />
            )}
            {listStatus !== 'failed' && (
              <SearchResultsView
                display={display}
                visible={visible}
                filtered={filtered}
                feedArticles={feedArticles}
                isEmpty={isEmpty}
                isSearchLoading={isSearchLoading}
                pagination={pagination}
              />
            )}
          </>
        ) : (
          <>
            <TrendingTags />

            {listStatus === 'failed' && (
              <ErrorState
                message={listError}
                onRetry={() => dispatch(loadArticles({ page }))}
              />
            )}

            {listStatus !== 'failed' && (
              <>
                {lead && (
                  <>
                    <SectionHeader title="Today's Picks" />
                    <ArticleHero article={lead} />
                  </>
                )}
                <ArticleList
                  articles={listArticles}
                  loading={listStatus === 'loading'}
                  leadArticle={lead}
                />
                {(pagination.hasNext || pagination.hasPrevious) && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    hasNext={pagination.hasNext}
                    hasPrevious={pagination.hasPrevious}
                    totalCount={pagination.totalCount}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
