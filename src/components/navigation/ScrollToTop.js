import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SPA routes do not reset scroll position. On each navigation, jump to the top
 * of the page and move focus to main content for keyboard/screen-reader users.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: 'auto' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const main = document.getElementById('main-content');
    if (main) {
      main.focus({ preventScroll: true });
    }
  }, [pathname, search, hash]);

  return null;
}
