import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { config } from '../../config';

function loadGtag(measurementId) {
  if (!measurementId || typeof document === 'undefined') {
    return Promise.resolve(false);
  }
  if (document.getElementById('ga-script')) {
    return Promise.resolve(typeof window.gtag === 'function');
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', measurementId, { send_page_view: false });
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Loads gtag from REACT_APP_GA_MEASUREMENT_ID and sends page_view on SPA navigations.
 */
export default function GoogleAnalytics() {
  const location = useLocation();
  const measurementId = config.gaMeasurementId;
  const [gaReady, setGaReady] = useState(false);

  useEffect(() => {
    if (!measurementId) {
      setGaReady(false);
      return undefined;
    }
    let cancelled = false;
    loadGtag(measurementId).then((ok) => {
      if (!cancelled) setGaReady(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || !gaReady || typeof window.gtag !== 'function') {
      return;
    }
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    window.gtag('event', 'page_view', { page_path: pagePath });
  }, [gaReady, location.pathname, location.search, location.hash, measurementId]);

  return null;
}
