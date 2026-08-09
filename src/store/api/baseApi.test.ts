/**
 * @jest-environment node
 *
 * Runs under Node's environment (not jsdom) because this test needs a real global `fetch` +
 * `Request`/`Response` for RTK Query's `fetchBaseQuery` — jsdom implements neither. Node has
 * no `window`, so `window.localStorage` (used by src/lib/authStorage.ts) is shimmed below with
 * a plain in-memory Map.
 */
const memoryStorage = new Map<string, string>();
Object.assign(globalThis, {
  window: {
    localStorage: {
      getItem: (key: string) => memoryStorage.get(key) ?? null,
      setItem: (key: string, value: string) => memoryStorage.set(key, value),
      removeItem: (key: string) => memoryStorage.delete(key),
    },
  },
});

import { clearStoredRefreshToken, setStoredRefreshToken } from "@/lib/authStorage";
import { makeStore } from "@/store";
import type { ApiSuccess } from "@/types";

import { baseApi } from "./baseApi";

const testApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Every real endpoint (Section 3) unwraps the backend's `{success, data}` envelope the
    // same way via `transformResponse` — see BACKEND_CONTRACT.md / CLAUDE_FRONTEND.md.
    ping: builder.query<{ ok: boolean }, void>({
      query: () => "/ping",
      transformResponse: (response: ApiSuccess<{ ok: boolean }>) => response.data,
    }),
  }),
  overrideExisting: true,
});

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("baseApi reauth flow", () => {
  afterEach(() => {
    clearStoredRefreshToken();
    jest.restoreAllMocks();
  });

  it("refreshes the access token once on a 401 and retries the original request", async () => {
    setStoredRefreshToken("stored-refresh-token");

    const calls: string[] = [];
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);
      calls.push(url);
      if (url.includes("/auth/refresh")) {
        return jsonResponse(200, {
          success: true,
          data: { accessToken: "new-access-token", refreshToken: "new-refresh-token" },
        });
      }
      if (url.includes("/ping")) {
        // First ping call has no Authorization header set yet -> unauthorized.
        // The retried call (after refresh) succeeds.
        const isRetry = calls.filter((c) => c.includes("/ping")).length > 1;
        return isRetry
          ? jsonResponse(200, { success: true, data: { ok: true } })
          : jsonResponse(401, {
              success: false,
              error: { message: "Invalid or expired access token" },
            });
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;

    const store = makeStore();
    const result = await store.dispatch(testApi.endpoints.ping.initiate()).unwrap();

    expect(result).toEqual({ ok: true });
    expect(calls.filter((c) => c.includes("/ping"))).toHaveLength(2);
    expect(calls.filter((c) => c.includes("/auth/refresh"))).toHaveLength(1);
    expect(store.getState().auth.accessToken).toBe("new-access-token");
    expect(store.getState().auth.status).toBe("authenticated");
  });

  it("logs out and does not call refresh when no refresh token is stored", async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse(401, { success: false, error: { message: "Invalid or expired access token" } }),
    ) as unknown as typeof fetch;

    const store = makeStore();
    await expect(store.dispatch(testApi.endpoints.ping.initiate()).unwrap()).rejects.toBeTruthy();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(store.getState().auth.status).toBe("unauthenticated");
  });
});
