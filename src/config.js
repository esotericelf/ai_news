// In dev, setupProxy.js forwards /api and /health and injects X-Api-Key (avoids CORS + missed env).
const useDevProxy =
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_USE_DEV_PROXY !== 'false';

const rawApiBase = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

/** Same-origin /api proxy (Netlify function). Avoids CORS when REACT_APP_API_BASE_URL points at ngrok. */
export function getApiBase() {
  if (useDevProxy) return '';
  if (process.env.REACT_APP_USE_SAME_ORIGIN_API === '1') return '';
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (/\.netlify\.app$/i.test(host)) return '';
  }
  if (process.env.NETLIFY === 'true' && process.env.NODE_ENV === 'production') {
    return '';
  }
  return rawApiBase;
}

const siteUrl = (process.env.REACT_APP_SITE_URL || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

const devProxyTarget = (
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

export const config = {
  /** Build-time default; prefer getApiBase() at request time in the browser. */
  get apiBase() {
    return getApiBase();
  },
  useDevProxy,
  devProxyTarget,
  siteUrl,
  apiKey: process.env.REACT_APP_API_KEY || '',
  siteName: process.env.REACT_APP_SITE_NAME || 'AI News Repo',
  siteDescription:
    process.env.REACT_APP_SITE_DESCRIPTION ||
    'Curated artificial intelligence and technology news, optimized for clarity and discovery.',
  gaMeasurementId: process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-TCT20QCCWS',
  articlesPerPage: 12,
  /** Articles fetched for client-side search before optional server fallback. */
  clientSearchFetchSize: 200,
  articlePath: '/news',
};

export function articleUrl(slug) {
  return `${config.articlePath}/${slug}`;
}

export function absoluteArticleUrl(slug) {
  return `${config.siteUrl}${articleUrl(slug)}`;
}

export function categoryUrl(l1Slug, l2Slug) {
  return l2Slug ? `/category/${l1Slug}/${l2Slug}` : `/category/${l1Slug}`;
}

/** URL segment per matrix type (companies, tools, industries). */
export const MATRIX_SEGMENTS = {
  company: 'companies',
  tool: 'tools',
  industry: 'industries',
};

/** Published list query param per matrix type. */
export const MATRIX_FILTER_PARAMS = {
  company: 'company',
  tool: 'tool',
  industry: 'industry',
};

export function matrixUrl(matrixType, slug) {
  const segment = MATRIX_SEGMENTS[matrixType];
  if (!segment || !slug) return null;
  return `/${segment}/${encodeURIComponent(slug)}`;
}
