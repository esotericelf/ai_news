import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../../components/ui/ErrorState';
import { fetchMasterStats } from '../../api/report';

const HERO_TITLE =
  'The State of Artificial Intelligence & Technical Innovation: A Programmatic Data Analysis';

function formatReportTimestamp(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatMonthLabel(monthKey) {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

function displayTerm(term) {
  if (!term) return '';
  return term
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function searchUrl(term) {
  return {
    pathname: '/',
    search: `search=${encodeURIComponent(term)}`,
  };
}

function buildPrimaryMetrics(data) {
  const velocity = data?.monthly_velocity || [];
  const latest = velocity[velocity.length - 1];
  const categories = Object.entries(data?.category_volume || {}).sort((a, b) => b[1] - a[1]);
  const topCategory = categories[0];

  return [
    {
      label: 'Total Articles Processed',
      value: data?.total_processed ?? '—',
      hint: 'Indexed across the full editorial pipeline',
    },
    {
      label: 'Public Archive Live',
      value: data?.public_count ?? '—',
      hint: 'Published stories on-site',
    },
    {
      label: 'Trending Velocity',
      value: latest?.count ?? '—',
      hint: latest
        ? `${formatMonthLabel(latest.month)} publication output`
        : 'Latest monthly throughput',
    },
    {
      label: 'Dominant Theme Cluster',
      value: topCategory ? topCategory[0] : '—',
      hint: topCategory ? `${topCategory[1]} matching stories` : 'Top sector by volume',
    },
  ];
}

function ExecutiveSummary({ text }) {
  const paragraphs = (text || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return <p className="master-report__summary-empty">Summary unavailable.</p>;
  }

  return paragraphs.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>);
}

function MetricCard({ label, value, hint }) {
  return (
    <article className="master-report__metric-card">
      <p className="master-report__metric-label">{label}</p>
      <p className="master-report__metric-value">{value}</p>
      {hint && <p className="master-report__metric-hint">{hint}</p>}
    </article>
  );
}

function VelocityChart({ rows }) {
  if (!rows?.length) {
    return <p className="master-report__empty-note">No monthly velocity data yet.</p>;
  }
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <ul className="master-report__velocity-chart" aria-label="Monthly publication velocity">
      {rows.map((row) => (
        <li key={row.month} className="master-report__velocity-row">
          <span className="master-report__velocity-month">{formatMonthLabel(row.month)}</span>
          <span className="master-report__velocity-bar-wrap">
            <span
              className="master-report__velocity-bar"
              style={{ width: `${Math.round((row.count / max) * 100)}%` }}
            />
          </span>
          <span className="master-report__velocity-count">{row.count}</span>
        </li>
      ))}
    </ul>
  );
}

function KeywordSilo({ term, count }) {
  const label = displayTerm(term);
  return (
    <li className="master-report__silo-item">
      <Link to={searchUrl(term)} className="master-report__silo-chip">
        {label}
        {count != null && <span className="master-report__silo-count">{count}</span>}
      </Link>
      <p className="master-report__silo-helper">
        Explore all deep-dive articles on {label}
      </p>
    </li>
  );
}

export default function MasterReportView() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setStatus('loading');
    setError(null);
    fetchMasterStats({ publicOnly: true })
      .then((payload) => {
        setData(payload);
        setStatus('succeeded');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load report data');
        setStatus('failed');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const primaryMetrics = useMemo(
    () => (data ? buildPrimaryMetrics(data) : []),
    [data]
  );

  const categoryCards = useMemo(() => {
    if (!data?.category_volume) return [];
    return Object.entries(data.category_volume)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [data]);

  const lastUpdated = formatReportTimestamp(data?.report_generated_at);

  return (
    <div className="master-report-container">
      <header className="master-report__hero">
        <p className="master-report__kicker">Master Report · Programmatic Intelligence</p>
        <h1 className="master-report__title">{HERO_TITLE}</h1>
        {lastUpdated && (
          <p className="master-report__updated">
            <time dateTime={data.report_generated_at}>Last updated {lastUpdated} UTC</time>
          </p>
        )}
      </header>

      {status === 'loading' && (
        <div className="master-report__loading" aria-busy="true" aria-label="Loading report data">
          <div className="master-report__skeleton master-report__skeleton--hero" />
          <div className="master-report__skeleton master-report__skeleton--block" />
          <div className="master-report__metrics-grid master-report__metrics-grid--loading">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="master-report__skeleton master-report__skeleton--card" />
            ))}
          </div>
        </div>
      )}

      {status === 'failed' && <ErrorState message={error} onRetry={load} />}

      {status === 'succeeded' && data && (
        <>
          <section className="master-report__section" aria-labelledby="master-report-summary">
            <h2 className="master-report__section-title" id="master-report-summary">
              Automated Insights Engine Analysis
            </h2>
            <blockquote className="master-report__summary">
              <ExecutiveSummary text={data.executive_summary} />
            </blockquote>
            {data.executive_summary_cached && (
              <p className="master-report__cache-note">Insights served from analysis cache.</p>
            )}
          </section>

          <section className="master-report__section" aria-labelledby="master-report-metrics">
            <h2 className="master-report__section-title" id="master-report-metrics">
              Core metrics
            </h2>
            <div className="master-report__metrics-grid">
              {primaryMetrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
          </section>

          {categoryCards.length > 0 && (
            <section className="master-report__section" aria-labelledby="master-report-sectors">
              <h2 className="master-report__section-title" id="master-report-sectors">
                Sector coverage
              </h2>
              <p className="master-report__section-dek">
                Thematic clusters tracked across our programmatic archive.
              </p>
              <div className="master-report__metrics-grid master-report__metrics-grid--sectors">
                {categoryCards.map(({ name, count }) => (
                  <MetricCard
                    key={name}
                    label={name}
                    value={count}
                    hint="Stories matching cluster signals"
                  />
                ))}
              </div>
            </section>
          )}

          <section className="master-report__section" aria-labelledby="master-report-velocity">
            <h2 className="master-report__section-title" id="master-report-velocity">
              Monthly velocity
            </h2>
            <p className="master-report__section-dek">
              Rolling publication throughput across the last twelve months.
            </p>
            <VelocityChart rows={data.monthly_velocity} />
          </section>

          {data.top_keywords?.length > 0 && (
            <section className="master-report__section" aria-labelledby="master-report-keywords">
              <h2 className="master-report__section-title" id="master-report-keywords">
                Top keywords &amp; discovery silos
              </h2>
              <p className="master-report__section-dek">
                High-signal terms with direct paths into our searchable article archive.
              </p>
              <ul className="master-report__silos">
                {data.top_keywords.map((row) => (
                  <KeywordSilo key={row.term} term={row.term} count={row.count} />
                ))}
              </ul>
            </section>
          )}

          <footer className="master-report__footer">
            <p>
              Data synthesized from {data.public_count ?? 0} public articles. Cite this report with
              a link to{' '}
              <Link to="/report">this page</Link>.
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
