export function articleCategory(article) {
  const kw = article?.target_keywords?.[0];
  if (kw) return kw;
  return 'Artificial Intelligence';
}

export function articleTitle(article) {
  return article?.seo_title || article?.source?.title || 'Untitled';
}
