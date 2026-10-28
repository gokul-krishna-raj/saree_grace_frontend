import { baseApi } from "@/store/api/baseApi";
import type { ApiSuccess } from "@/types";

export interface ShippingQuote {
  pincode: string;
  state: string;
  fee: number;
  /** "pincode" = resolved via India Post; "state" = lookup unavailable, priced by the given state. */
  source: "pincode" | "state";
}

export const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // A preview only — the backend re-quotes from the pincode when the order is created.
    getShippingQuote: builder.query<ShippingQuote, { pincode: string; state?: string }>({
      query: ({ pincode, state }) => ({
        url: "/shipping/quote",
        params: state ? { pincode, state } : { pincode },
      }),
      transformResponse: (response: ApiSuccess<{ quote: ShippingQuote }>) => response.data.quote,
    }),
  }),
});

export const { useGetShippingQuoteQuery } = shippingApi;
