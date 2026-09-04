const REFRESH_TOKEN_KEY = "sg_refresh_token";

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore subscriber errors to prevent breaking storage operations
    }
  });
}

export function subscribeAuthStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === REFRESH_TOKEN_KEY || event.key === null) {
      listener();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

// accessToken deliberately never touches localStorage/redux-persist — see CLAUDE_FRONTEND.md.
// Only the refreshToken is persisted here, to allow a silent refresh on app load.
export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  notifyListeners();
}

export function clearStoredRefreshToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyListeners();
}
