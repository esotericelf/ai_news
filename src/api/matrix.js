import { fallbackMatrixFromTree } from '../data/taxonomyFallback';
import { apiGet } from './client';

const COMPANIES = '/api/companies/';
const TOOLS = '/api/tools/';
const INDUSTRIES = '/api/industries/';

function unwrapList(payload, key) {
  if (Array.isArray(payload)) return payload;
  if (payload?.results) return payload.results;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  return [];
}

export function fetchCompanies() {
  return apiGet(COMPANIES);
}

export function fetchTools() {
  return apiGet(TOOLS);
}

export function fetchIndustries() {
  return apiGet(INDUSTRIES);
}

/** Load company / tool / industry catalogs from the matrix API. */
export async function loadMatrixCatalog(tree) {
  try {
    const [companiesRes, toolsRes, industriesRes] = await Promise.all([
      fetchCompanies(),
      fetchTools(),
      fetchIndustries(),
    ]);
    return {
      companies: unwrapList(companiesRes, 'companies'),
      tools: unwrapList(toolsRes, 'tools'),
      industries: unwrapList(industriesRes, 'industries'),
      fromFallback: false,
    };
  } catch (err) {
    if (err.status === 404) {
      return { ...fallbackMatrixFromTree(tree), fromFallback: true };
    }
    throw err;
  }
}
