import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess, Cart } from "@/types";

export interface AddCartItemRequest {
  productId: string;
  variantId?: string | null;
  qty?: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  qty: number;
}

export interface MergeCartRequest {
  items: Array<{ productId: string; variantId?: string | null; qty: number }>;
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => "/cart",
      transformResponse: (response: ApiSuccess<{ cart: Cart }>) => response.data.cart,
      providesTags: ["Cart"],
    }),
    addCartItem: builder.mutation<Cart, AddCartItemRequest>({
      query: (body) => ({ url: "/cart", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ cart: Cart }>) => response.data.cart,
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation<Cart, UpdateCartItemRequest>({
      query: ({ itemId, qty }) => ({ url: `/cart/${itemId}`, method: "PATCH", body: { qty } }),
      transformResponse: (response: ApiSuccess<{ cart: Cart }>) => response.data.cart,
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation<Cart, { itemId: string }>({
      query: ({ itemId }) => ({ url: `/cart/${itemId}`, method: "DELETE" }),
      transformResponse: (response: ApiSuccess<{ cart: Cart }>) => response.data.cart,
      invalidatesTags: ["Cart"],
    }),
    mergeCart: builder.mutation<Cart, MergeCartRequest>({
      query: (body) => ({ url: "/cart/merge", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ cart: Cart }>) => response.data.cart,
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useMergeCartMutation,
} = cartApi;
