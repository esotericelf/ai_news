import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { config } from '../../config';

/**
 * Sends page_view on client-side route changes (gtag snippet lives in public/index.html).
 */
export default function GoogleAnalytics() {
  const location = useLocation();
  const measurementId = config.gaMeasurementId;

  useEffect(() => {
    if (!measurementId || typeof window.gtag !== 'function') {
      return;
    }
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    window.gtag('config', measurementId, { page_path: pagePath });
  }, [location.pathname, location.search, location.hash, measurementId]);

  return null;
}
