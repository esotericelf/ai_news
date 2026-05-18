import TAXONOMY_FALLBACK, { fallbackTagsFromTree } from '../data/taxonomyFallback';
import { apiGet } from './client';

const TAXONOMY = '/api/taxonomy/';
const TAGS = '/api/tags/';

export function fetchTaxonomy() {
  return apiGet(TAXONOMY);
}

export function fetchTags() {
  return apiGet(TAGS);
}

/** Load taxonomy tree; use bundled fallback when API returns 404 (older backend). */
export async function loadTaxonomyTree() {
  try {
    return { tree: await fetchTaxonomy(), fromFallback: false };
  } catch (err) {
    if (err.status === 404) {
      return { tree: TAXONOMY_FALLBACK, fromFallback: true };
    }
    throw err;
  }
}

/** Load tag catalog; derive from fallback entities when /api/tags/ is missing. */
export async function loadTagCatalog(tree) {
  try {
    const catalog = await fetchTags();
    return { tags: catalog.tags ?? [], fromFallback: false };
  } catch (err) {
    if (err.status === 404) {
      return { tags: fallbackTagsFromTree(tree), fromFallback: true };
    }
    throw err;
  }
}
