/**
 * @jest-environment node
 *
 * Runs under Node (not jsdom) for the same reason as baseApi.test.ts: RTK Query's
 * `fetchBaseQuery` needs a real global `fetch`/`Request`, which jsdom doesn't implement.
 */
import { getApiErrorMessage } from "@/lib/apiError";
import { makeStore } from "@/store";

import { productImportApi } from "./productImportApi";

function requestOf(input: RequestInfo | URL, init?: RequestInit) {
  const url = input instanceof Request ? input.url : String(input);
  const method = input instanceof Request ? input.method : (init?.method ?? "GET");
  return { url, method };
}

describe("productImportApi", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the export as text with the server's filename", async () => {
    global.fetch = jest.fn(async () => {
      return new Response("﻿handle,name\r\nsilk,Silk\r\n", {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="sareegrace-products-2026-10-10.csv"',
        },
      });
    }) as unknown as typeof fetch;

    const store = makeStore();
    const result = await store.dispatch(productImportApi.endpoints.exportProductsCsv.initiate());

    expect("data" in result && result.data).toEqual({
      csv: "handle,name\r\nsilk,Silk\r\n",
      filename: "sareegrace-products-2026-10-10.csv",
    });
  });

  it("parses a failed download's JSON body so the backend message reaches the user", async () => {
    global.fetch = jest.fn(async () => {
      return new Response(
        JSON.stringify({ success: false, error: { message: "Admin access required" } }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const store = makeStore();
    const result = await store.dispatch(
      productImportApi.endpoints.getProductImportTemplate.initiate(),
    );

    expect("error" in result).toBe(true);
    expect(getApiErrorMessage("error" in result ? result.error : undefined)).toBe(
      "Admin access required",
    );
  });

  it("posts the CSV and keys on commit and unwraps the results", async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const { url, method } = requestOf(input, init);
      const body = input instanceof Request ? await input.json() : null;
      calls.push({ url, method, body });
      return new Response(
        JSON.stringify({
          success: true,
          data: { results: [{ key: "handle:silk", status: "updated", slug: "silk" }] },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const store = makeStore();
    const result = await store.dispatch(
      productImportApi.endpoints.commitProductImport.initiate({
        csv: "handle\nsilk\n",
        keys: ["handle:silk"],
      }),
    );

    expect(calls).toEqual([
      {
        url: expect.stringMatching(/\/admin\/products\/import\/commit$/),
        method: "POST",
        body: { csv: "handle\nsilk\n", keys: ["handle:silk"] },
      },
    ]);
    expect("data" in result && result.data).toEqual({
      results: [{ key: "handle:silk", status: "updated", slug: "silk" }],
    });
  });
});
