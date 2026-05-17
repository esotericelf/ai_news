import { config } from '../config';

export async function apiGet(path, params = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
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
      'For ngrok: set REACT_APP_API_BASE_URL in .env.local to your https://….ngrok-free.app URL, ' +
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
