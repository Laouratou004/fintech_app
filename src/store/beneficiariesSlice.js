import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../services/supabase';

const fromDb = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  network: row.network,
  relation: row.relation || '',
  favorite: !!row.favorite,
});

// ─────── Thunks ───────
export const fetchBeneficiaries = createAsyncThunk(
  'beneficiaries/fetch',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return rejectWithValue(error.message);
    return data.map(fromDb);
  }
);

export const addBeneficiary = createAsyncThunk(
  'beneficiaries/add',
  async (input, { rejectWithValue }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('Non authentifié');

    const { data, error } = await supabase
      .from('beneficiaries')
      .insert({
        user_id: user.id,
        name: input.name,
        phone: input.phone,
        network: input.network,
        relation: input.relation || null,
        favorite: false,
      })
      .select()
      .single();
    if (error) return rejectWithValue(error.message);
    return fromDb(data);
  }
);

export const removeBeneficiary = createAsyncThunk(
  'beneficiaries/remove',
  async (id, { rejectWithValue }) => {
    const { error } = await supabase.from('beneficiaries').delete().eq('id', id);
    if (error) return rejectWithValue(error.message);
    return id;
  }
);

export const toggleFavorite = createAsyncThunk(
  'beneficiaries/toggleFavorite',
  async (id, { getState, rejectWithValue }) => {
    const current = getState().beneficiaries.list.find((b) => b.id === id);
    if (!current) return rejectWithValue('Introuvable');
    const { error } = await supabase
      .from('beneficiaries')
      .update({ favorite: !current.favorite })
      .eq('id', id);
    if (error) return rejectWithValue(error.message);
    return { id, favorite: !current.favorite };
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const beneficiariesSlice = createSlice({
  name: 'beneficiaries',
  initialState,
  reducers: {
    clearBeneficiaries: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addBeneficiary.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(removeBeneficiary.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b.id !== action.payload);
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const b = state.list.find((x) => x.id === action.payload.id);
        if (b) b.favorite = action.payload.favorite;
      });
  },
});

export const { clearBeneficiaries } = beneficiariesSlice.actions;
export default beneficiariesSlice.reducer;
