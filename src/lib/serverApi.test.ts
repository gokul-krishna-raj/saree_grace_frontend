/**
 * @jest-environment node
 */
import { serverFetch, ServerFetchError, serverFetchPage } from "@/lib/serverApi";

function respond(status: number, body: unknown) {
  global.fetch = jest
    .fn()
    .mockResolvedValue(
      new Response(typeof body === "string" ? body : JSON.stringify(body), { status }),
    );
}

describe("serverFetch", () => {
  it("returns data on success", async () => {
    respond(200, { success: true, data: { product: { slug: "a" } } });
    await expect(serverFetch("/products/a")).resolves.toEqual({ product: { slug: "a" } });
  });

  it("returns null only for the backend's own record-not-found 404", async () => {
    respond(404, { success: false, error: { message: "Product not found" } });
    await expect(serverFetch("/products/missing")).resolves.toBeNull();
  });

  it.each([
    ["Lambda DB connect failure", 500, { success: false, message: "Database connection failed" }],
    ["rate limit", 429, { success: false, error: { message: "Too many requests" } }],
    ["API Gateway timeout", 504, { message: "Endpoint request timed out" }],
    ["non-JSON error page", 502, "<html>Bad Gateway</html>"],
    ["unknown API route", 404, { success: false, error: { message: "Route not found: GET /x" } }],
  ])("throws instead of returning null on %s", async (_label, status, body) => {
    respond(status, body);
    await expect(serverFetch("/products/a")).rejects.toBeInstanceOf(ServerFetchError);
  });

  it("propagates network errors", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(serverFetch("/products/a")).rejects.toThrow("fetch failed");
  });
});

describe("internal API key", () => {
  afterEach(() => {
    delete process.env.INTERNAL_API_KEY;
  });

  it("sends x-internal-api-key on server-side fetches when configured", async () => {
    process.env.INTERNAL_API_KEY = "test-internal-key";
    respond(200, { success: true, data: {} });
    await serverFetch("/products");
    const init = jest.mocked(global.fetch).mock.calls[0]![1]!;
    expect(init.headers).toEqual({ "x-internal-api-key": "test-internal-key" });
  });

  it("sends no header when unset", async () => {
    respond(200, { success: true, data: {} });
    await serverFetch("/products");
    expect(jest.mocked(global.fetch).mock.calls[0]![1]!.headers).toEqual({});
  });
});

describe("serverFetchPage", () => {
  it("returns data with the cursor", async () => {
    respond(200, { success: true, data: { products: [] }, meta: { nextCursor: "abc" } });
    await expect(serverFetchPage("/products")).resolves.toEqual({
      data: { products: [] },
      nextCursor: "abc",
    });
  });

  it("throws on a server error", async () => {
    respond(500, { success: false, error: { message: "boom" } });
    await expect(serverFetchPage("/products")).rejects.toBeInstanceOf(ServerFetchError);
  });
});
