import { configureStore } from '@reduxjs/toolkit';
import articlesReducer from './slices/articlesSlice';
import taxonomyReducer from './slices/taxonomySlice';
import trendingReducer from './slices/trendingSlice';

export const store = configureStore({
  reducer: {
    articles: articlesReducer,
    trending: trendingReducer,
    taxonomy: taxonomyReducer,
  },
});
