import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const useGetWishlistQueryMock = jest.fn();
jest.mock("@/store/api/wishlistApi", () => ({
  useGetWishlistQuery: (...args: unknown[]) => useGetWishlistQueryMock(...args),
}));

jest.mock("@/store/hooks", () => ({
  useAppSelector: () => "authenticated",
}));

import WishlistPage from "./page";

describe("WishlistPage", () => {
  it("shows a retryable error state, not 'wishlist is empty', when the wishlist fails to load", async () => {
    const refetch = jest.fn();
    useGetWishlistQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      refetch,
    });

    render(<WishlistPage />);

    expect(screen.getByText("Couldn't load your wishlist")).toBeInTheDocument();
    expect(screen.queryByText("Your wishlist is empty")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows the real empty state when the wishlist genuinely has no items", () => {
    useGetWishlistQueryMock.mockReturnValue({
      data: { productIds: [] },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    render(<WishlistPage />);

    expect(screen.getByText("Your wishlist is empty")).toBeInTheDocument();
  });
});
