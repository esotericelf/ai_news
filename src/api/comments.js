import { config } from '../config';

function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (config.apiBase) {
    return `${config.apiBase}${normalizedPath}`;
  }
  if (typeof window !== 'undefined') {
    return new URL(normalizedPath, window.location.origin).toString();
  }
  return normalizedPath;
}

function buildHeaders(extra = {}) {
  const headers = { Accept: 'application/json', ...extra };
  if (config.apiKey) {
    headers['X-Api-Key'] = config.apiKey;
  }
  const url = typeof window !== 'undefined' ? window.location.href : '';
  if (/ngrok/i.test(url) || /ngrok/i.test(config.apiBase || '')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const err = new Error(data.error || `${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** GET /api/published/<slug>/comments/ — always live API (not seo-cache). */
export async function fetchArticleComments(slug) {
  const path = `/api/published/${encodeURIComponent(slug)}/comments/`;
  const res = await fetch(apiUrl(path), { headers: buildHeaders() });
  return parseJsonResponse(res);
}

/** POST /api/published/<slug>/comments/post/ */
export async function postArticleComment(slug, { content, idToken, seoArticleId, profile }) {
  const path = `/api/published/${encodeURIComponent(slug)}/comments/post/`;
  const body = {
    content,
    seo_article_id: seoArticleId,
    article_id: seoArticleId,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    provider: profile.provider,
  };
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    }),
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}
