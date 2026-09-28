import { type NextRequest, NextResponse } from "next/server";

// Product and category slugs are stored lowercase. Any mixed-case URL is permanently redirected
// to the lowercase one *here*, before routing — not from inside the page. Doing it in the page
// let ISR cache the redirect under the mixed-case path, and on a case-insensitive filesystem
// (e.g. macOS, where `next start` keeps its ISR cache on disk) that cache entry is the same file
// as the real page's, producing a redirect loop on the canonical URL.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lower = pathname.toLowerCase();
  if (lower === pathname) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = lower;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/products/:slug*", "/categories/:slug*"],
};
