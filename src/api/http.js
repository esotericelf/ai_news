import { config, getApiBase } from '../config';

/**
 * Resolve API URL: same-origin /api on Netlify (proxy function), or configured base.
 */
export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBase();
  if (base) {
    return `${base}${normalizedPath}`;
  }
  if (typeof window !== 'undefined') {
    return new URL(normalizedPath, window.location.origin).toString();
  }
  return normalizedPath;
}

export function applyApiKeyHeader(headers = {}, requestUrl = '') {
  const next = { ...headers };
  if (config.apiKey) {
    next['X-Api-Key'] = config.apiKey;
  }
  if (/ngrok/i.test(requestUrl)) {
    next['ngrok-skip-browser-warning'] = 'true';
  }
  return next;
}

/**
 * @param {string} path e.g. /api/editor/stats/
 * @param {RequestInit & { params?: Record<string, string|number> }} options
 */
export async function apiRequest(path, options = {}) {
  const { params, headers: extraHeaders, ...fetchOptions } = options;
  let url = buildApiUrl(path);
  if (params && typeof window !== 'undefined') {
    const u = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        u.searchParams.set(key, String(value));
      }
    });
    url = u.toString();
  }

  const headers = applyApiKeyHeader(
    { Accept: 'application/json', ...extraHeaders },
    url
  );

  let res;
  try {
    res = await fetch(url, {
      credentials: 'same-origin',
      ...fetchOptions,
      headers,
    });
  } catch (err) {
    const target = getApiBase() || (typeof window !== 'undefined' ? window.location.origin : 'API');
    const hint =
      `Cannot reach the API at ${url}. ` +
      (getApiBase()
        ? 'Check REACT_APP_API_BASE_URL / ngrok is running and CORS allows this site.'
        : 'On Netlify, set API_BASE_URL (function env) to your Django/ngrok origin and redeploy. ' +
          'Unset REACT_APP_API_BASE_URL so the app uses /api via the proxy.') +
      ` Backend target: ${target}.`;
    throw new Error(err?.message === 'Failed to fetch' ? hint : err.message);
  }

  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (res.ok && ct.includes('text/html') && !path.includes('/admin')) {
    throw new Error(
      `API returned HTML instead of JSON for ${path}. ` +
        'Netlify may be missing /api/* proxy rules — redeploy after setting API_BASE_URL on Netlify.'
    );
  }

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) message = body.detail;
      else if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  if (ct.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(text);
  }
  throw new Error(`Expected JSON from ${path}, got ${ct || 'unknown content type'}.`);
}
