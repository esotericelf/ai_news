import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import ArticleList from '../features/articles/ArticleList';
import useClientSearchFeed from '../hooks/useClientSearchFeed';
import useUrlSearch from '../hooks/useUrlSearch';
import SeoHead from '../seo/SeoHead';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadArticles } from '../store/slices/articlesSlice';
import { loadTaxonomy } from '../store/slices/taxonomySlice';
import { config, MATRIX_FILTER_PARAMS, matrixUrl } from '../config';
import { filterPublishedListArticles } from '../utils/article';

const PAGE_COPY = {
  company: { label: 'Company', topicsHeading: 'Companies' },
  tool: { label: 'Tool', topicsHeading: 'Tools' },
  industry: { label: 'Industry', topicsHeading: 'Industries' },
};

const CLIENT_SEARCH_FETCH_SIZE = 100;

export default function MatrixEntityPage({ matrixType }) {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const { query, display, hasSearch } = useUrlSearch();
  const copy = PAGE_COPY[matrixType];
  const filterParam = MATRIX_FILTER_PARAMS[matrixType];

  const dispatch = useAppDispatch();
  const { companies, tools, industries, status: taxonomyStatus } = useAppSelector(
    (state) => state.taxonomy
  );
  const { list, listStatus, listError, count, next, previous, currentPage } =
    useAppSelector((state) => state.articles);

  const catalog =
    matrixType === 'company' ? companies : matrixType === 'tool' ? tools : industries;

  useEffect(() => {
    if (taxonomyStatus === 'idle') {
      dispatch(loadTaxonomy());
    }
  }, [dispatch, taxonomyStatus]);

  useEffect(() => {
    if (!filterParam || !slug) return;
    if (hasSearch) {
      dispatch(
        loadArticles({
          page: 1,
          page_size: CLIENT_SEARCH_FETCH_SIZE,
          [filterParam]: slug,
        })
      );
    }
  }, [dispatch, hasSearch, slug, filterParam]);

  useEffect(() => {
    if (!filterParam || !slug || hasSearch) return;
    dispatch(loadArticles({ page, [filterParam]: slug }));
  }, [dispatch, page, hasSearch, slug, filterParam]);

  const entityMeta = useMemo(() => {
    const fromCatalog = catalog.find((row) => row.slug === slug);
    if (fromCatalog) return fromCatalog;
    return { slug, title: slug.replace(/-/g, ' ') };
  }, [catalog, slug]);

  const title = entityMeta.title;
  const path = matrixUrl(matrixType, slug);
  const canonical =
    page > 1 || hasSearch
      ? `${config.siteUrl}${path}?${new URLSearchParams({
          ...(hasSearch ? { search: display } : {}),
          ...(page > 1 ? { page: String(page) } : {}),
        })}`
      : `${config.siteUrl}${path}`;

  const ready = filterPublishedListArticles(list);
  const { visible, isEmpty, pagination } = useClientSearchFeed({
    articles: ready,
    searchQuery: query,
    page,
    apiCount: count,
    apiNext: next,
    apiPrevious: previous,
    apiCurrentPage: currentPage,
  });

  const listFilters =
    filterParam && slug
      ? {
          page: hasSearch ? 1 : page,
          page_size: hasSearch ? CLIENT_SEARCH_FETCH_SIZE : undefined,
          [filterParam]: slug,
        }
      : null;

  return (
    <>
      <SeoHead
        title={title}
        description={`Articles about ${title} — ${config.siteDescription}`}
        canonical={canonical}
        keywords={[title, copy.label, 'AI']}
      />

      <div className="page page--tag">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Topics', to: '/topics' },
            { label: title },
          ]}
        />
        <header className="page-masthead page-masthead--compact">
          <p className="article-eyebrow">{copy.label}</p>
          <h1 className="page-masthead__title">{title}</h1>
          {entityMeta.article_count != null && (
            <p className="page-masthead__dek">{entityMeta.article_count} articles</p>
          )}
        </header>

        {listStatus === 'failed' && (
          <ErrorState
            message={listError}
            onRetry={() => listFilters && dispatch(loadArticles(listFilters))}
          />
        )}

        {listStatus !== 'failed' && (
          <>
            <ArticleList
              articles={visible}
              loading={listStatus === 'loading'}
              emptyMessage={
                isEmpty ? `No articles found matching “${display}”.` : null
              }
            />
            <Pagination
              currentPage={pagination.currentPage}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              totalCount={pagination.totalCount}
              basePath={path}
              extraParams={hasSearch ? { search: display } : {}}
            />
          </>
        )}
      </div>
    </>
  );
}
