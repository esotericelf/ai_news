import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadTagCatalog, loadTaxonomyTree } from '../../api/taxonomy';

export const loadTaxonomy = createAsyncThunk(
  'taxonomy/load',
  async (_, { rejectWithValue }) => {
    try {
      const { tree, fromFallback: treeFallback } = await loadTaxonomyTree();
      const { tags, fromFallback: tagsFallback } = await loadTagCatalog(tree);
      return {
        tree,
        tags,
        fromFallback: treeFallback || tagsFallback,
      };
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
    fromFallback: false,
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
        state.fromFallback = action.payload.fromFallback;
      })
      .addCase(loadTaxonomy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load taxonomy';
      });
  },
});

export default taxonomySlice.reducer;
