import { useEffect } from 'react';
import Tag from '../../components/ui/Tag';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadTrending } from '../../store/slices/trendingSlice';

export default function TrendingTags() {
  const dispatch = useAppDispatch();
  const { keywords, status } = useAppSelector((state) => state.trending);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadTrending());
    }
  }, [dispatch, status]);

  if (status !== 'succeeded' || !keywords.length) return null;

  const labels = keywords
    .map((k) => (typeof k === 'string' ? k : k.keyword || k.name))
    .filter(Boolean)
    .slice(0, 10);

  if (!labels.length) return null;

  return (
    <nav className="topic-rail" aria-label="Trending topics">
      <span className="topic-rail__label">Trending</span>
      <ul className="topic-rail__list">
        {labels.map((label) => (
          <li key={label}>
            <Tag label={label} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
