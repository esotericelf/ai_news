import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchPublishedBySlug, fetchPublishedList } from '../../api/published';

export const loadArticles = createAsyncThunk(
  'articles/loadList',
  async (
    { page = 1, page_size, search, category_l1, category_l2, company, tool, industry } = {},
    { rejectWithValue }
  ) => {
    try {
      return await fetchPublishedList({
        page,
        page_size,
        search,
        ordering: '-generated_at',
        category_l1,
        category_l2,
        company,
        tool,
        industry,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load articles');
    }
  }
);

/** Server-side search fallback when client-side filtering finds no matches. */
export const loadArticlesServerSearch = createAsyncThunk(
  'articles/loadServerSearch',
  async (
    { search, page = 1, page_size, category_l1, category_l2, company, tool, industry } = {},
    { rejectWithValue }
  ) => {
    if (!search?.trim()) {
      return rejectWithValue('Search query is required');
    }
    try {
      return await fetchPublishedList({
        page,
        page_size,
        search: search.trim(),
        ordering: '-generated_at',
        category_l1,
        category_l2,
        company,
        tool,
        industry,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to search articles');
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
    serverSearch: {
      query: '',
      list: [],
      status: 'idle',
      error: null,
    },
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
    clearServerSearch(state) {
      state.serverSearch = {
        query: '',
        list: [],
        status: 'idle',
        error: null,
      };
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
      .addCase(loadArticlesServerSearch.pending, (state, action) => {
        state.serverSearch.status = 'loading';
        state.serverSearch.query = action.meta.arg.search?.trim() || '';
        state.serverSearch.error = null;
      })
      .addCase(loadArticlesServerSearch.fulfilled, (state, action) => {
        state.serverSearch.status = 'succeeded';
        const payload = action.payload;
        state.serverSearch.list = payload.results ?? payload;
      })
      .addCase(loadArticlesServerSearch.rejected, (state, action) => {
        state.serverSearch.status = 'failed';
        state.serverSearch.error = action.payload || 'Failed to search articles';
        state.serverSearch.list = [];
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

export const { setSearch, clearCurrentArticle, clearServerSearch } = articlesSlice.actions;
export default articlesSlice.reducer;
