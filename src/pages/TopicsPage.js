import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ErrorState from '../components/ui/ErrorState';
import SeoHead from '../seo/SeoHead';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadTaxonomy } from '../store/slices/taxonomySlice';
import { config, matrixUrl } from '../config';
import { filterBrowseItems, flattenBrowseItems } from '../utils/taxonomy';

const TYPE_LABELS = {
  category: 'Category',
  subcategory: 'Topic',
  company: 'Company',
  tool: 'Tool',
  industry: 'Industry',
};

function MatrixBrowseSection({ title, matrixType, items }) {
  if (!items.length) return null;
  return (
    <section className="topic-browse__section topic-browse__section--tags">
      <h2 className="topic-browse__l1">{title}</h2>
      <ul className="topic-browse__tag-grid">
        {items.map((row) => (
          <li key={row.slug}>
            <Link to={matrixUrl(matrixType, row.slug)}>
              {row.title}
              {row.article_count != null && row.article_count > 0 && (
                <span className="topic-browse__tag-count"> ({row.article_count})</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function TopicsPage() {
  const dispatch = useAppDispatch();
  const { tree, companies, tools, industries, status, error } = useAppSelector(
    (state) => state.taxonomy
  );
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadTaxonomy());
    }
  }, [dispatch, status]);

  const matrix = useMemo(
    () => ({ companies, tools, industries }),
    [companies, tools, industries]
  );

  const allItems = useMemo(
    () => (tree ? flattenBrowseItems(tree, matrix) : []),
    [tree, matrix]
  );

  const results = useMemo(() => filterBrowseItems(allItems, query), [allItems, query]);

  const hasMatrix =
    companies.length > 0 || tools.length > 0 || industries.length > 0;

  return (
    <>
      <SeoHead
        title="Browse topics"
        description="Search categories and the company, tool, and industry matrix to find AI news that matches what you have in mind."
        canonical={`${config.siteUrl}/topics`}
        keywords={['AI topics', 'companies', 'tools', 'industries', 'categories']}
      />

      <div className="page page--topics">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Browse topics' },
          ]}
        />
        <header className="page-masthead page-masthead--compact">
          <h1 className="page-masthead__title">Browse topics</h1>
          <p className="page-masthead__dek">
            Search by name or explore categories and the company, tool, and industry matrix.
          </p>
        </header>

        <form
          className="topic-search"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="topic-search-input" className="visually-hidden">
            Search topics, categories, companies, tools, and industries
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

            {hasMatrix && (
              <>
                <MatrixBrowseSection title="Companies" matrixType="company" items={companies} />
                <MatrixBrowseSection title="Tools" matrixType="tool" items={tools} />
                <MatrixBrowseSection
                  title="Industries"
                  matrixType="industry"
                  items={industries}
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
