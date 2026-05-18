import { apiGet } from './client';

const PUBLISHED = '/api/published/';
const TRENDING = '/api/trending-keywords/';

export function fetchPublishedList({
  page = 1,
  search = '',
  ordering = '-generated_at',
  category_l1,
  category_l2,
  tag,
} = {}) {
  return apiGet(PUBLISHED, { page, search, ordering, category_l1, category_l2, tag });
}

export function fetchPublishedBySlug(slug) {
  return apiGet(`${PUBLISHED}${encodeURIComponent(slug)}/`);
}

export function fetchTrendingKeywords() {
  return apiGet(TRENDING);
}
