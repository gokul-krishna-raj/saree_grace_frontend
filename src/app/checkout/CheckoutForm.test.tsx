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

const payForOrderMock = jest.fn();
jest.mock("@/hooks/useRazorpayCheckout", () => ({
  useRazorpayCheckout: () => ({ payForOrder: payForOrderMock, isProcessing: false }),
}));

import { CheckoutForm } from "./CheckoutForm";

async function fillValidAddress() {
  await userEvent.type(screen.getByLabelText("Full name"), "Priya Raman");
  await userEvent.type(screen.getByLabelText("Phone"), "9876543210");
  await userEvent.type(screen.getByLabelText("Address line 1"), "123 Test Street");
  await userEvent.type(screen.getByLabelText("City"), "Chennai");
  await userEvent.selectOptions(screen.getByLabelText("State"), "Tamil Nadu");
  await userEvent.type(screen.getByLabelText("Postal code"), "600001");
}

describe("CheckoutForm", () => {
  beforeEach(() => {
    createOrderMock.mockReset();
    payForOrderMock.mockReset();
    cartState.isEmpty = false;
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
    expect(createOrderMock).toHaveBeenCalledWith({
      shippingAddress: expect.objectContaining({ fullName: "Priya Raman", city: "Chennai" }),
    });
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
});
