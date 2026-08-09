import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/components/auth/GoogleSignInButton", () => ({
  GoogleSignInButton: () => null,
}));

const loginMock = jest.fn();
jest.mock("@/store/api/authApi", () => ({
  useLoginMutation: () => [loginMock, { isLoading: false }],
}));

import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    pushMock.mockReset();
  });

  it("shows inline validation errors instead of submitting when fields are empty", async () => {
    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("redirects to the target page on the happy path", async () => {
    loginMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          user: { _id: "u1", name: "Priya", email: "priya@example.com" },
          accessToken: "access-token",
          refreshToken: "refresh-token",
        }),
    });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "priya@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "correct-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("shows the backend's error message for invalid credentials", async () => {
    loginMock.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          status: 401,
          data: { success: false, error: { message: "Invalid email or password" } },
        }),
    });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "priya@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
