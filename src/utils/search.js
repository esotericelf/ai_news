import { seoMatrixLabels } from './seoMatrix';

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

/** Display labels from an article's tag / keyword fields. */
export function getArticleKeywordLabels(article) {
  const raw = [
    ...(Array.isArray(article?.tags) ? article.tags : []),
    ...(article?.target_keywords || []),
    ...(article?.trending_keywords_used || []),
    ...seoMatrixLabels(article),
  ];
  return raw.map((tag) => String(tag).trim()).filter(Boolean);
}

/** Tags/keywords attached to an article for client-side search (lowercase). */
export function getArticleTags(article) {
  return getArticleKeywordLabels(article).map((tag) => tag.toLowerCase());
}

/**
 * Case-insensitive phrase match against seo_title, meta_description, or slug.
 */
export function articleMatchesSearch(article, normalizedQuery) {
  if (!normalizedQuery) return true;

  const title = (article?.seo_title || '').toLowerCase();
  const description = (article?.meta_description || '').toLowerCase();
  const slug = (article?.slug || '').toLowerCase();
  const slugPhrase = normalizedQuery.replace(/\s+/g, '-');

  return (
    title.includes(normalizedQuery) ||
    description.includes(normalizedQuery) ||
    slug.includes(normalizedQuery) ||
    slug.includes(slugPhrase)
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
