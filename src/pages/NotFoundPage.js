import { Link } from 'react-router-dom';
import SeoHead from '../seo/SeoHead';

export default function NotFoundPage() {
  return (
    <div className="page page--404">
      <SeoHead title="Page not found" noindex />
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn--primary">
        Back to home
      </Link>
    </div>
  );
}
