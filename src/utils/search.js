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

  const tags = getArticleTags(article);
  if (tags.some((tag) => tag.includes(normalizedQuery))) {
    return true;
  }

  const fields = [
    article?.seo_title,
    article?.meta_description,
    article?.source?.title,
    articleExcerpt(article),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const combined = [...fields, ...tags].join(' ');
  if (combined.includes(normalizedQuery)) {
    return true;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  if (terms.length > 1) {
    return terms.every(
      (term) =>
        fields.some((field) => field.includes(term)) ||
        tags.some((tag) => tag.includes(term))
    );
  }

  return fields.some((field) => field.includes(normalizedQuery));
}

export function filterArticlesBySearch(articles, normalizedQuery) {
  if (!normalizedQuery) return articles || [];
  return (articles || []).filter((article) => articleMatchesSearch(article, normalizedQuery));
}

export function paginateArticles(articles, page, pageSize) {
  const start = (page - 1) * pageSize;
  return articles.slice(start, start + pageSize);
}
