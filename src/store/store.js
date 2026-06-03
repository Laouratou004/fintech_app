import { configureStore } from '@reduxjs/toolkit';
import transfersReducer from './transferSlice';
import beneficiariesReducer from './beneficiariesSlice';

export const store = configureStore({
  reducer: {
    transfers: transfersReducer,
    beneficiaries: beneficiariesReducer,
  },
});
