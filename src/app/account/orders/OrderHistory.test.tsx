import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/components/account/AccountNav", () => ({ AccountNav: () => null }));
jest.mock("@/components/layout/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

const page1 = {
  orders: [
    {
      _id: "o1",
      orderNumber: "SG-1",
      status: "delivered",
      total: 1899,
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      _id: "o2",
      orderNumber: "SG-2",
      status: "paid",
      total: 999,
      createdAt: "2026-01-02T00:00:00Z",
    },
  ],
  nextCursor: "cursor-1",
};
// Deliberately overlaps on "o2" — the same defensive dedupe as the product grid's infinite
// scroll, in case a cursor boundary is re-fetched.
const page2 = {
  orders: [
    {
      _id: "o2",
      orderNumber: "SG-2",
      status: "paid",
      total: 999,
      createdAt: "2026-01-02T00:00:00Z",
    },
    {
      _id: "o3",
      orderNumber: "SG-3",
      status: "pending",
      total: 4999,
      createdAt: "2026-01-03T00:00:00Z",
    },
  ],
  nextCursor: null,
};

const useGetMyOrdersQueryMock = jest.fn(
  (arg: {
    cursor?: string;
  }): {
    data: typeof page1 | typeof page2 | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  } => ({
    data: arg.cursor === "cursor-1" ? page2 : page1,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: jest.fn(),
  }),
);

jest.mock("@/store/api/ordersApi", () => ({
  useGetMyOrdersQuery: (arg: { cursor?: string }) => useGetMyOrdersQueryMock(arg),
}));

import OrderHistoryPage from "./page";

describe("OrderHistoryPage pagination", () => {
  it("shows the first page and loads the next page on 'Load more' without duplicating the overlapping order", async () => {
    render(<OrderHistoryPage />);

    expect(screen.getByText("#SG-1")).toBeInTheDocument();
    expect(screen.getByText("#SG-2")).toBeInTheDocument();
    expect(screen.queryByText("#SG-3")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Load more" }));

    expect(screen.getByText("#SG-1")).toBeInTheDocument();
    expect(screen.getAllByText("#SG-2")).toHaveLength(1);
    expect(screen.getByText("#SG-3")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  it("shows a retryable error state, not 'no orders yet', when the first page fails to load", () => {
    useGetMyOrdersQueryMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: jest.fn(),
    });

    render(<OrderHistoryPage />);

    expect(screen.getByText("Couldn't load your orders")).toBeInTheDocument();
    expect(screen.queryByText("You haven't placed any orders yet.")).not.toBeInTheDocument();
  });
});
