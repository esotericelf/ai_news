/**
 * featured_image_url from the API is sometimes a site-relative path (/static/…).
 * Resolve it against the article's canonical or source link for <img src>.
 */
export function resolveArticleImageUrl(article) {
  const raw = (article?.featured_image_url || '').trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const base = (article.canonical_url || article.source?.link || '').trim();
  if (!base) return null;

  if (raw.startsWith('//')) {
    try {
      const scheme = new URL(base).protocol || 'https:';
      return `${scheme}${raw}`;
    } catch {
      return `https:${raw}`;
    }
  }

  try {
    return new URL(raw, base).href;
  } catch {
    return null;
  }
}
