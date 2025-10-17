// src/features/userSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  username?: string;
  email?: string;
}

interface UserState {
  data: User | null;
  loading: boolean;
  error: string | null;
}

export const fetchUser = createAsyncThunk<
  User,
  number,
  { rejectValue: string }
>(
  'user/fetchUser',
  async (userId, thunkAPI) => {
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      if (!res.ok) {
        return thunkAPI.rejectWithValue(`HTTP ${res.status}`);
      }
      const data: User = await res.json();
      return data;
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }
      return thunkAPI.rejectWithValue('Unknown error');
    }
  }
);

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message ?? 'Error fetching user';
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;