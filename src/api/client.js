import { config, getApiBase } from '../config';
import { applyApiKeyHeader, buildApiUrl } from './http';

function cacheUrlForApiPath(path, params) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath === '/api/taxonomy/') return '/seo-cache/taxonomy.json';
  if (normalizedPath === '/api/companies/') return '/seo-cache/companies.json';
  if (normalizedPath === '/api/tools/') return '/seo-cache/tools.json';
  if (normalizedPath === '/api/industries/') return '/seo-cache/industries.json';
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
        // Netlify SPA rewrites can return index.html with 200 for missing JSON files.
        // Only treat the cache as valid if it is actually JSON.
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) {
          return res.json();
        }
        const text = await res.text().catch(() => '');
        const trimmed = text.trim().toLowerCase();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          return JSON.parse(text);
        }
        // Fall through to live API if cache is HTML/text.
      }
      // Fall through to live API if cache missing.
    }
  }

  const requestUrlObj = new URL(buildApiUrl(normalizedPath));
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      requestUrlObj.searchParams.set(key, String(value));
    }
  });

  const requestUrl = requestUrlObj.toString();
  const headers = applyApiKeyHeader({ Accept: 'application/json' }, requestUrl);

  let res;
  try {
    res = await fetch(requestUrl, { headers });
  } catch (err) {
    const usingProxy = config.useDevProxy;
    const apiTarget = usingProxy ? config.devProxyTarget : getApiBase() || window.location.origin;
    const hint =
      'Cannot reach the API. ' +
      (usingProxy
        ? `Dev proxy targets ${apiTarget}. `
        : `Requests go to ${apiTarget}. `) +
      'For local Docker: run docker compose up in AI_News_Scraper and check http://localhost:8000/health/. ' +
      'For ngrok: set REACT_APP_API_URL in .env.local to your active https://….ngrok-free.app or .ngrok-free.dev URL, ' +
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
