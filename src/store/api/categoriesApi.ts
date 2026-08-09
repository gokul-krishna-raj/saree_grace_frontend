import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess, Category, CategoryTreeNode } from "@/types";

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategory?: string | null;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  parentCategory?: string | null;
  isActive?: boolean;
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
      query: (body) => ({ url: "/categories", method: "POST", body }),
      transformResponse: (response: ApiSuccess<{ category: Category }>) => response.data.category,
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "TREE" },
      ],
    }),
    updateCategory: builder.mutation<Category, UpdateCategoryRequest>({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: "PUT", body }),
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
