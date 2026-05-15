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

  let res;
  try {
    res = await fetch(url.toString(), { headers });
  } catch (err) {
    const hint =
      'Cannot reach the API. Ensure Docker is running, the backend is on port 8000, ' +
      'CORS allows http://localhost:3000, and REACT_APP_API_KEY matches backend API_KEY.';
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
