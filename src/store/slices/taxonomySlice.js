import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadMatrixCatalog } from '../../api/matrix';
import { loadTaxonomyTree } from '../../api/taxonomy';

export const loadTaxonomy = createAsyncThunk(
  'taxonomy/load',
  async (_, { rejectWithValue }) => {
    try {
      const { tree, fromFallback: treeFallback } = await loadTaxonomyTree();
      const {
        companies,
        tools,
        industries,
        fromFallback: matrixFallback,
      } = await loadMatrixCatalog(tree);
      return {
        tree,
        companies,
        tools,
        industries,
        fromFallback: treeFallback || matrixFallback,
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
    companies: [],
    tools: [],
    industries: [],
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
        state.companies = action.payload.companies;
        state.tools = action.payload.tools;
        state.industries = action.payload.industries;
        state.fromFallback = action.payload.fromFallback;
      })
      .addCase(loadTaxonomy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load taxonomy';
      });
  },
});

export default taxonomySlice.reducer;
