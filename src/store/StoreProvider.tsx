"use client";

import { type ReactNode, useState } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";

import { makeStore } from "@/store";

// No <PersistGate> around the app: PersistGate renders nothing until localStorage has been read,
// which meant the server-rendered HTML had an empty <body> (no header, no h1, no product) and
// every page's content waited for hydration. The only persisted slice is the guest cart, and the
// hooks that read it (`useCart`, `useCartCount`) treat "not rehydrated yet"
// (`state.guestCart._persist.rehydrated === false`) as a loading state themselves.
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => {
    const created = makeStore();
    persistStore(created);
    return created;
  });

  return <Provider store={store}>{children}</Provider>;
}
