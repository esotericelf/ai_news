import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchTags, fetchTaxonomy } from '../../api/taxonomy';

export const loadTaxonomy = createAsyncThunk(
  'taxonomy/load',
  async (_, { rejectWithValue }) => {
    try {
      const [tree, tagCatalog] = await Promise.all([fetchTaxonomy(), fetchTags()]);
      return { tree, tags: tagCatalog.tags ?? [] };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load taxonomy');
    }
  }
);

const taxonomySlice = createSlice({
  name: 'taxonomy',
  initialState: {
    tree: null,
    tags: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTaxonomy.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadTaxonomy.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tree = action.payload.tree;
        state.tags = action.payload.tags;
      })
      .addCase(loadTaxonomy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load taxonomy';
      });
  },
});

export default taxonomySlice.reducer;
