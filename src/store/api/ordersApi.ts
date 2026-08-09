import { baseApi } from "@/store/api/baseApi";
import type { Address, ApiSuccess, Order, OrderStatus, OrderStatusHistoryEntry } from "@/types";

export interface OrderListResult {
  orders: Order[];
  nextCursor: string | null;
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export interface UpdateOrderStatusRequest {
  id: string;
  status: OrderStatus;
  note?: string;
  carrier?: string;
  trackingId?: string;
  trackingUrl?: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, { shippingAddress: Address }>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ order: Order }>) => response.data.order,
      invalidatesTags: ["Cart", { type: "Order", id: "LIST" }],
    }),
    getMyOrders: builder.query<
      OrderListResult,
      { cursor?: string; limit?: number; status?: OrderStatus } | undefined
    >({
      query: (params) => `/orders/my${toQueryString({ ...params })}`,
      transformResponse: (response: ApiSuccess<{ orders: Order[] }>) => ({
        orders: response.data.orders,
        nextCursor: response.meta?.nextCursor ?? null,
      }),
      providesTags: (result) => [
        { type: "Order", id: "LIST" },
        ...(result?.orders.map((o) => ({ type: "Order" as const, id: o._id })) ?? []),
      ],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: ApiSuccess<{ order: Order }>) => response.data.order,
      providesTags: (result) => (result ? [{ type: "Order", id: result._id }] : []),
    }),
    getOrderTracking: builder.query<
      {
        status: OrderStatus;
        tracking: Order["tracking"];
        statusHistory: OrderStatusHistoryEntry[];
      },
      string
    >({
      query: (id) => `/orders/${id}/tracking`,
      transformResponse: (
        response: ApiSuccess<{
          status: OrderStatus;
          tracking: Order["tracking"];
          statusHistory: OrderStatusHistoryEntry[];
        }>,
      ) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),
    cancelOrder: builder.mutation<Order, { id: string }>({
      query: ({ id }) => ({ url: `/orders/${id}/cancel`, method: "POST" }),
      transformResponse: (response: ApiSuccess<{ order: Order }>) => response.data.order,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),
    getAdminOrders: builder.query<
      OrderListResult,
      { cursor?: string; limit?: number; status?: OrderStatus } | undefined
    >({
      query: (params) => `/admin/orders${toQueryString({ ...params })}`,
      transformResponse: (response: ApiSuccess<{ orders: Order[] }>) => ({
        orders: response.data.orders,
        nextCursor: response.meta?.nextCursor ?? null,
      }),
      providesTags: (result) => [
        { type: "Order", id: "LIST" },
        ...(result?.orders.map((o) => ({ type: "Order" as const, id: o._id })) ?? []),
      ],
    }),
    getAdminOrderById: builder.query<Order, string>({
      query: (id) => `/admin/orders/${id}`,
      transformResponse: (response: ApiSuccess<{ order: Order }>) => response.data.order,
      providesTags: (result) => (result ? [{ type: "Order", id: result._id }] : []),
    }),
    updateOrderStatus: builder.mutation<Order, UpdateOrderStatusRequest>({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}/status`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<{ order: Order }>) => response.data.order,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
        { type: "Product", id: "LIST" },
        "Dashboard",
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderTrackingQuery,
  useCancelOrderMutation,
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
