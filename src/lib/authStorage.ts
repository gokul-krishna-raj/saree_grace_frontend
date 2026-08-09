const REFRESH_TOKEN_KEY = "sg_refresh_token";

// accessToken deliberately never touches localStorage/redux-persist — see CLAUDE_FRONTEND.md.
// Only the refreshToken is persisted here, to allow a silent refresh on app load.
export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearStoredRefreshToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
