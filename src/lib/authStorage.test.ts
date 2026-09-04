import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  subscribeAuthStorage,
} from "./authStorage";

describe("authStorage", () => {
  beforeEach(() => {
    clearStoredRefreshToken();
  });

  it("stores and retrieves the refresh token", () => {
    expect(getStoredRefreshToken()).toBeNull();
    setStoredRefreshToken("test-token");
    expect(getStoredRefreshToken()).toBe("test-token");
  });

  it("notifies subscribers when token is set and cleared", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeAuthStorage(listener);

    setStoredRefreshToken("new-token");
    expect(listener).toHaveBeenCalledTimes(1);

    clearStoredRefreshToken();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setStoredRefreshToken("another-token");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
