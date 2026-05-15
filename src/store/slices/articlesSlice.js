import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchPublishedBySlug, fetchPublishedList } from '../../api/published';

export const loadArticles = createAsyncThunk(
  'articles/loadList',
  async ({ page = 1, search = '' } = {}, { rejectWithValue }) => {
    try {
      return await fetchPublishedList({
        page,
        search,
        ordering: '-generated_at',
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load articles');
    }
  }
);

export const loadArticleBySlug = createAsyncThunk(
  'articles/loadBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await fetchPublishedBySlug(slug);
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status });
    }
  }
);

const articlesSlice = createSlice({
  name: 'articles',
  initialState: {
    list: [],
    count: 0,
    next: null,
    previous: null,
    listStatus: 'idle',
    listError: null,
    currentPage: 1,
    search: '',
    bySlug: {},
    detailStatus: 'idle',
    detailError: null,
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },
    clearCurrentArticle(state) {
      state.detailStatus = 'idle';
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadArticles.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(loadArticles.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        const payload = action.payload;
        state.list = payload.results ?? payload;
        state.count = payload.count ?? state.list.length;
        state.next = payload.next ?? null;
        state.previous = payload.previous ?? null;
        if (action.meta.arg?.page) {
          state.currentPage = action.meta.arg.page;
        }
      })
      .addCase(loadArticles.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload || 'Failed to load articles';
      })
      .addCase(loadArticleBySlug.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(loadArticleBySlug.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        const article = action.payload;
        state.bySlug[article.slug] = article;
      })
      .addCase(loadArticleBySlug.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload;
      });
  },
});

export const { setSearch, clearCurrentArticle } = articlesSlice.actions;
export default articlesSlice.reducer;
