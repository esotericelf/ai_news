import { auth } from '../firebase';
import { config } from '../config';
import { apiRequest } from './http';

/** Optional: supply Firebase ID token for editor API calls. */
let tokenProvider = null;

export function setEditorTokenProvider(fn) {
  tokenProvider = fn;
}

async function editorHeaders() {
  const headers = { 'Content-Type': 'application/json' };

  let token = null;
  if (tokenProvider) {
    try {
      token = await tokenProvider();
    } catch {
      token = null;
    }
  }
  if (!token && auth?.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch {
      token = null;
    }
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  const key =
    process.env.REACT_APP_EDITOR_API_KEY ||
    config.apiKey ||
    process.env.REACT_APP_API_KEY ||
    '';
  if (key) {
    headers['X-Api-Key'] = key;
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

async function editorFetch(path, options = {}) {
  return apiRequest(path, {
    ...options,
    headers: { ...(await editorHeaders()), ...options.headers },
  });
}

export function fetchEditorStats() {
  return editorFetch('/api/editor/stats/');
}

export function fetchDrafts() {
  return editorFetch('/api/editor/drafts/');
}

export function fetchPendingComments() {
  return editorFetch('/api/editor/comments/');
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

export function reviseDraft(pk, comment) {
  return editorFetch(`/api/editor/drafts/${pk}/revise/`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

export function approveComment(pk) {
  return editorFetch(`/api/editor/comments/${pk}/approve/`, { method: 'POST' });
}

export function rejectComment(pk) {
  return editorFetch(`/api/editor/comments/${pk}/reject/`, { method: 'POST' });
}
