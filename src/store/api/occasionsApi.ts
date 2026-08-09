import { buildFormDataWithFile } from "@/lib/formData";
import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess, Occasion } from "@/types";

export interface CreateOccasionRequest {
  name: string;
  description?: string;
  image?: File;
}

export interface UpdateOccasionRequest {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  image?: File;
  // Clears the occasion's image when no replacement `image` is provided — mirrors
  // UpdateCategoryRequest's `removeImage` in categoriesApi.ts.
  removeImage?: boolean;
}

export const occasionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOccasions: builder.query<Occasion[], void>({
      query: () => "/occasions",
      transformResponse: (response: ApiSuccess<{ occasions: Occasion[] }>) =>
        response.data.occasions,
      providesTags: (result) => [
        { type: "Occasion", id: "LIST" },
        ...(result?.map((occasion) => ({ type: "Occasion" as const, id: occasion._id })) ?? []),
      ],
    }),
    createOccasion: builder.mutation<Occasion, CreateOccasionRequest>({
      query: ({ image, ...fields }) => ({
        url: "/occasions",
        method: "POST",
        body: buildFormDataWithFile(fields, image, "image"),
      }),
      transformResponse: (response: ApiSuccess<{ occasion: Occasion }>) => response.data.occasion,
      invalidatesTags: [{ type: "Occasion", id: "LIST" }],
    }),
    updateOccasion: builder.mutation<Occasion, UpdateOccasionRequest>({
      query: ({ id, image, ...fields }) => ({
        url: `/occasions/${id}`,
        method: "PUT",
        body: buildFormDataWithFile(fields, image, "image"),
      }),
      transformResponse: (response: ApiSuccess<{ occasion: Occasion }>) => response.data.occasion,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Occasion", id },
        { type: "Occasion", id: "LIST" },
      ],
    }),
    // The backend blocks deleting an occasion still referenced by products (409) rather than
    // cascading — the caller surfaces that exact message via getApiErrorMessage, same as
    // deleteCategory in categoriesApi.ts.
    deleteOccasion: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({ url: `/occasions/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiSuccess<{ message: string }>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Occasion", id },
        { type: "Occasion", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOccasionsQuery,
  useCreateOccasionMutation,
  useUpdateOccasionMutation,
  useDeleteOccasionMutation,
} = occasionsApi;
