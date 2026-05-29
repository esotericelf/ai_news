import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { matrixUrl } from '../config';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadTaxonomy } from '../store/slices/taxonomySlice';

/** Redirect deprecated /tags/:slug URLs to the correct matrix route. */
export default function LegacyTagRedirect() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { companies, tools, industries, status } = useAppSelector((state) => state.taxonomy);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadTaxonomy());
    }
  }, [dispatch, status]);

  if (status === 'loading' || status === 'idle') {
    return <p className="topic-search__status">Redirecting…</p>;
  }

  if (companies.some((row) => row.slug === slug)) {
    return <Navigate to={matrixUrl('company', slug)} replace />;
  }
  if (tools.some((row) => row.slug === slug)) {
    return <Navigate to={matrixUrl('tool', slug)} replace />;
  }
  if (industries.some((row) => row.slug === slug)) {
    return <Navigate to={matrixUrl('industry', slug)} replace />;
  }

  return <Navigate to="/topics" replace />;
}
