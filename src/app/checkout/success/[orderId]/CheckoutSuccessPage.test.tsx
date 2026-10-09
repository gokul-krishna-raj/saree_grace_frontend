import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation", () => ({
  useParams: () => ({ orderId: "order-123" }),
}));

jest.mock("@/components/layout/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import type { Order } from "@/types";

const mockRefetch = jest.fn();
let queryResult: {
  data: Order | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} = {
  data: undefined,
  isLoading: true,
  isError: false,
  refetch: mockRefetch,
};

jest.mock("@/store/api/ordersApi", () => ({
  useGetOrderByIdQuery: () => queryResult,
}));

import CheckoutSuccessPage from "./page";

const mockOrder: Order = {
  _id: "order-123",
  orderNumber: "SG-1001",
  user: "user-1",
  status: "paid",
  items: [
    {
      product: "prod-1",
      variantId: null,
      nameSnapshot: "Kanchipuram Silk Saree",
      priceSnapshot: 4999,
      qty: 1,
    },
  ],
  itemsTotal: 4999,
  shippingFee: 0,
  total: 4999,
  shippingAddress: {
    fullName: "Priya Raman",
    line1: "123 Temple Road",
    line2: "Apt 4B",
    city: "Chennai",
    state: "Tamil Nadu",
    postalCode: "600001",
    country: "India",
    phone: "9876543210",
  },
  statusHistory: [
    {
      status: "paid",
      changedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  payment: {
    provider: "razorpay",
  },
  tracking: {},
  stockRestored: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("CheckoutSuccessPage", () => {
  beforeEach(() => {
    mockRefetch.mockReset();
  });

  it("displays loading skeleton when order data is loading", () => {
    queryResult = {
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    };

    render(<CheckoutSuccessPage />);

    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    expect(screen.queryByText(/order confirmed/i)).not.toBeInTheDocument();
  });

  it("displays complete order details once order data is available", () => {
    queryResult = {
      data: mockOrder,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    };

    render(<CheckoutSuccessPage />);

    expect(screen.getByText(/order confirmed!/i)).toBeInTheDocument();
    expect(screen.getByText(/order #sg-1001/i)).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText(/kanchipuram silk saree/i)).toBeInTheDocument();
    expect(screen.getByText("Priya Raman")).toBeInTheDocument();
    expect(screen.getByText(/123 temple road/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /track order/i })).toHaveAttribute(
      "href",
      "/account/orders/order-123",
    );
    expect(screen.getByRole("link", { name: /continue shopping/i })).toHaveAttribute(
      "href",
      "/products",
    );
  });

  it("displays error card with retry button when order loading fails", async () => {
    queryResult = {
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    };

    render(<CheckoutSuccessPage />);

    expect(screen.getByText(/we couldn't load your order details/i)).toBeInTheDocument();
    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();

    await userEvent.click(tryAgainButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
