import { articleExcerpt, seoMatrixLabels } from './seoMatrix';

/** Decode and normalize a search string from the URL or form input. */
export function normalizeSearchQuery(raw) {
  if (raw == null || raw === '') return '';
  const text = String(raw).replace(/\+/g, ' ');
  try {
    return decodeURIComponent(text).toLowerCase().trim();
  } catch {
    return text.toLowerCase().trim();
  }
}

/** Human-readable search label for UI (preserves original casing). */
export function parseSearchDisplay(raw) {
  if (raw == null || raw === '') return '';
  const text = String(raw).replace(/\+/g, ' ');
  try {
    return decodeURIComponent(text).trim();
  } catch {
    return text.trim();
  }
}

/** Tags/keywords attached to an article for client-side search. */
export function getArticleTags(article) {
  const raw = [
    ...(Array.isArray(article?.tags) ? article.tags : []),
    ...(article?.target_keywords || []),
    ...(article?.trending_keywords_used || []),
    ...seoMatrixLabels(article),
  ];
  return raw.map((tag) => String(tag).toLowerCase().trim()).filter(Boolean);
}

export function articleMatchesSearch(article, normalizedQuery) {
  if (!normalizedQuery) return true;

  const title = (article?.seo_title || article?.source?.title || '').toLowerCase();
  const description = (
    article?.meta_description || articleExcerpt(article) || ''
  ).toLowerCase();
  const tags = getArticleTags(article);

  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  if (!words.length) return true;

  return words.every(
    (word) =>
      title.includes(word) ||
      description.includes(word) ||
      tags.some((tag) => tag.includes(word))
  );
}

export function filterArticlesBySearch(articles, normalizedQuery) {
  if (!normalizedQuery) return articles || [];
  return (articles || []).filter((article) => articleMatchesSearch(article, normalizedQuery));
}

export function paginateArticles(articles, page, pageSize) {
  const start = (page - 1) * pageSize;
  return articles.slice(start, start + pageSize);
}
