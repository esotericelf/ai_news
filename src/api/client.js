import { config } from '../config';

function cacheUrlForApiPath(path, params) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath === '/api/taxonomy/') return '/seo-cache/taxonomy.json';
  if (normalizedPath === '/api/tags/') return '/seo-cache/tags.json';
  if (normalizedPath.startsWith('/api/published/')) {
    // Detail: /api/published/<slug>/
    const m = normalizedPath.match(/^\/api\/published\/([^/]+)\/$/);
    if (m) {
      return `/seo-cache/published/slug/${decodeURIComponent(m[1])}.json`;
    }
    // List: /api/published/?...
    if (normalizedPath === '/api/published/' || normalizedPath === '/api/published') {
      const usp = new URLSearchParams();
      Object.entries(params || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') usp.set(k, String(v));
      });
      const key = (usp.toString() || 'default').replace(/[^a-z0-9=_-]+/gi, '_').slice(0, 180);
      return `/seo-cache/published/list/${key}.json`;
    }
  }
  return null;
}

export async function apiGet(path, params = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Prefer build-time JSON cache (for prerendering and for static hosting when API is down).
  if (typeof window !== 'undefined' && (window.__REACT_SNAP__ || process.env.NODE_ENV === 'production')) {
    const cached = cacheUrlForApiPath(normalizedPath, params);
    if (cached) {
      const res = await fetch(cached, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        return res.json();
      }
      // Fall through to live API if cache missing.
    }
  }

  const url = config.apiBase
    ? new URL(`${config.apiBase}${normalizedPath}`)
    : new URL(normalizedPath, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const headers = { Accept: 'application/json' };
  if (config.apiKey) {
    headers['X-Api-Key'] = config.apiKey;
  }
  const requestUrl = url.toString();
  if (/ngrok/i.test(requestUrl)) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  let res;
  try {
    res = await fetch(requestUrl, { headers });
  } catch (err) {
    const usingProxy = config.useDevProxy;
    const apiTarget = usingProxy ? config.devProxyTarget : config.apiBase || 'http://localhost:8000';
    const hint =
      'Cannot reach the API. ' +
      (usingProxy
        ? `Dev proxy targets ${apiTarget}. `
        : `Requests go to ${apiTarget}. `) +
      'For local Docker: run docker compose up in AI_News_Scraper and check http://localhost:8000/health/. ' +
      'For ngrok: set REACT_APP_API_BASE_URL in .env.local to your active https://….ngrok-free.app or .ngrok-free.dev URL, ' +
      'set REACT_APP_USE_DEV_PROXY=false (or keep true to proxy through npm), restart npm start. ' +
      'REACT_APP_API_KEY must match backend API_KEY. See AI_News_Scraper/docs/NGROK.md.';
    throw new Error(err.message === 'Failed to fetch' ? hint : err.message);
  }
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    if (res.status === 403) {
      message =
        'API returned 403 Forbidden. Set REACT_APP_API_KEY in .env.local to match backend API_KEY, then restart npm start.';
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
