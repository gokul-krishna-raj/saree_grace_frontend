import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess, Wishlist } from "@/types";

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<Wishlist, void>({
      query: () => "/wishlist",
      transformResponse: (response: ApiSuccess<{ wishlist: Wishlist }>) => response.data.wishlist,
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation<Wishlist, { productId: string }>({
      query: ({ productId }) => ({ url: `/wishlist/${productId}`, method: "POST" }),
      transformResponse: (response: ApiSuccess<{ wishlist: Wishlist }>) => response.data.wishlist,
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation<Wishlist, { productId: string }>({
      query: ({ productId }) => ({ url: `/wishlist/${productId}`, method: "DELETE" }),
      transformResponse: (response: ApiSuccess<{ wishlist: Wishlist }>) => response.data.wishlist,
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } =
  wishlistApi;
