import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

export interface AuthState {
  accessToken: string | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  accessToken: null,
  status: "idle",
};

// Deliberately holds only the accessToken + auth status, not the User object — `getMe`
// (src/store/api/authApi.ts) is the single source of truth for user data, seeded directly
// from login/register/google responses via `authApi.util.upsertQueryData`. Storing the user
// here too would just be a second, driftable copy of the same data.
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    checkingSession(state) {
      state.status = "checking";
    },
    accessTokenSet(state, action: PayloadAction<{ accessToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
    },
    loggedOut(state) {
      state.accessToken = null;
      state.status = "unauthenticated";
    },
  },
});

export const { checkingSession, accessTokenSet, loggedOut } = authSlice.actions;
export default authSlice.reducer;
