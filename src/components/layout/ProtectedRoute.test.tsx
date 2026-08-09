import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import { makeStore } from "@/store";
import { accessTokenSet, checkingSession, loggedOut } from "@/store/slices/authSlice";

const replaceMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: jest.fn() }),
  usePathname: () => "/account",
}));

import { ProtectedRoute } from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  it("redirects to /login with a redirect param when logged out", () => {
    const store = makeStore();
    store.dispatch(loggedOut());

    render(
      <Provider store={store}>
        <ProtectedRoute>
          <p>Account content</p>
        </ProtectedRoute>
      </Provider>,
    );

    expect(replaceMock).toHaveBeenCalledWith("/login?redirect=%2Faccount");
    expect(screen.queryByText("Account content")).not.toBeInTheDocument();
  });

  it("shows a loading skeleton while the session check is in flight", () => {
    const store = makeStore();
    store.dispatch(checkingSession());

    render(
      <Provider store={store}>
        <ProtectedRoute>
          <p>Account content</p>
        </ProtectedRoute>
      </Provider>,
    );

    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Account content")).not.toBeInTheDocument();
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
  });

  it("renders children once authenticated", () => {
    const store = makeStore();
    store.dispatch(accessTokenSet({ accessToken: "a" }));

    render(
      <Provider store={store}>
        <ProtectedRoute>
          <p>Account content</p>
        </ProtectedRoute>
      </Provider>,
    );

    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.getByText("Account content")).toBeInTheDocument();
  });
});
