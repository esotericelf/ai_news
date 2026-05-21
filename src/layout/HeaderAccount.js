import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export default function HeaderAccount() {
  const { user, loading, isFirebaseConfigured } = useAuth();

  if (loading && isFirebaseConfigured) {
    return (
      <span className="site-header__account site-header__account--muted" aria-hidden="true">
        ···
      </span>
    );
  }

  if (user) {
    return (
      <Link to="/editor" className="site-header__account site-header__account--signed-in">
        Editor
      </Link>
    );
  }

  return (
    <Link to="/editor" className="site-header__account">
      Sign in
    </Link>
  );
}
