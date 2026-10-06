import { revalidatePath } from "next/cache";

import { env } from "@/lib/env";

// Called by the admin panel after a product is created, edited or deleted, so the ISR-cached
// storefront pages regenerate on their next visit instead of waiting out `revalidate`.
//
// Authorised with the admin's own access token (verified by the backend's /auth/me), so no
// extra shared secret is needed in the browser.

const SLUG = /^[a-z0-9-]{1,200}$/;
const MAX_SLUGS = 20;

interface RevalidateBody {
  // Product pages to refresh (e.g. the new slug and, after a rename, the old one).
  productSlugs?: unknown;
  // When the slug isn't known (e.g. after a delete), refresh every product page.
  allProducts?: unknown;
}

async function isAdmin(authorization: string | null): Promise<boolean> {
  if (!authorization?.startsWith("Bearer ")) return false;
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      headers: { authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { data?: { user?: { role?: string } } };
    return body.data?.user?.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin(request.headers.get("authorization")))) {
    return Response.json({ success: false, error: { message: "Forbidden" } }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as RevalidateBody;
  const slugs = Array.isArray(body.productSlugs)
    ? body.productSlugs.filter((s): s is string => typeof s === "string" && SLUG.test(s))
    : [];
  if (slugs.length > MAX_SLUGS) {
    return Response.json(
      { success: false, error: { message: `At most ${MAX_SLUGS} slugs` } },
      { status: 400 },
    );
  }

  const paths: string[] = ["/", "/products", "/categories", "/sitemap.xml"];
  if (body.allProducts === true) {
    revalidatePath("/products/[slug]", "page");
    paths.push("/products/[slug]");
  } else {
    for (const slug of slugs) {
      revalidatePath(`/products/${slug}`);
      paths.push(`/products/${slug}`);
    }
  }
  // The product's category page (and any category it moved from). Categories are few, and this
  // only marks them stale — each regenerates on its next visit.
  revalidatePath("/categories/[slug]", "page");
  paths.push("/categories/[slug]");
  for (const path of ["/", "/products", "/categories", "/sitemap.xml"]) revalidatePath(path);

  return Response.json({ success: true, data: { revalidated: paths } });
}
