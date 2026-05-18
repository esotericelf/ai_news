import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import SkipLink from './SkipLink';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadTaxonomy } from '../store/slices/taxonomySlice';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const taxonomyStatus = useAppSelector((state) => state.taxonomy.status);

  useEffect(() => {
    if (taxonomyStatus === 'idle') {
      dispatch(loadTaxonomy());
    }
  }, [dispatch, taxonomyStatus]);

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
