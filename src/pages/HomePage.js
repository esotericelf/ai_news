import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import SectionHeader from '../components/ui/SectionHeader';
import ArticleHero from '../features/articles/ArticleHero';
import ArticleList from '../features/articles/ArticleList';
import TrendingTags from '../features/trending/TrendingTags';
import useClientSearchFeed from '../hooks/useClientSearchFeed';
import useUrlSearch from '../hooks/useUrlSearch';
import JsonLd from '../seo/JsonLd';
import SeoHead from '../seo/SeoHead';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadArticles } from '../store/slices/articlesSlice';
import { config } from '../config';
import { filterPublishedListArticles, filterSearchableArticles } from '../utils/article';
import { buildWebsiteJsonLd } from '../utils/seo';

const CLIENT_SEARCH_FETCH_SIZE = 100;

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
  const { list, listStatus, listError, count, next, previous, currentPage } =
    useAppSelector((state) => state.articles);

  useEffect(() => {
    if (hasSearch) {
      dispatch(loadArticles({ page: 1, page_size: CLIENT_SEARCH_FETCH_SIZE }));
    }
  }, [dispatch, hasSearch, query]);

  useEffect(() => {
    if (!hasSearch) {
      dispatch(loadArticles({ page }));
    }
  }, [dispatch, page, hasSearch]);

  const searchable = filterSearchableArticles(list);
  const ready = filterPublishedListArticles(list);
  const feedArticles = hasSearch ? searchable : ready;
  const searchLoading = hasSearch && listStatus !== 'succeeded' && listStatus !== 'failed';

  const { visible, isClientSearch, isEmpty, isSearchLoading, pagination } = useClientSearchFeed({
    articles: feedArticles,
    searchQuery: query,
    page,
    isLoading: searchLoading,
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

      <div className="page page--home">
        {!hasSearch && page === 1 && (
          <header className="page-masthead">
            <h1 className="page-masthead__title">The Latest in AI &amp; Technology</h1>
            <p className="page-masthead__dek">{config.siteDescription}</p>
          </header>
        )}

        {hasSearch && (
          <header className="page-masthead page-masthead--compact">
            <SectionHeader title={`Results for “${display}”`} />
          </header>
        )}

        <nav className="home-topics-cta" aria-label="Topic navigation">
          <Link to="/topics" className="home-topics-cta__link">
            Browse topics by category →
          </Link>
        </nav>

        <TrendingTags />

        {listStatus === 'failed' && (
          <ErrorState
            message={listError}
            onRetry={() =>
              dispatch(
                hasSearch
                  ? loadArticles({ page: 1, page_size: CLIENT_SEARCH_FETCH_SIZE })
                  : loadArticles({ page })
              )
            }
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
              loading={listStatus === 'loading' || isSearchLoading}
              leadArticle={lead}
              emptyMessage={
                isEmpty
                  ? `No articles found matching “${display}”. Try a different keyword or browse topics.`
                  : null
              }
            />
            {(isClientSearch ? pagination.totalCount > 0 : pagination.hasNext || pagination.hasPrevious) && (
              <Pagination
                currentPage={pagination.currentPage}
                hasNext={pagination.hasNext}
                hasPrevious={pagination.hasPrevious}
                totalCount={pagination.totalCount}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
