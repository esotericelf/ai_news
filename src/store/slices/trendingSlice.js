import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchTrendingKeywords } from '../../api/published';

export const loadTrending = createAsyncThunk(
  'trending/load',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchTrendingKeywords();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load trending keywords');
    }
  }
);

const trendingSlice = createSlice({
  name: 'trending',
  initialState: {
    keywords: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTrending.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadTrending.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const data = action.payload;
        state.keywords =
          data.keywords ?? data.results ?? (Array.isArray(data) ? data : []);
      })
      .addCase(loadTrending.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default trendingSlice.reducer;
