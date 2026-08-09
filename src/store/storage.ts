import type { Storage as PersistStorage } from "redux-persist";

const noopStorage: PersistStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

const browserStorage: PersistStorage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// redux-persist runs during the client-render pass of "use client" components on the server
// too (before hydration), where `window` doesn't exist — fall back to a noop there.
const storage: PersistStorage = typeof window === "undefined" ? noopStorage : browserStorage;

export default storage;
