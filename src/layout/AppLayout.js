import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import SkipLink from './SkipLink';

export default function AppLayout() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content" className="site-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
