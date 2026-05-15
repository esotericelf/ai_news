import { Link } from 'react-router-dom';

export default function Tag({ label, asLink = true }) {
  if (!label) return null;
  if (!asLink) {
    return <span className="tag">{label}</span>;
  }
  return (
    <Link to={`/?search=${encodeURIComponent(label)}`} className="tag">
      {label}
    </Link>
  );
}
