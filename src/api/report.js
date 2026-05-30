import { apiRequest } from './http';

const MASTER_STATS = '/api/v1/report/master-stats/';

/** Aggregate stats + executive summary for the Master Report page. */
export function fetchMasterStats({ publicOnly = true } = {}) {
  return apiRequest(MASTER_STATS, {
    params: publicOnly ? { public_only: '1' } : {},
  });
}
