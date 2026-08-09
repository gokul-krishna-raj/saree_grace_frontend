import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const useCartMock = jest.fn();
jest.mock("@/hooks/useCart", () => ({
  useCart: () => useCartMock(),
}));

const authStatusMock = jest.fn(() => "authenticated");
jest.mock("@/store/hooks", () => ({
  useAppSelector: () => authStatusMock(),
}));

import CartPage from "./page";

describe("CartPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    authStatusMock.mockReturnValue("authenticated");
  });

  it("shows a retryable error state, not 'cart is empty', when the server cart fails to load", async () => {
    const refetch = jest.fn();
    useCartMock.mockReturnValue({
      lines: [],
      itemsTotal: 0,
      shippingFee: 0,
      total: 0,
      isEmpty: false,
      isLoading: false,
      isError: true,
      isFetching: false,
      refetch,
      updateQty: jest.fn(),
      removeItem: jest.fn(),
    });

    render(<CartPage />);

    expect(screen.getByText("Couldn't load your cart")).toBeInTheDocument();
    expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("only redirects to /login when auth status is confirmed unauthenticated, not while still checking", async () => {
    authStatusMock.mockReturnValue("checking");
    useCartMock.mockReturnValue({
      lines: [{ id: "l1", productId: "p1", variantId: null, name: "Saree", price: 100, qty: 1 }],
      itemsTotal: 100,
      shippingFee: 99,
      total: 199,
      isEmpty: false,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
      updateQty: jest.fn(),
      removeItem: jest.fn(),
    });

    render(<CartPage />);
    await userEvent.click(screen.getByRole("button", { name: "Proceed to checkout" }));

    expect(pushMock).toHaveBeenCalledWith("/checkout");
  });
});
