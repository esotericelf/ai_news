import { useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import SectionHeader from '../components/ui/SectionHeader';
import ArticleList from '../features/articles/ArticleList';
import SeoHead from '../seo/SeoHead';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadArticles } from '../store/slices/articlesSlice';
import { loadTaxonomy } from '../store/slices/taxonomySlice';
import { config, categoryUrl } from '../config';
import useClientSearchFeed from '../hooks/useClientSearchFeed';
import useUrlSearch from '../hooks/useUrlSearch';
import { filterPublishedListArticles } from '../utils/article';
import { findL1, findL2 } from '../utils/taxonomy';

const CLIENT_SEARCH_FETCH_SIZE = 100;

export default function CategoryPage() {
  const { l1: l1Slug, l2: l2Slug } = useParams();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const { query, display, hasSearch } = useUrlSearch();

  const dispatch = useAppDispatch();
  const { tree, status: taxonomyStatus } = useAppSelector((state) => state.taxonomy);
  const { list, listStatus, listError, count, next, previous, currentPage } =
    useAppSelector((state) => state.articles);

  useEffect(() => {
    if (taxonomyStatus === 'idle') {
      dispatch(loadTaxonomy());
    }
  }, [dispatch, taxonomyStatus]);

  useEffect(() => {
    if (hasSearch) {
      dispatch(
        loadArticles({
          page: 1,
          page_size: CLIENT_SEARCH_FETCH_SIZE,
          category_l1: l1Slug,
          category_l2: l2Slug || undefined,
        })
      );
    }
  }, [dispatch, hasSearch, l1Slug, l2Slug]);

  useEffect(() => {
    if (!hasSearch) {
      dispatch(
        loadArticles({
          page,
          category_l1: l1Slug,
          category_l2: l2Slug || undefined,
        })
      );
    }
  }, [dispatch, page, hasSearch, l1Slug, l2Slug]);

  const l1 = useMemo(() => findL1(tree, l1Slug), [tree, l1Slug]);
  const l2 = useMemo(() => findL2(l1, l2Slug), [l1, l2Slug]);

  const title = l2
    ? l2.nav_label || l2.title
    : l1
      ? l1.nav_label || l1.title
      : l2Slug || l1Slug;
  const parentLabel = l1 && l2 ? l1.nav_label || l1.title : null;

  const canonicalPath = categoryUrl(l1Slug, l2Slug);
  const canonical =
    page > 1 || hasSearch
      ? `${config.siteUrl}${canonicalPath}?${new URLSearchParams({
          ...(hasSearch ? { search: display } : {}),
          ...(page > 1 ? { page: String(page) } : {}),
        })}`
      : `${config.siteUrl}${canonicalPath}`;

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
  const pageTitle = parentLabel ? `${title} · ${parentLabel}` : title;

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Topics', to: '/topics' },
  ];
  if (l1 && l2) {
    breadcrumbItems.push({
      label: l1.nav_label || l1.title,
      to: categoryUrl(l1Slug),
    });
    breadcrumbItems.push({ label: title });
  } else if (l1 || l1Slug) {
    breadcrumbItems.push({ label: title || l1Slug });
  } else {
    breadcrumbItems.push({ label: title || 'Category' });
  }

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={`Articles in ${pageTitle} — ${config.siteDescription}`}
        canonical={canonical}
        keywords={[title, parentLabel, 'AI news'].filter(Boolean)}
      />

      <div className="page page--category">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="page-masthead page-masthead--compact">
          <h1 className="page-masthead__title">{title || 'Category'}</h1>
          {l1 && !l2 && l1.subcategories?.length > 0 && (
            <nav className="category-chips" aria-label="Subtopics">
              <ul>
                {l1.subcategories.map((sub) => (
                  <li key={sub.slug}>
                    <Link to={categoryUrl(l1Slug, sub.slug)}>{sub.nav_label || sub.title}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </header>

        {listStatus === 'failed' && (
          <ErrorState
            message={listError}
            onRetry={() =>
              dispatch(
                loadArticles({
                  page: hasSearch ? 1 : page,
                  page_size: hasSearch ? CLIENT_SEARCH_FETCH_SIZE : undefined,
                  category_l1: l1Slug,
                  category_l2: l2Slug || undefined,
                })
              )
            }
          />
        )}

        {listStatus !== 'failed' && (
          <>
            {hasSearch && <SectionHeader title={`Results for “${display}”`} />}
            <ArticleList
              articles={visible}
              loading={listStatus === 'loading'}
              emptyMessage={
                isEmpty
                  ? `No articles found matching “${display}” in this category.`
                  : null
              }
            />
            <Pagination
              currentPage={pagination.currentPage}
              hasNext={pagination.hasNext}
              hasPrevious={pagination.hasPrevious}
              totalCount={pagination.totalCount}
              basePath={canonicalPath}
              extraParams={hasSearch ? { search: display } : {}}
            />
          </>
        )}
      </div>
    </>
  );
}
