import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from "redux-persist";

import { baseApi } from "@/store/api/baseApi";
import authReducer from "@/store/slices/authSlice";
import filtersReducer from "@/store/slices/filtersSlice";
import guestCartReducer from "@/store/slices/guestCartSlice";
import uiReducer from "@/store/slices/uiSlice";
import storage from "@/store/storage";

// Only the guest cart is persisted (checklist Section 2). `auth` is deliberately excluded —
// the accessToken must never reach localStorage (see CLAUDE_FRONTEND.md); the refreshToken is
// persisted separately via src/lib/authStorage.ts, outside Redux entirely. Wishlist has no
// guest concept on the backend (auth-required), so there's nothing to persist for it.
const guestCartPersistConfig = { key: "sg_guest_cart", storage };

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  filters: filtersReducer,
  guestCart: persistReducer(guestCartPersistConfig, guestCartReducer),
  [baseApi.reducerPath]: baseApi.reducer,
});

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
