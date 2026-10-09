"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect, useRef, useState } from "react";

import type { CheckoutLine } from "@/lib/analytics";
import { env } from "@/lib/env";
import { getOrderItemTrackingId, getTrackingItemId } from "@/lib/trackingItem";
import { useGetMeQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";
import type { Order, Product, ProductVariant, User } from "@/types";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = env.NEXT_PUBLIC_META_PIXEL_ID;
const CURRENCY = "INR";
// How long to hold the pixel's init for a returning user's silent session refresh before giving
// up and initialising without advanced matching.
const AUTH_WAIT_MS = 4000;
const MAX_PENDING_CALLS = 50;

// fbq('init') is deferred until we know whether the visitor is logged in (Meta only honours
// manual advanced matching passed to init itself), so calls made before then — e.g. the PDP's
// ViewContent on first load — are held here and replayed straight after init, in order.
let isInitialised = false;
const pendingCalls: unknown[][] = [];

function callFbq(args: unknown[]) {
  try {
    window.fbq?.(...args);
  } catch {
    // Tracking is best-effort.
  }
}

// Every helper funnels through here: a no-op during SSR, while no pixel ID is configured, and
// when an ad blocker kept the base code (and so window.fbq) from loading. Never throws, so a
// tracking call can't break the add-to-cart or checkout flow it sits in.
function track(event: string, params: Record<string, unknown>, options?: { eventID: string }) {
  if (!PIXEL_ID || typeof window === "undefined") return;
  const args = options ? ["track", event, params, options] : ["track", event, params];
  if (!isInitialised) {
    if (pendingCalls.length < MAX_PENDING_CALLS) pendingCalls.push(args);
    return;
  }
  callFbq(args);
}

export function trackViewContent(product: Product) {
  // No variant is chosen on page load: a variant product is reported as its group (the product
  // id), which Meta matches against the catalog's item_group_id.
  track("ViewContent", {
    content_ids: [getTrackingItemId(product)],
    content_name: product.name,
    content_type: product.type === "variant" ? "product_group" : "product",
    value: product.type === "variant" ? product.startingPrice : (product.price ?? 0),
    currency: CURRENCY,
  });
}

export function trackAddToCart(product: Product, variant: ProductVariant | undefined, qty: number) {
  const id = getTrackingItemId(product, variant);
  const price = (variant?.price ?? product.price ?? product.startingPrice) as number;
  track("AddToCart", {
    content_ids: [id],
    content_name: product.name,
    content_type: "product",
    contents: [{ id, quantity: qty, item_price: price }],
    value: price * qty,
    currency: CURRENCY,
  });
}

export function trackInitiateCheckout(lines: CheckoutLine[], value: number) {
  track("InitiateCheckout", {
    content_ids: lines.map((line) => getTrackingItemId(line.productId, line.variantId)),
    content_type: "product",
    num_items: lines.reduce((sum, line) => sum + line.qty, 0),
    value,
    currency: CURRENCY,
  });
}

// Only call after the payment is verified (useRazorpayCheckout.ts), and once per order — the
// caller guards that with claimPurchaseTracking(). eventID matches the Conversions API event_id
// the backend should send for the same order, so Meta deduplicates the two.
export function trackPurchase(order: Order) {
  track(
    "Purchase",
    {
      content_ids: order.items.map(getOrderItemTrackingId),
      content_type: "product",
      num_items: order.items.reduce((sum, item) => sum + item.qty, 0),
      value: order.total,
      currency: CURRENCY,
    },
    { eventID: order._id },
  );
}

interface AdvancedMatching {
  em?: string;
  ph?: string;
}

// Normalised per Meta's advanced-matching spec; the pixel SHA-256 hashes these before sending.
// Phone: digits only with country code — Indian numbers are 10 digits, optionally written with
// a leading 0 or +91. Anything else is left out rather than sent malformed.
function toAdvancedMatching(user: Pick<User, "email" | "phone">): AdvancedMatching | undefined {
  const data: AdvancedMatching = {};
  const email = user.email?.trim().toLowerCase();
  if (email?.includes("@")) data.em = email;

  const digits = (user.phone ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) data.ph = `91${digits}`;
  else if (digits.length === 12 && digits.startsWith("91")) data.ph = digits;

  return data.em || data.ph ? data : undefined;
}

function initPixel(userData: AdvancedMatching | undefined) {
  if (isInitialised || !window.fbq) return;
  isInitialised = true;
  callFbq(userData ? ["init", PIXEL_ID, userData] : ["init", PIXEL_ID]);
  callFbq(["track", "PageView"]);
  pendingCalls.splice(0).forEach(callFbq);
}

// The base code below is injected after hydration, so it may not have defined window.fbq yet
// when the auth state resolves.
function whenFbqReady(callback: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let attempts = 0;
  const check = () => {
    if (window.fbq) callback();
    else if (attempts++ < 100) timer = setTimeout(check, 50);
  };
  check();
  return () => clearTimeout(timer);
}

function PixelInit() {
  const authStatus = useAppSelector((state) => state.auth.status);
  const { data: user } = useGetMeQuery(undefined, { skip: authStatus !== "authenticated" });
  const [authWaitExpired, setAuthWaitExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAuthWaitExpired(true), AUTH_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  // A user who logs in mid-session (no page reload) keeps the pixel as initialised for the guest:
  // Meta documents advanced matching only via the base code's init, not a later re-init.
  const isAuthResolved =
    authStatus === "unauthenticated" || (authStatus === "authenticated" && !!user);
  const isReady = isAuthResolved || authWaitExpired;

  useEffect(() => {
    if (!isReady) return;
    return whenFbqReady(() => initPixel(user ? toAdvancedMatching(user) : undefined));
  }, [isReady, user]);

  return null;
}

// The init PageView covers the landing page; this only covers client-side navigations after it.
// Compares against the last-tracked URL rather than a "first render" flag so Strict Mode's
// double-invoked effect in dev doesn't send a duplicate.
function RouteChangePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams.toString()}`;
  const lastTrackedUrl = useRef(url);

  useEffect(() => {
    if (lastTrackedUrl.current === url) return;
    lastTrackedUrl.current = url;
    // Before init, the init PageView will be sent for whatever URL is current by then.
    if (isInitialised) callFbq(["track", "PageView"]);
  }, [url]);

  return null;
}

// Mounted once in the root layout, inside StoreProvider (it reads the auth state). Renders
// nothing while NEXT_PUBLIC_META_PIXEL_ID is unset, same as <GoogleAnalytics/>. The base code is
// Meta's standard snippet minus init/PageView, which <PixelInit/> sends once auth is known.
export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <PixelInit />
      <Suspense fallback={null}>
        <RouteChangePageView />
      </Suspense>
    </>
  );
}
