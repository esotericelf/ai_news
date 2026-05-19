import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { categoryUrl } from '../../config';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadTaxonomy } from '../../store/slices/taxonomySlice';

const MOBILE_MQ = '(max-width: 639px)';
const HOVER_MQ = '(hover: hover) and (pointer: fine)';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function CategoryPanel({ l1, panelId, className = '', onMouseEnter }) {
  const label = l1.nav_label || l1.title;
  return (
    <div
      id={panelId}
      className={`taxonomy-nav__panel ${className}`.trim()}
      role="region"
      aria-label={`${label} subcategories`}
      onMouseEnter={onMouseEnter}
    >
      <p className="taxonomy-nav__panel-title">{l1.title}</p>
      <ul className="taxonomy-nav__subs">
        <li>
          <Link to={categoryUrl(l1.slug)} className="taxonomy-nav__all">
            All in {label}
          </Link>
        </li>
        {l1.subcategories.map((l2) => (
          <li key={l2.slug}>
            <Link to={categoryUrl(l1.slug, l2.slug)}>{l2.nav_label || l2.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TaxonomyNav() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { tree, status, error, fromFallback } = useAppSelector((state) => state.taxonomy);
  const [openSlug, setOpenSlug] = useState(null);
  const navRef = useRef(null);
  const isMobile = useMediaQuery(MOBILE_MQ);
  const hoverCapable = useMediaQuery(HOVER_MQ);
  const categories = tree?.categories ?? [];
  const openCategory = categories.find((c) => c.slug === openSlug) ?? null;
  const onHome = location.pathname === '/';

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

  const toggleCategory = (l1, hasSubs, isOpen) => {
    if (!hasSubs) {
      setOpenSlug(null);
      return;
    }
    setOpenSlug(isOpen ? null : l1.slug);
  };

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
      <div className="taxonomy-nav__bar">
        <ul className="taxonomy-nav__list">
          {!onHome && (
            <li className="taxonomy-nav__item taxonomy-nav__item--home">
              <Link to="/" className="taxonomy-nav__l1 taxonomy-nav__l1--home">
                Home
              </Link>
            </li>
          )}
          {categories.map((l1) => {
            const isOpen = openSlug === l1.slug;
            const hasSubs = l1.subcategories?.length > 0;
            const panelId = `taxonomy-panel-${l1.slug}`;

            return (
              <li
                key={l1.slug}
                className={`taxonomy-nav__item${isOpen ? ' taxonomy-nav__item--open' : ''}`}
                onMouseEnter={() => hoverCapable && hasSubs && setOpenSlug(l1.slug)}
                onMouseLeave={() => hoverCapable && hasSubs && setOpenSlug(null)}
              >
                <Link
                  to={categoryUrl(l1.slug)}
                  className="taxonomy-nav__l1"
                  aria-expanded={hasSubs ? isOpen : undefined}
                  aria-haspopup={hasSubs ? 'true' : undefined}
                  aria-controls={hasSubs ? panelId : undefined}
                  onClick={(e) => {
                    if (hasSubs) {
                      e.preventDefault();
                      toggleCategory(l1, hasSubs, isOpen);
                    } else {
                      setOpenSlug(null);
                    }
                  }}
                  onFocus={() => hasSubs && setOpenSlug(l1.slug)}
                >
                  <span>{l1.nav_label || l1.title}</span>
                  {hasSubs && (
                    <span className="taxonomy-nav__chevron" aria-hidden="true">
                      {isOpen ? '▴' : '▾'}
                    </span>
                  )}
                </Link>
                {hasSubs && !isMobile && isOpen && (
                  <CategoryPanel
                    l1={l1}
                    panelId={panelId}
                    onMouseEnter={() => setOpenSlug(l1.slug)}
                  />
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
      </div>
      {isMobile && openCategory && openCategory.subcategories?.length > 0 && (
        <CategoryPanel
          l1={openCategory}
          panelId={`taxonomy-panel-${openCategory.slug}`}
          className="taxonomy-nav__panel--mobile"
        />
      )}
      {status === 'failed' && error && (
        <span className="visually-hidden">{error}</span>
      )}
    </nav>
  );
}
