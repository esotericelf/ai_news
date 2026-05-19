import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';
import AppLayout from './layout/AppLayout';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import TagPage from './pages/TagPage';
import TopicsPage from './pages/TopicsPage';
import EditorPage from './pages/EditorPage';
import { store } from './store';
import { config } from './config';

export default function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <GoogleAnalytics />
          <Routes>
            <Route path="editor" element={<EditorPage />} />
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="topics" element={<TopicsPage />} />
              <Route path="category/:l1" element={<CategoryPage />} />
              <Route path="category/:l1/:l2" element={<CategoryPage />} />
              <Route path="tags/:slug" element={<TagPage />} />
              <Route path={`${config.articlePath}/:slug`} element={<ArticlePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  );
}
