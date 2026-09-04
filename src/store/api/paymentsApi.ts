import { baseApi } from "@/store/api/baseApi";
import { ordersApi } from "@/store/api/ordersApi";
import type { ApiSuccess, Order } from "@/types";

export interface CreateRazorpayOrderResult {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  internalOrderId: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<CreateRazorpayOrderResult, { orderId: string }>({
      query: (body) => ({ url: "/payments/create-order", method: "POST", body }),
      transformResponse: (response: ApiSuccess<CreateRazorpayOrderResult>) => response.data,
      invalidatesTags: (_result, _error, { orderId }) => [{ type: "Order", id: orderId }],
    }),
    verifyPayment: builder.mutation<Order, VerifyPaymentRequest>({
      query: (body) => ({ url: "/payments/verify", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ order: Order }>) => response.data.order,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data: order } = await queryFulfilled;
          await dispatch(ordersApi.util.upsertQueryData("getOrderById", order._id, order));
        } catch {
          // Verification failure is handled in the checkout caller
        }
      },
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Order", id: result._id },
              { type: "Order", id: "LIST" },
            ]
          : ["Order"],
    }),
    refundPayment: builder.mutation<Order, { orderId: string; amount?: number; reason?: string }>({
      query: ({ orderId, ...body }) => ({
        url: `/payments/${orderId}/refund`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccess<{ order: Order }>) => response.data.order,
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Order", id: orderId },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
  useRefundPaymentMutation,
} = paymentsApi;
