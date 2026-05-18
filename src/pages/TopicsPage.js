import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState';
import SeoHead from '../seo/SeoHead';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadTaxonomy } from '../store/slices/taxonomySlice';
import { config } from '../config';
import { filterBrowseItems, flattenBrowseItems } from '../utils/taxonomy';

const TYPE_LABELS = {
  category: 'Category',
  subcategory: 'Topic',
  entity: 'Tag',
  tag: 'Tag',
};

export default function TopicsPage() {
  const dispatch = useAppDispatch();
  const { tree, tags, status, error } = useAppSelector((state) => state.taxonomy);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadTaxonomy());
    }
  }, [dispatch, status]);

  const allItems = useMemo(
    () => (tree ? flattenBrowseItems(tree, tags) : []),
    [tree, tags]
  );

  const results = useMemo(() => filterBrowseItems(allItems, query), [allItems, query]);

  return (
    <>
      <SeoHead
        title="Browse topics"
        description="Search categories, topics, and tags to find AI news that matches what you have in mind."
        canonical={`${config.siteUrl}/topics`}
        keywords={['AI topics', 'taxonomy', 'tags', 'categories']}
      />

      <div className="page page--topics">
        <header className="page-masthead page-masthead--compact">
          <h1 className="page-masthead__title">Browse topics</h1>
          <p className="page-masthead__dek">
            Search by name or explore the category tree to find articles on tools, research, and
            companies you care about.
          </p>
        </header>

        <form
          className="topic-search"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="topic-search-input" className="visually-hidden">
            Search topics, categories, and tags
          </label>
          <input
            id="topic-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. open source, coding assistants, NVIDIA…"
            autoComplete="off"
            autoFocus
          />
          {query && (
            <button type="button" className="topic-search__clear" onClick={() => setQuery('')}>
              Clear
            </button>
          )}
        </form>

        {status === 'failed' && (
          <ErrorState message={error} onRetry={() => dispatch(loadTaxonomy())} />
        )}

        {status === 'loading' && <p className="topic-search__status">Loading topics…</p>}

        {status === 'succeeded' && query.trim() && (
          <section className="topic-results" aria-live="polite">
            <h2 className="topic-results__heading">
              {results.length
                ? `${results.length} match${results.length === 1 ? '' : 'es'}`
                : 'No matches'}
            </h2>
            {results.length > 0 && (
              <ul className="topic-results__list">
                {results.map((item) => (
                  <li key={`${item.type}-${item.slug}-${item.path}`}>
                    <Link to={item.path} className="topic-results__link">
                      <span className="topic-results__type">{TYPE_LABELS[item.type]}</span>
                      <span className="topic-results__title">{item.navLabel || item.title}</span>
                      {item.parentTitle && (
                        <span className="topic-results__parent">in {item.parentTitle}</span>
                      )}
                      {item.articleCount != null && item.articleCount > 0 && (
                        <span className="topic-results__count">{item.articleCount} articles</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {status === 'succeeded' && !query.trim() && (
          <div className="topic-browse">
            {(tree?.categories ?? []).map((l1) => (
              <section key={l1.slug} className="topic-browse__section">
                <h2 className="topic-browse__l1">
                  <Link to={`/category/${l1.slug}`}>{l1.nav_label || l1.title}</Link>
                </h2>
                <ul className="topic-browse__subs">
                  {l1.subcategories.map((l2) => (
                    <li key={l2.slug}>
                      <Link to={`/category/${l1.slug}/${l2.slug}`}>
                        {l2.nav_label || l2.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {(tree?.entities?.length > 0 || tags.length > 0) && (
              <section className="topic-browse__section topic-browse__section--tags">
                <h2 className="topic-browse__l1">Tags &amp; entities</h2>
                <ul className="topic-browse__tag-grid">
                  {(tags.length ? tags : tree.entities).map((t) => (
                    <li key={t.slug}>
                      <Link to={`/tags/${t.slug}`}>
                        {t.title}
                        {t.article_count != null && t.article_count > 0 && (
                          <span className="topic-browse__tag-count"> ({t.article_count})</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
