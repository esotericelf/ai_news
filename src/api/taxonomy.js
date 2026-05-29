import TAXONOMY_FALLBACK from '../data/taxonomyFallback';
import { apiGet } from './client';

const TAXONOMY = '/api/taxonomy/';

export function fetchTaxonomy() {
  return apiGet(TAXONOMY);
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

