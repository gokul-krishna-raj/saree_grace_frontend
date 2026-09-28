import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// `false` on the server and during hydration, `true` afterwards. Use it to gate UI that depends
// on browser-only state (e.g. the localStorage-backed guest cart) so the first client render
// matches the server HTML and React doesn't throw away the tree with a hydration mismatch.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
