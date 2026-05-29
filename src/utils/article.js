import { filterDisplayableArticles, hasDisplayImage, resolveArticleImageUrl } from './image';

export { filterDisplayableArticles, hasDisplayImage, resolveArticleImageUrl };

/** Public on site — API uses boolean true; legacy rows may still send "ready". */
export function isArticlePublic(article) {
  const s = article?.status;
  return s === true || s === 'ready';
}

export function filterPublicArticles(articles) {
  return (articles || []).filter(isArticlePublic);
}

/** Published list cards: public + usable hero image (matches backend feed filter). */
export function filterPublishedListArticles(articles) {
  return filterDisplayableArticles(filterPublicArticles(articles));
}

/** Client-side search pool: public articles only (no hero-image requirement). */
export function filterSearchableArticles(articles) {
  return filterPublicArticles(articles);
}

export function articleCategory(article) {
  const kw = article?.target_keywords?.[0];
  if (kw) return kw;
  return 'Artificial Intelligence';
}

export function articleTitle(article) {
  return article?.seo_title || article?.source?.title || 'Untitled';
}
