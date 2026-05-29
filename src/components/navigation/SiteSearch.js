import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useUrlSearch from '../../hooks/useUrlSearch';

export default function SiteSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { display } = useUrlSearch();
  const [value, setValue] = useState(display);

  useEffect(() => {
    setValue(display);
  }, [display]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set('search', trimmed);
    }
    const qs = params.toString();
    const targetPath = location.pathname === '/' ? '/' : '/';
    navigate(qs ? `${targetPath}?${qs}` : targetPath);
  };

  return (
    <form className="site-search" action="/" method="get" role="search" onSubmit={handleSubmit}>
      <label htmlFor="site-search-input" className="visually-hidden">
        Search articles
      </label>
      <input
        id="site-search-input"
        type="search"
        name="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search"
        autoComplete="off"
      />
      <button type="submit" aria-label="Search">
        →
      </button>
    </form>
  );
}
