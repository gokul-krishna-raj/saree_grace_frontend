import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const cartState = {
  lines: [
    {
      id: "p1:",
      productId: "p1",
      variantId: null,
      name: "Handloom Cotton Saree",
      price: 1899,
      qty: 1,
    },
  ],
  itemsTotal: 1899,
  shippingFee: 0,
  total: 1899,
  isEmpty: false,
};
jest.mock("@/hooks/useCart", () => ({ useCart: () => cartState }));

const createOrderMock = jest.fn();
jest.mock("@/store/api/ordersApi", () => ({
  useCreateOrderMutation: () => [createOrderMock, { isLoading: false }],
}));

let isProcessingMock = false;
const payForOrderMock = jest.fn();
jest.mock("@/hooks/useRazorpayCheckout", () => ({
  useRazorpayCheckout: () => ({
    payForOrder: payForOrderMock,
    isProcessing: isProcessingMock,
    stage: isProcessingMock ? "verifying" : "idle",
  }),
}));

// Stands in for the backend's pincode -> state lookup. Unknown pincodes come back as the
// backend's 400; a test sets quoteOverride to simulate the quote being unreachable.
const QUOTES: Record<string, { state: string; fee: number }> = {
  "600001": { state: "Tamil Nadu", fee: 40 },
  "560001": { state: "Karnataka", fee: 60 },
  "110001": { state: "Delhi", fee: 130 },
};
let quoteOverride: Record<string, unknown> | null = null;
jest.mock("@/store/api/shippingApi", () => ({
  useGetShippingQuoteQuery: (args: { pincode: string }, options: { skip: boolean }) => {
    if (options.skip) return { isFetching: false };
    if (quoteOverride) return quoteOverride;
    const quote = QUOTES[args.pincode];
    return quote
      ? { data: { pincode: args.pincode, ...quote, source: "pincode" }, isFetching: false }
      : {
          error: {
            status: 400,
            data: { success: false, error: { message: "This pincode was not found." } },
          },
          isFetching: false,
        };
  },
}));

import { CheckoutForm } from "./CheckoutForm";

async function fillValidAddress() {
  await userEvent.type(screen.getByLabelText("Full name"), "Priya Raman");
  await userEvent.type(screen.getByLabelText("Phone"), "9876543210");
  await userEvent.type(screen.getByLabelText("Address line 1"), "123 Test Street");
  await userEvent.type(screen.getByLabelText("City"), "Chennai");
  await userEvent.selectOptions(screen.getByLabelText("State"), "Tamil Nadu");
  await userEvent.type(screen.getByLabelText("Pincode"), "600001");
}

describe("CheckoutForm", () => {
  beforeEach(() => {
    createOrderMock.mockReset();
    payForOrderMock.mockReset();
    cartState.isEmpty = false;
    isProcessingMock = false;
    quoteOverride = null;
  });

  it("shows confirming payment state when payment is processing even if cart is empty", () => {
    cartState.isEmpty = true;
    isProcessingMock = true;
    render(<CheckoutForm />);

    expect(screen.getByText(/confirming your payment/i)).toBeInTheDocument();
    expect(screen.queryByText(/cart is empty/i)).not.toBeInTheDocument();
  });

  it("shows the empty-cart message instead of the form when the cart is empty", () => {
    cartState.isEmpty = true;
    render(<CheckoutForm />);

    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place order & pay" })).not.toBeInTheDocument();
  });

  it("does not submit an incomplete address", async () => {
    render(<CheckoutForm />);

    await userEvent.click(screen.getByRole("button", { name: "Place order & pay" }));

    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it("creates the order then hands off to payForOrder on a valid submit", async () => {
    createOrderMock.mockReturnValue({
      unwrap: () => Promise.resolve({ _id: "order1", orderNumber: "SG-1" }),
    });

    render(<CheckoutForm />);
    await fillValidAddress();
    await userEvent.click(screen.getByRole("button", { name: "Place order & pay" }));

    await waitFor(() => expect(createOrderMock).toHaveBeenCalledTimes(1));
    expect(createOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        shippingAddress: expect.objectContaining({ fullName: "Priya Raman", city: "Chennai" }),
        paymentMethod: "razorpay",
      }),
    );
    await waitFor(() =>
      expect(payForOrderMock).toHaveBeenCalledWith({ _id: "order1", orderNumber: "SG-1" }),
    );
  });

  it("disables the submit button while the order is being created, preventing a duplicate submit", async () => {
    let resolveOrder!: (value: { _id: string; orderNumber: string }) => void;
    createOrderMock.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          resolveOrder = resolve;
        }),
    });

    render(<CheckoutForm />);
    await fillValidAddress();

    const submitButton = screen.getByRole("button", { name: "Place order & pay" });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    await userEvent.click(submitButton);
    expect(createOrderMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveOrder({ _id: "order1", orderNumber: "SG-1" });
      await Promise.resolve();
    });
  });

  describe("pincode-based shipping", () => {
    it("asks for a pincode before showing shipping", () => {
      render(<CheckoutForm />);
      expect(screen.getByText("Enter your pincode")).toBeInTheDocument();
    });

    it("fills the state and shows the fee for the pincode", async () => {
      render(<CheckoutForm />);
      await userEvent.type(screen.getByLabelText("Pincode"), "560001");

      expect(screen.getByLabelText("State")).toHaveValue("Karnataka");
      expect(screen.getByText("Delivering to Karnataka")).toBeInTheDocument();
      expect(screen.getByText("₹60")).toBeInTheDocument();
    });

    it("prices by the pincode even if a different state was picked first", async () => {
      render(<CheckoutForm />);
      await userEvent.selectOptions(screen.getByLabelText("State"), "Tamil Nadu");
      await userEvent.type(screen.getByLabelText("Pincode"), "110001");

      expect(screen.getByLabelText("State")).toHaveValue("Delhi");
      expect(screen.getByText("₹130")).toBeInTheDocument();
    });

    it("shows an error and no fee for an unknown pincode", async () => {
      render(<CheckoutForm />);
      await userEvent.type(screen.getByLabelText("Pincode"), "999999");

      expect(screen.getByText("This pincode was not found.")).toBeInTheDocument();
      expect(screen.getByText("Check your pincode")).toBeInTheDocument();
    });

    it("falls back to the selected state when the quote can't be fetched", async () => {
      quoteOverride = { error: { status: "FETCH_ERROR", error: "offline" }, isFetching: false };
      render(<CheckoutForm />);
      await userEvent.selectOptions(screen.getByLabelText("State"), "Kerala");
      await userEvent.type(screen.getByLabelText("Pincode"), "682001");

      expect(screen.getByText("₹60")).toBeInTheDocument();
    });
  });
});
