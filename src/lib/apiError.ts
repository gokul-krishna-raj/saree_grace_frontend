import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

import type { ApiErrorBody } from "@/types";

// RTK Query's `error` on a failed query/mutation is either a FetchBaseQueryError (network/HTTP
// level, `.data` holding our backend's ApiErrorBody) or a SerializedError (thrown inside
// transformResponse/queryFn). This normalizes both into the single message we show the user.
export function getApiErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error) return fallback;

  if ("status" in error) {
    const data = error.data as ApiErrorBody | undefined;
    if (data && data.success === false) return data.error.message;
    if (error.status === "FETCH_ERROR") return "Couldn't reach the server. Check your connection.";
    if (error.status === "TIMEOUT_ERROR") return "The request timed out. Please try again.";
    return fallback;
  }

  return error.message ?? fallback;
}

// Only FetchBaseQueryError carries the backend's error.code (SerializedError has none) — used
// to branch on specific error codes (e.g. "EMAIL_NOT_VERIFIED") instead of matching on message.
export function getApiErrorCode(
  error: FetchBaseQueryError | SerializedError | undefined,
): string | undefined {
  if (!error || !("status" in error)) return undefined;
  const data = error.data as ApiErrorBody | undefined;
  return data && data.success === false ? data.error.code : undefined;
}
