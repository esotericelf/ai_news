import { apiGet } from './client';

const TAXONOMY = '/api/taxonomy/';
const TAGS = '/api/tags/';

export function fetchTaxonomy() {
  return apiGet(TAXONOMY);
}

export function fetchTags() {
  return apiGet(TAGS);
}
