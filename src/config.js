// In dev, setupProxy.js forwards /api and /health and injects X-Api-Key (avoids CORS + missed env).
const useDevProxy =
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_USE_DEV_PROXY !== 'false';

const apiBase = useDevProxy
  ? ''
  : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const siteUrl = (process.env.REACT_APP_SITE_URL || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

const devProxyTarget = (
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

export const config = {
  apiBase,
  useDevProxy,
  devProxyTarget,
  siteUrl,
  apiKey: process.env.REACT_APP_API_KEY || '',
  siteName: process.env.REACT_APP_SITE_NAME || 'AI News Digest',
  siteDescription:
    process.env.REACT_APP_SITE_DESCRIPTION ||
    'Curated artificial intelligence and technology news, optimized for clarity and discovery.',
  gaMeasurementId: process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-TCT20QCCWS',
  articlesPerPage: 12,
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

export function tagUrl(slug) {
  return `/tags/${slug}`;
}
