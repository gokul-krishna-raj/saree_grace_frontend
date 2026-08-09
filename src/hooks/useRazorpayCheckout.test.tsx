import { act, renderHook } from "@testing-library/react";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const createRazorpayOrderMock = jest.fn();
const verifyPaymentMock = jest.fn();
jest.mock("@/store/api/paymentsApi", () => ({
  useCreateRazorpayOrderMutation: () => [createRazorpayOrderMock, { isLoading: false }],
  useVerifyPaymentMutation: () => [verifyPaymentMock, { isLoading: false }],
}));

import { useRazorpayCheckout } from "./useRazorpayCheckout";

const order = {
  _id: "order1",
  orderNumber: "SG-TEST-1",
} as Parameters<ReturnType<typeof useRazorpayCheckout>["payForOrder"]>[0];

let capturedOptions: Record<string, unknown> | null = null;
const razorpayOpenMock = jest.fn();

describe("useRazorpayCheckout", () => {
  beforeEach(() => {
    pushMock.mockReset();
    createRazorpayOrderMock.mockReset();
    verifyPaymentMock.mockReset();
    razorpayOpenMock.mockReset();
    capturedOptions = null;

    createRazorpayOrderMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          razorpayOrderId: "rzp_order_1",
          amount: 189900,
          currency: "INR",
          keyId: "rzp_test_key",
          internalOrderId: "order1",
        }),
    });

    (global as unknown as { window: Window }).window.Razorpay = jest
      .fn()
      .mockImplementation((options: Record<string, unknown>) => {
        capturedOptions = options;
        return { open: razorpayOpenMock };
      }) as unknown as Window["Razorpay"];
  });

  it("creates the Razorpay order and opens the widget with the correct options", async () => {
    const { result } = renderHook(() => useRazorpayCheckout());

    await act(async () => {
      await result.current.payForOrder(order);
    });

    expect(createRazorpayOrderMock).toHaveBeenCalledWith({ orderId: "order1" });
    expect(capturedOptions).toMatchObject({
      key: "rzp_test_key",
      amount: 189900,
      currency: "INR",
      order_id: "rzp_order_1",
    });
    expect(razorpayOpenMock).toHaveBeenCalledTimes(1);
  });

  it("verifies payment and redirects to the success page when Razorpay's handler fires", async () => {
    verifyPaymentMock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    const { result } = renderHook(() => useRazorpayCheckout());

    await act(async () => {
      await result.current.payForOrder(order);
    });

    const handler = capturedOptions?.handler as (response: unknown) => void;
    await act(async () => {
      handler({
        razorpay_order_id: "rzp_order_1",
        razorpay_payment_id: "rzp_pay_1",
        razorpay_signature: "sig",
      });
      await Promise.resolve();
    });

    expect(verifyPaymentMock).toHaveBeenCalledWith({
      razorpayOrderId: "rzp_order_1",
      razorpayPaymentId: "rzp_pay_1",
      razorpaySignature: "sig",
    });
    expect(pushMock).toHaveBeenCalledWith("/checkout/success/order1");
  });

  it("redirects to the failed page (without calling verifyPayment) when Razorpay's modal is dismissed", async () => {
    const { result } = renderHook(() => useRazorpayCheckout());

    await act(async () => {
      await result.current.payForOrder(order);
    });

    const modal = capturedOptions?.modal as { ondismiss: () => void };
    act(() => {
      modal.ondismiss();
    });

    expect(verifyPaymentMock).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/checkout/failed/order1");
  });

  it("redirects to the failed page when signature verification itself fails", async () => {
    verifyPaymentMock.mockReturnValue({ unwrap: () => Promise.reject(new Error("bad signature")) });
    const { result } = renderHook(() => useRazorpayCheckout());

    await act(async () => {
      await result.current.payForOrder(order);
    });

    const handler = capturedOptions?.handler as (response: unknown) => void;
    await act(async () => {
      handler({
        razorpay_order_id: "rzp_order_1",
        razorpay_payment_id: "rzp_pay_1",
        razorpay_signature: "sig",
      });
      await Promise.resolve();
    });

    expect(pushMock).toHaveBeenCalledWith("/checkout/failed/order1");
  });
});
