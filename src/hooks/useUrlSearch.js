import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setSearch } from '../store/slices/articlesSlice';
import { normalizeSearchQuery, parseSearchDisplay } from '../utils/search';

/**
 * Reads `search` from the URL, keeps Redux in sync, and exposes setters.
 */
export default function useUrlSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const raw = searchParams.get('search');
  const query = useMemo(() => normalizeSearchQuery(raw), [raw]);
  const display = useMemo(() => parseSearchDisplay(raw), [raw]);

  useEffect(() => {
    dispatch(setSearch(query));
  }, [dispatch, query]);

  const setSearchQuery = (value) => {
    const trimmed = value.trim();
    const next = new URLSearchParams(searchParams);
    if (trimmed) {
      next.set('search', trimmed);
    } else {
      next.delete('search');
    }
    next.delete('page');
    setSearchParams(next);
  };

  return {
    raw,
    query,
    display,
    searchParams,
    setSearchParams,
    setSearchQuery,
    hasSearch: Boolean(query),
  };
}
