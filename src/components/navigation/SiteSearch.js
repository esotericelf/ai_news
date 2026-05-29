import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUrlSearch from '../../hooks/useUrlSearch';

function buildHomeSearch(trimmed) {
  return trimmed ? `search=${encodeURIComponent(trimmed)}` : '';
}

export default function SiteSearch() {
  const navigate = useNavigate();
  const { display } = useUrlSearch();
  const [value, setValue] = useState(display);

  useEffect(() => {
    setValue(display);
  }, [display]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    navigate({
      pathname: '/',
      search: buildHomeSearch(trimmed),
    });
  };

  return (
    <form className="site-search" role="search" noValidate onSubmit={handleSubmit}>
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
