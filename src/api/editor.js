import { apiGet } from './client';

function editorHeaders() {
  const key =
    process.env.REACT_APP_EDITOR_API_KEY ||
    process.env.REACT_APP_API_KEY ||
    '';
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (key) headers['X-Api-Key'] = key;
  return headers;
}

async function editorFetch(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = process.env.NODE_ENV === 'development' &&
    process.env.REACT_APP_USE_DEV_PROXY !== 'false'
    ? ''
    : (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
  const url = `${base}${normalizedPath}`;
  const headers = { ...editorHeaders(), ...options.headers };
  if (/ngrok/i.test(url)) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = new Error(`${res.status} ${res.statusText}`);
    err.status = res.status;
    try {
      const body = await res.json();
      err.detail = body.detail;
    } catch {
      /* ignore */
    }
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export function fetchEditorStats() {
  return editorFetch('/api/editor/stats/');
}

export function fetchDrafts() {
  return editorFetch('/api/editor/drafts/');
}

export function fetchDraft(pk) {
  return editorFetch(`/api/editor/drafts/${pk}/`);
}

export function approveDraft(pk) {
  return editorFetch(`/api/editor/drafts/${pk}/approve/`, { method: 'POST' });
}

export function rejectDraft(pk, reason = '') {
  return editorFetch(`/api/editor/drafts/${pk}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export { editorHeaders };
