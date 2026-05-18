const BAD_IMAGE_MARKERS = [
  'arxiv-logo',
  'favicon',
  'logo-fb',
  '/logo.',
  '/logo/',
  'site-logo',
  '/icon',
  'sprite',
  'placeholder',
  '1x1',
  'pixel.gif',
  'avatar',
  'default-og',
  'opengraph-default',
];

function isUsableImageUrl(url) {
  const lower = (url || '').trim().toLowerCase();
  if (!lower.startsWith('http')) return false;
  if (lower.includes('arxiv.org')) return false;
  return !BAD_IMAGE_MARKERS.some((m) => lower.includes(m));
}

/** Whether this article should appear in lists (matches API filter). */
export function hasDisplayImage(article) {
  const raw = (article?.featured_image_url || '').trim();
  if (!isUsableImageUrl(raw)) return false;
  const link = (article?.canonical_url || article?.source?.link || '').toLowerCase();
  if (link.includes('arxiv.org')) return false;
  return true;
}

export function filterDisplayableArticles(articles) {
  return (articles || []).filter(hasDisplayImage);
}

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
