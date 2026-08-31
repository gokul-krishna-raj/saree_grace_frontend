import { buildFormDataWithFile } from "@/lib/formData";
import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess, Category, CategoryTreeNode } from "@/types";

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentCategory?: string | null;
  image?: File;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentCategory?: string | null;
  isActive?: boolean;
  image?: File;
  // Clears the category's image when no replacement `image` is provided — ignored by the
  // backend if `image` is also present, since uploading a new one already replaces the old.
  removeImage?: boolean;
}

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], { tree?: false } | undefined>({
      query: (arg) => `/categories?tree=${arg?.tree === undefined ? "false" : arg.tree}`,
      transformResponse: (response: ApiSuccess<{ categories: Category[] }>) =>
        response.data.categories,
      providesTags: (result) => [
        { type: "Category", id: "LIST" },
        ...(result?.map((category) => ({ type: "Category" as const, id: category._id })) ?? []),
      ],
    }),
    getCategoryTree: builder.query<CategoryTreeNode[], void>({
      query: () => "/categories?tree=true",
      transformResponse: (response: ApiSuccess<{ categories: CategoryTreeNode[] }>) =>
        response.data.categories,
      providesTags: [{ type: "Category", id: "TREE" }],
    }),
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: ({ image, ...fields }) => ({
        url: "/categories",
        method: "POST",
        body: buildFormDataWithFile(fields, image, "image"),
      }),
      transformResponse: (response: ApiSuccess<{ category: Category }>) => response.data.category,
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "TREE" },
      ],
    }),
    updateCategory: builder.mutation<Category, UpdateCategoryRequest>({
      query: ({ id, image, ...fields }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: buildFormDataWithFile(fields, image, "image"),
      }),
      transformResponse: (response: ApiSuccess<{ category: Category }>) => response.data.category,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "TREE" },
      ],
    }),
    deleteCategory: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({ url: `/categories/${id}`, method: "DELETE" }),
      transformResponse: (response: ApiSuccess<{ message: string }>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "TREE" },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
