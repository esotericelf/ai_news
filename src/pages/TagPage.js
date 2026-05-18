import { useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import ArticleList from '../features/articles/ArticleList';
import SeoHead from '../seo/SeoHead';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadArticles } from '../store/slices/articlesSlice';
import { loadTaxonomy } from '../store/slices/taxonomySlice';
import { config, tagUrl } from '../config';

export default function TagPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';

  const dispatch = useAppDispatch();
  const { tags, tree, status: taxonomyStatus } = useAppSelector((state) => state.taxonomy);
  const { list, listStatus, listError, count, next, previous, currentPage } =
    useAppSelector((state) => state.articles);

  useEffect(() => {
    if (taxonomyStatus === 'idle') {
      dispatch(loadTaxonomy());
    }
  }, [dispatch, taxonomyStatus]);

  useEffect(() => {
    dispatch(loadArticles({ page, search, tag: slug }));
  }, [dispatch, page, search, slug]);

  const tagMeta = useMemo(() => {
    const fromTags = tags.find((t) => t.slug === slug);
    if (fromTags) return fromTags;
    const fromTree = tree?.entities?.find((e) => e.slug === slug);
    if (fromTree) return { ...fromTree, article_count: undefined };
    return { slug, title: slug.replace(/-/g, ' ') };
  }, [tags, tree, slug]);

  const title = tagMeta.title;
  const path = tagUrl(slug);
  const canonical =
    page > 1 || search
      ? `${config.siteUrl}${path}?${new URLSearchParams({
          ...(search ? { search } : {}),
          ...(page > 1 ? { page: String(page) } : {}),
        })}`
      : `${config.siteUrl}${path}`;

  const ready = list.filter((a) => a.status === 'ready');

  return (
    <>
      <SeoHead
        title={title}
        description={`Articles tagged “${title}” — ${config.siteDescription}`}
        canonical={canonical}
        keywords={[title, 'AI', 'tag']}
      />

      <div className="page page--tag">
        <header className="page-masthead page-masthead--compact">
          <p className="breadcrumb">
            <Link to="/topics">Topics</Link>
          </p>
          <h1 className="page-masthead__title">{title}</h1>
          {tagMeta.article_count != null && (
            <p className="page-masthead__dek">{tagMeta.article_count} articles</p>
          )}
        </header>

        {listStatus === 'failed' && (
          <ErrorState
            message={listError}
            onRetry={() => dispatch(loadArticles({ page, search, tag: slug }))}
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
