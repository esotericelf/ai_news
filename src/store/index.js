import { configureStore } from '@reduxjs/toolkit';
import articlesReducer from './slices/articlesSlice';
import trendingReducer from './slices/trendingSlice';

export const store = configureStore({
  reducer: {
    articles: articlesReducer,
    trending: trendingReducer,
  },
});
