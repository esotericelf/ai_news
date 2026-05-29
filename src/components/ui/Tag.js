import { Link } from 'react-router-dom';
import { matrixUrl } from '../../config';

export default function Tag({ label, slug, matrixType, asLink = true }) {
  if (!label && !slug) return null;
  const text = label || slug;
  if (!asLink) {
    return <span className="tag">{text}</span>;
  }
  const to =
    slug && matrixType ? matrixUrl(matrixType, slug) : `/?search=${encodeURIComponent(text)}`;
  return (
    <Link to={to} className="tag">
      {text}
    </Link>
  );
}
