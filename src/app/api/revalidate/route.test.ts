/**
 * @jest-environment node
 */
import { revalidatePath } from "next/cache";

import { POST } from "./route";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

function meResponds(status: number, role?: string) {
  global.fetch = jest.fn().mockResolvedValue(
    new Response(JSON.stringify({ success: status === 200, data: { user: { role } } }), {
      status,
    }),
  );
}

function post(body: unknown, token?: string) {
  return POST(
    new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/revalidate", () => {
  beforeEach(() => jest.mocked(revalidatePath).mockClear());

  it("rejects requests without a token", async () => {
    const res = await post({ productSlugs: ["a"] });
    expect(res.status).toBe(403);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects non-admin users", async () => {
    meResponds(200, "customer");
    const res = await post({ productSlugs: ["a"] }, "t");
    expect(res.status).toBe(403);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects invalid tokens", async () => {
    meResponds(401);
    expect((await post({ productSlugs: ["a"] }, "t")).status).toBe(403);
  });

  it("revalidates the product, its category pages, the listing and home", async () => {
    meResponds(200, "admin");
    const res = await post({ productSlugs: ["red-silk-saree", "old-slug", "../evil"] }, "t");
    expect(res.status).toBe(200);
    const calls = jest.mocked(revalidatePath).mock.calls;
    expect(calls).toEqual(
      expect.arrayContaining([
        ["/products/red-silk-saree"],
        ["/products/old-slug"],
        ["/categories/[slug]", "page"],
        ["/products"],
        ["/"],
      ]),
    );
    expect(calls).not.toContainEqual(["/products/../evil"]);
  });

  it("revalidates every product page when only an id is known", async () => {
    meResponds(200, "admin");
    await post({ allProducts: true }, "t");
    expect(revalidatePath).toHaveBeenCalledWith("/products/[slug]", "page");
  });
});
