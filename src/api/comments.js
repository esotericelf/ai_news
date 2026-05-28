import { apiRequest } from './http';

/** Django: GET /api/published/<slug>/comments/ */
function commentsListPath(slug) {
  return `/api/published/${encodeURIComponent(slug)}/comments/`;
}

/** Django: POST /api/published/<slug>/comments/post/ */
function commentsPostPath(slug) {
  return `/api/published/${encodeURIComponent(slug)}/comments/post/`;
}

/** GET — always live API (not seo-cache). */
export async function fetchArticleComments(slug) {
  return apiRequest(commentsListPath(slug));
}

/** POST */
export async function postArticleComment(slug, { content, idToken, seoArticleId, profile }) {
  const body = {
    content,
    seo_article_id: seoArticleId,
    article_id: seoArticleId,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    provider: profile.provider,
  };
  return apiRequest(commentsPostPath(slug), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });
}
