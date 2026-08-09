import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
} from "@/lib/authStorage";
import { env } from "@/lib/env";
import type { RootState } from "@/store";
import { accessTokenSet, loggedOut } from "@/store/slices/authSlice";
import type { ApiSuccess } from "@/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  // Indirect reference so `fetch` is resolved at call time, not when this module is first
  // evaluated — fetchBaseQuery otherwise captures a (possibly undefined) `fetch` immediately,
  // which breaks in the jsdom test environment where it's attached to `global` after import.
  fetchFn: (...args) => fetch(...args),
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return headers;
  },
});

interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
}

// Dedupe concurrent 401s into a single in-flight refresh call, so N parallel requests that all
// expire at once don't each fire their own /auth/refresh (which would race the backend's
// one-time-use rotation and revoke the whole chain on the loser).
interface RefreshOutcome {
  accessToken: string | null;
  // Only an explicit 401/403 from the refresh endpoint itself proves the refresh token is
  // actually dead (expired/revoked/reused-after-rotation). Everything else — a 429 from the
  // shared `/auth/*` rate limiter, a 5xx, a dropped connection — is a failure of *this attempt*,
  // not evidence the session is gone, so the stored token must survive it (see below).
  invalid: boolean;
}
let refreshPromise: Promise<RefreshOutcome> | null = null;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const storedRefreshToken = getStoredRefreshToken();

    if (!storedRefreshToken) {
      api.dispatch(loggedOut());
      return result;
    }

    refreshPromise ??= Promise.resolve(
      rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken: storedRefreshToken } },
        api,
        extraOptions,
      ),
    )
      .then((refreshResult) => {
        const body = refreshResult.data as ApiSuccess<RefreshResponseData> | undefined;
        if (body?.success) {
          setStoredRefreshToken(body.data.refreshToken);
          api.dispatch(accessTokenSet({ accessToken: body.data.accessToken }));
          return { accessToken: body.data.accessToken, invalid: false };
        }
        const refreshStatus = refreshResult.error?.status;
        return { accessToken: null, invalid: refreshStatus === 401 || refreshStatus === 403 };
      })
      .finally(() => {
        refreshPromise = null;
      });

    const refreshOutcome = await refreshPromise;

    if (refreshOutcome.accessToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else if (refreshOutcome.invalid) {
      clearStoredRefreshToken();
      api.dispatch(loggedOut());
    }
    // else: a transient refresh failure. Deliberately don't clear the stored token or dispatch
    // loggedOut() — leave auth status exactly as it was (typically still "checking") so the next
    // request gets another chance with the still-valid token instead of a rate-limit blip
    // silently and permanently logging out a real user.
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Category", "Cart", "Wishlist", "Order", "Review", "User", "Dashboard"],
  endpoints: () => ({}),
});
