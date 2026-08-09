import { buildFormData } from "@/lib/formData";
import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess, Review } from "@/types";

export interface ReviewListResult {
  reviews: Review[];
  nextCursor: string | null;
}

export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: File[];
}

export interface AdminReviewListParams {
  cursor?: string;
  limit?: number;
  approved?: boolean;
}

function toQueryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<
      ReviewListResult,
      { productId: string; cursor?: string; limit?: number }
    >({
      query: ({ productId, cursor, limit }) =>
        `/products/${productId}/reviews${toQueryString({ cursor, limit })}`,
      transformResponse: (response: ApiSuccess<{ reviews: Review[] }>) => ({
        reviews: response.data.reviews,
        nextCursor: response.meta?.nextCursor ?? null,
      }),
      providesTags: (_result, _error, { productId }) => [{ type: "Review", id: productId }],
    }),
    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: ({ images, ...fields }) => ({
        url: "/reviews",
        method: "POST",
        body: buildFormData({ ...fields }, images),
      }),
      transformResponse: (response: ApiSuccess<{ review: Review }>) => response.data.review,
      invalidatesTags: (_result, _error, { productId }) => [{ type: "Review", id: productId }],
    }),
    getAdminReviews: builder.query<ReviewListResult, AdminReviewListParams | undefined>({
      query: (params) => `/admin/reviews${toQueryString({ ...params })}`,
      transformResponse: (response: ApiSuccess<{ reviews: Review[] }>) => ({
        reviews: response.data.reviews,
        nextCursor: response.meta?.nextCursor ?? null,
      }),
      providesTags: [{ type: "Review", id: "ADMIN_LIST" }],
    }),
    approveReview: builder.mutation<Review, { id: string }>({
      query: ({ id }) => ({ url: `/admin/reviews/${id}/approve`, method: "PATCH" }),
      transformResponse: (response: ApiSuccess<{ review: Review }>) => response.data.review,
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Review", id: "ADMIN_LIST" },
              { type: "Review", id: result.product },
              { type: "Product", id: result.product },
            ]
          : [{ type: "Review", id: "ADMIN_LIST" }],
    }),
    deleteReview: builder.mutation<{ message: string }, { id: string; productId: string }>({
      query: ({ id }) => ({ url: `/admin/reviews/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiSuccess<{ message: string }>) => response.data,
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Review", id: "ADMIN_LIST" },
        { type: "Review", id: productId },
        { type: "Product", id: productId },
      ],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useGetAdminReviewsQuery,
  useApproveReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
