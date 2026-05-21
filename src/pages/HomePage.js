import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import SectionHeader from '../components/ui/SectionHeader';
import ArticleHero from '../features/articles/ArticleHero';
import ArticleList from '../features/articles/ArticleList';
import TrendingTags from '../features/trending/TrendingTags';
import JsonLd from '../seo/JsonLd';
import SeoHead from '../seo/SeoHead';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadArticles } from '../store/slices/articlesSlice';
import { config } from '../config';
import { filterPublishedListArticles } from '../utils/article';
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
  const search = searchParams.get('search') || '';

  const dispatch = useAppDispatch();
  const { list, listStatus, listError, count, next, previous, currentPage } =
    useAppSelector((state) => state.articles);

  useEffect(() => {
    dispatch(loadArticles({ page, search }));
  }, [dispatch, page, search]);

  const ready = filterPublishedListArticles(list);
  const lead = !search && page === 1 ? ready[0] : null;

  const pageTitle = search ? `Search: ${search}` : 'Latest AI News';
  const pageDesc = search
    ? `Articles about “${search}” — ${config.siteDescription}`
    : config.siteDescription;

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={pageDesc}
        canonical={buildHomeCanonical(config.siteUrl, { search, page })}
        keywords={search ? [search, 'AI', 'technology'] : ['artificial intelligence', 'AI news']}
      />
      <JsonLd data={buildWebsiteJsonLd()} />

      <div className="page page--home">
        {!search && page === 1 && (
          <header className="page-masthead">
            <h1 className="page-masthead__title">The Latest in AI &amp; Technology</h1>
            <p className="page-masthead__dek">{config.siteDescription}</p>
          </header>
        )}

        {search && (
          <header className="page-masthead page-masthead--compact">
            <SectionHeader title={`Results for “${search}”`} />
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
            onRetry={() => dispatch(loadArticles({ page, search }))}
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
              articles={ready}
              loading={listStatus === 'loading'}
              leadArticle={lead}
            />
            <Pagination
              currentPage={currentPage}
              hasNext={Boolean(next)}
              hasPrevious={Boolean(previous)}
              totalCount={count}
            />
          </>
        )}
      </div>
    </>
  );
}
