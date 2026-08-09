import { baseApi } from "@/store/api/baseApi";
import type { AdminDashboardStats, ApiSuccess } from "@/types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<AdminDashboardStats, void>({
      query: () => "/admin/dashboard",
      transformResponse: (response: ApiSuccess<AdminDashboardStats>) => response.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
