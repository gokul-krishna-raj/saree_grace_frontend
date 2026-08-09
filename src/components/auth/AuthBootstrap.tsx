"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { getStoredRefreshToken } from "@/lib/authStorage";
import { useGetMeQuery } from "@/store/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkingSession, loggedOut } from "@/store/slices/authSlice";

const MAX_TRANSIENT_RETRIES = 3;

function subscribe() {
  // localStorage has no change-notification mechanism we need here — this is read once per
  // mount, not watched for external mutation.
  return () => {};
}
function getClientSnapshot() {
  return getStoredRefreshToken() !== null;
}
function getServerSnapshot() {
  return false;
}

// Mounted once at the app root (see src/app/layout.tsx). On first load, checks for a persisted
// refreshToken (localStorage — the accessToken itself is memory-only and never survives a
// reload, see CLAUDE_FRONTEND.md). If one exists, `getMe` is queried, which 401s once and lets
// `baseQueryWithReauth` (src/store/api/baseApi.ts) silently refresh + retry — the same path a
// mid-session 401 takes, reused here for the boot-time silent-refresh flow instead of a second
// implementation. Guests with no stored refreshToken skip the network call entirely.
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  // useSyncExternalStore (not useState+useEffect) because the "true" value only exists on the
  // client (localStorage) — the server snapshot must be `false` for a stable SSR pass.
  const hasRefreshToken = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    dispatch(hasRefreshToken ? checkingSession() : loggedOut());
  }, [hasRefreshToken, dispatch]);

  const { isError, refetch } = useGetMeQuery(undefined, { skip: !hasRefreshToken });
  const status = useAppSelector((state) => state.auth.status);
  const retryCountRef = useRef(0);

  // A transient refresh failure (rate limit, network blip — see baseApi.ts) leaves status at
  // "checking" instead of resolving it either way, so a single bad request can't misroute an
  // action to the guest path or force-log-out a user whose refresh token is actually still
  // valid. Retry with backoff a few times so that user isn't stranded in "checking" forever.
  useEffect(() => {
    if (!isError || status !== "checking" || retryCountRef.current >= MAX_TRANSIENT_RETRIES) return;
    const attempt = retryCountRef.current;
    const timer = setTimeout(
      () => {
        retryCountRef.current = attempt + 1;
        refetch();
      },
      1000 * 2 ** attempt,
    );
    return () => clearTimeout(timer);
  }, [isError, status, refetch]);

  return null;
}
