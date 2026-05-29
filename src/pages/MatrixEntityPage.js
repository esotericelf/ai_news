import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import ArticleList from '../features/articles/ArticleList';
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

export default function MatrixEntityPage({ matrixType }) {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
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
    dispatch(loadArticles({ page, search, [filterParam]: slug }));
  }, [dispatch, page, search, slug, filterParam]);

  const entityMeta = useMemo(() => {
    const fromCatalog = catalog.find((row) => row.slug === slug);
    if (fromCatalog) return fromCatalog;
    return { slug, title: slug.replace(/-/g, ' ') };
  }, [catalog, slug]);

  const title = entityMeta.title;
  const path = matrixUrl(matrixType, slug);
  const canonical =
    page > 1 || search
      ? `${config.siteUrl}${path}?${new URLSearchParams({
          ...(search ? { search } : {}),
          ...(page > 1 ? { page: String(page) } : {}),
        })}`
      : `${config.siteUrl}${path}`;

  const ready = filterPublishedListArticles(list);
  const listFilters = filterParam && slug ? { page, search, [filterParam]: slug } : null;

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
            <ArticleList articles={ready} loading={listStatus === 'loading'} />
            <Pagination
              currentPage={currentPage}
              hasNext={Boolean(next)}
              hasPrevious={Boolean(previous)}
              totalCount={count}
              basePath={path}
              extraParams={search ? { search } : {}}
            />
          </>
        )}
      </div>
    </>
  );
}
