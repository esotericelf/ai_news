import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { categoryUrl } from '../../config';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadTaxonomy } from '../../store/slices/taxonomySlice';

export default function TaxonomyNav() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { tree, status, error, fromFallback } = useAppSelector((state) => state.taxonomy);
  const [openSlug, setOpenSlug] = useState(null);
  const navRef = useRef(null);
  const categories = tree?.categories ?? [];

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadTaxonomy());
    }
  }, [dispatch, status]);

  useEffect(() => {
    setOpenSlug(null);
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenSlug(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <nav className="taxonomy-nav" aria-label="Topics by category" ref={navRef}>
      {status === 'loading' && (
        <p className="taxonomy-nav__status" aria-live="polite">
          Loading topics…
        </p>
      )}
      {status === 'failed' && (
        <p className="taxonomy-nav__status taxonomy-nav__status--error" role="status">
          Could not load categories — check API connection and restart npm start.
        </p>
      )}
      {status === 'succeeded' && fromFallback && (
        <p className="taxonomy-nav__status taxonomy-nav__status--warn" role="status">
          Using built-in categories (update backend for live taxonomy and tag counts).
        </p>
      )}
      <ul className="taxonomy-nav__list">
        {categories.map((l1) => {
          const isOpen = openSlug === l1.slug;
          const hasSubs = l1.subcategories?.length > 0;
          return (
            <li
              key={l1.slug}
              className={`taxonomy-nav__item${isOpen ? ' taxonomy-nav__item--open' : ''}`}
              onMouseEnter={() => hasSubs && setOpenSlug(l1.slug)}
              onMouseLeave={() => hasSubs && setOpenSlug(null)}
            >
              <Link
                to={categoryUrl(l1.slug)}
                className="taxonomy-nav__l1"
                aria-expanded={hasSubs ? isOpen : undefined}
                aria-haspopup={hasSubs ? 'true' : undefined}
                onClick={(e) => {
                  if (hasSubs) {
                    e.preventDefault();
                    setOpenSlug(isOpen ? null : l1.slug);
                  } else {
                    setOpenSlug(null);
                  }
                }}
                onFocus={() => hasSubs && setOpenSlug(l1.slug)}
              >
                {l1.nav_label || l1.title}
              </Link>
              {hasSubs && (
                <div
                  className="taxonomy-nav__panel"
                  hidden={!isOpen}
                  onMouseEnter={() => setOpenSlug(l1.slug)}
                >
                  <p className="taxonomy-nav__panel-title">{l1.title}</p>
                  <ul className="taxonomy-nav__subs">
                    <li>
                      <Link to={categoryUrl(l1.slug)} className="taxonomy-nav__all">
                        All in {l1.nav_label || l1.title}
                      </Link>
                    </li>
                    {l1.subcategories.map((l2) => (
                      <li key={l2.slug}>
                        <Link to={categoryUrl(l1.slug, l2.slug)}>{l2.nav_label || l2.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
        <li className="taxonomy-nav__item taxonomy-nav__item--topics">
          <Link to="/topics" className="taxonomy-nav__l1 taxonomy-nav__l1--accent">
            Browse topics
          </Link>
        </li>
      </ul>
      {status === 'failed' && error && (
        <span className="visually-hidden">{error}</span>
      )}
    </nav>
  );
}
