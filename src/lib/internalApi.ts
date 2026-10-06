// Header for the storefront server's own requests to the backend, so server-side rendering
// doesn't count against the backend's per-IP rate limit (Vercel's functions share a few egress
// IPs). INTERNAL_API_KEY is deliberately not NEXT_PUBLIC_: Next never inlines other env vars
// into client bundles, so in the browser this is always empty.
export function internalApiHeaders(): Record<string, string> {
  const key = process.env.INTERNAL_API_KEY?.trim();
  return key ? { "x-internal-api-key": key } : {};
}
