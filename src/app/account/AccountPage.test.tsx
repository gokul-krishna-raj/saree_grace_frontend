import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/account",
}));

jest.mock("@/components/account/AccountNav", () => ({
  AccountNav: () => null,
}));

jest.mock("@/components/layout/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockLogout = jest.fn();
jest.mock("@/store/api/authApi", () => ({
  useGetMeQuery: () => getMeResult,
  useLogoutMutation: () => [mockLogout, { isLoading: false }],
}));

import type { User } from "@/types";

let getMeResult: {
  data: User | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} = {
  data: undefined,
  isLoading: true,
  isError: false,
  refetch: jest.fn(),
};

import AccountPage from "./page";

describe("AccountPage", () => {
  it("displays loading skeleton while profile data is loading", () => {
    getMeResult = {
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    };

    render(<AccountPage />);

    expect(screen.getByText("Your account")).toBeInTheDocument();
    expect(screen.queryByText("Priya Raman")).not.toBeInTheDocument();
  });

  it("displays user profile details when loaded", () => {
    getMeResult = {
      data: {
        _id: "u1",
        name: "Priya Raman",
        email: "priya@example.com",
        role: "customer",
        addresses: [],
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    };

    render(<AccountPage />);

    expect(screen.getByText("Your account")).toBeInTheDocument();
    expect(screen.getByText("Priya Raman")).toBeInTheDocument();
    expect(screen.getByText("priya@example.com")).toBeInTheDocument();
  });

  it("displays error state with retry button when getMe query errors", async () => {
    const refetchMock = jest.fn();
    getMeResult = {
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    };

    render(<AccountPage />);

    expect(screen.getByText("Unable to load your profile details")).toBeInTheDocument();
    const tryAgainButton = screen.getByRole("button", { name: "Try again" });
    expect(tryAgainButton).toBeInTheDocument();

    await userEvent.click(tryAgainButton);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
