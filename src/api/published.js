import { apiGet } from './client';

const PUBLISHED = '/api/published/';
const TRENDING = '/api/trending-keywords/';

export function fetchPublishedList({
  page = 1,
  page_size,
  ordering = '-generated_at',
  search,
  category_l1,
  category_l2,
  company,
  tool,
  industry,
} = {}) {
  return apiGet(PUBLISHED, {
    page,
    page_size,
    ordering,
    search,
    category_l1,
    category_l2,
    company,
    tool,
    industry,
  });
}

export function fetchPublishedBySlug(slug) {
  return apiGet(`${PUBLISHED}${encodeURIComponent(slug)}/`);
}

export function fetchTrendingKeywords() {
  return apiGet(TRENDING);
}
