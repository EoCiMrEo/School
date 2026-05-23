import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  profile: null,
  access: null,
  refresh: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      const { user, profile, access, refresh } = action.payload || {};
      state.user = user || null;
      state.profile = profile || null;
      state.access = access || null;
      state.refresh = refresh || null;
      state.isAuthenticated = !!(state.access || state.user);
    },
    clearAuth(state) {
      state.user = null;
      state.profile = null;
      state.access = null;
      state.refresh = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
