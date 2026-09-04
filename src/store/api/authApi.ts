import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
} from "@/lib/authStorage";
import type { AppDispatch, RootState } from "@/store";
import { baseApi } from "@/store/api/baseApi";
import { cartApi } from "@/store/api/cartApi";
import { accessTokenSet, loggedOut } from "@/store/slices/authSlice";
import { guestCartCleared } from "@/store/slices/guestCartSlice";
import type { ApiSuccess, User } from "@/types";

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

async function applyAuthResult(
  queryFulfilled: Promise<{ data: AuthResult }>,
  dispatch: AppDispatch,
  // RTK Query's lifecycle `getState` is typed against just this API slice, not the full store
  // — same reason baseApi.ts casts it for prepareHeaders.
  getState: () => unknown,
) {
  const { data } = await queryFulfilled;
  setStoredRefreshToken(data.refreshToken);
  dispatch(accessTokenSet({ accessToken: data.accessToken }));
  await dispatch(authApi.util.upsertQueryData("getMe", undefined, data.user));

  // Fold any guest-cart items (added before signing in — the backend has no anonymous cart,
  // see BACKEND_CONTRACT.md) into the now-authenticated server cart, then clear the local copy
  // so it isn't double-counted or re-merged on a later login.
  const guestItems = (getState() as RootState).guestCart.items;
  if (guestItems.length > 0) {
    await dispatch(
      cartApi.endpoints.mergeCart.initiate({
        items: guestItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          qty: item.qty,
        })),
      }),
    );
    dispatch(guestCartCleared());
  }
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Deliberately doesn't establish a session (no tokens returned) — the account is unverified
    // until the OTP step (verifyOtp below) succeeds, which is what actually logs the user in.
    register: builder.mutation<RegisterResult, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (response: ApiSuccess<RegisterResult>) => response.data,
    }),
    verifyOtp: builder.mutation<AuthResult, VerifyOtpRequest>({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
      transformResponse: (response: ApiSuccess<AuthResult>) => response.data,
      onQueryStarted: async (_arg, { dispatch, getState, queryFulfilled }) => {
        await applyAuthResult(queryFulfilled, dispatch, getState);
      },
    }),
    resendOtp: builder.mutation<{ message: string }, ResendOtpRequest>({
      query: (body) => ({ url: "/auth/resend-otp", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ message: string }>) => response.data,
    }),
    login: builder.mutation<AuthResult, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (response: ApiSuccess<AuthResult>) => response.data,
      onQueryStarted: async (_arg, { dispatch, getState, queryFulfilled }) => {
        await applyAuthResult(queryFulfilled, dispatch, getState);
      },
    }),
    googleLogin: builder.mutation<AuthResult, GoogleAuthRequest>({
      query: (body) => ({ url: "/auth/google", method: "POST", body }),
      transformResponse: (response: ApiSuccess<AuthResult>) => response.data,
      onQueryStarted: async (_arg, { dispatch, getState, queryFulfilled }) => {
        await applyAuthResult(queryFulfilled, dispatch, getState);
      },
    }),
    // Logout is best-effort against the backend — it must still clear local session state
    // (and cached data belonging to this user) even if the network call fails or there's no
    // refresh token to revoke (e.g. it already expired).
    logout: builder.mutation<null, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        const refreshToken = getStoredRefreshToken();
        if (refreshToken) {
          await baseQuery({ url: "/auth/logout", method: "POST", body: { refreshToken } });
        }
        return { data: null };
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await queryFulfilled.catch(() => undefined);
        clearStoredRefreshToken();
        dispatch(loggedOut());
        dispatch(baseApi.util.resetApiState());
      },
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ message: string }>) => response.data,
    }),
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ message: string }>) => response.data,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await queryFulfilled.catch(() => undefined);
        clearStoredRefreshToken();
        dispatch(loggedOut());
      },
    }),
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      transformResponse: (response: ApiSuccess<{ user: User }>) => response.data.user,
      providesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;
