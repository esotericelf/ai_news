import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';
import ScrollToTop from './components/navigation/ScrollToTop';
import { AuthProvider } from './features/auth/AuthContext';
import AppLayout from './layout/AppLayout';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';
import HomePage from './pages/HomePage';
import LegacyTagRedirect from './pages/LegacyTagRedirect';
import MasterReportPage from './pages/MasterReportPage';
import MatrixEntityPage from './pages/MatrixEntityPage';
import NotFoundPage from './pages/NotFoundPage';
import SitemapPage from './pages/SitemapPage';
import TopicsPage from './pages/TopicsPage';
import EditorPage from './pages/EditorPage';
import { store } from './store';
import { config } from './config';

export default function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <ScrollToTop />
          <GoogleAnalytics />
          <AuthProvider>
          <Routes>
            <Route path="editor" element={<EditorPage />} />
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="topics" element={<TopicsPage />} />
              <Route path="report" element={<MasterReportPage />} />
              <Route path="sitemap" element={<SitemapPage />} />
              <Route path="category/:l1" element={<CategoryPage />} />
              <Route path="category/:l1/:l2" element={<CategoryPage />} />
              <Route path="companies/:slug" element={<MatrixEntityPage matrixType="company" />} />
              <Route path="tools/:slug" element={<MatrixEntityPage matrixType="tool" />} />
              <Route
                path="industries/:slug"
                element={<MatrixEntityPage matrixType="industry" />}
              />
              <Route path="tags/:slug" element={<LegacyTagRedirect />} />
              <Route path={`${config.articlePath}/:slug`} element={<ArticlePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  );
}
