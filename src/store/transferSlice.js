import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOfficialRates } from '../services/bcrgApi';
import { supabase } from '../services/supabase';

// Conversion snake_case Supabase -> camelCase UI
const fromDb = (row) => ({
  id: row.id,
  receiverName: row.receiver_name,
  receiverPhone: row.receiver_phone,
  network: row.network,
  countryCode: row.country_code,
  currency: row.currency,
  amount: Number(row.amount),
  fees: Number(row.fees),
  rate: Number(row.rate),
  receivedGNF: Number(row.received_gnf),
  status: row.status,
  reference: row.reference,
  createdAt: row.created_at,
});

// ─────── Thunks ───────
export const refreshRates = createAsyncThunk('transfers/refreshRates', async () => {
  return await getOfficialRates();
});

export const fetchTransfers = createAsyncThunk(
  'transfers/fetch',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return rejectWithValue(error.message);
    return data.map(fromDb);
  }
);

// Crée un transfert côté DB puis renvoie la version persistée
export const createTransfer = createAsyncThunk(
  'transfers/create',
  async (payload, { rejectWithValue }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return rejectWithValue('Non authentifié');

    const row = {
      user_id: user.id,
      receiver_name: payload.receiverName,
      receiver_phone: payload.receiverPhone,
      network: payload.network,
      country_code: payload.countryCode,
      currency: payload.currency,
      amount: payload.amount,
      fees: payload.fees,
      rate: payload.rate,
      received_gnf: payload.receivedGNF,
      status: 'pending',
      reference: 'TR-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    };
    const { data, error } = await supabase
      .from('transfers')
      .insert(row)
      .select()
      .single();
    if (error) return rejectWithValue(error.message);
    return fromDb(data);
  }
);

const initialState = {
  transfers: [],
  rates: { EUR: 9500, USD: 8650, CAD: 6320, GBP: 10980, GNF: 1 },
  ratesUpdatedAt: null,
  ratesLoading: false,
  listLoading: false,
  listError: null,
};

const transferSlice = createSlice({
  name: 'transfers',
  initialState,
  reducers: {
    clearTransfers: (state) => {
      state.transfers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshRates.pending, (state) => {
        state.ratesLoading = true;
      })
      .addCase(refreshRates.fulfilled, (state, action) => {
        const { fetchedAt, ...rates } = action.payload;
        state.rates = rates;
        state.ratesUpdatedAt = fetchedAt;
        state.ratesLoading = false;
      })
      .addCase(refreshRates.rejected, (state) => {
        state.ratesLoading = false;
      })
      .addCase(fetchTransfers.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.transfers = action.payload;
        state.listLoading = false;
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.transfers.unshift(action.payload);
      });
  },
});

export const { clearTransfers } = transferSlice.actions;
export default transferSlice.reducer;
