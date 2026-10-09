"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";

import { env } from "@/lib/env";

type FbqParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = env.NEXT_PUBLIC_META_PIXEL_ID;
const CURRENCY = "INR";

// Every helper funnels through here: a no-op during SSR, while no pixel ID is configured, and
// when an ad blocker kept fbevents.js (and so window.fbq) from ever loading. Never throws, so a
// tracking call can't break the add-to-cart or checkout flow it sits in.
function track(event: string, params: FbqParams, options?: { eventID: string }) {
  if (!PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  try {
    if (options) window.fbq("track", event, params, options);
    else window.fbq("track", event, params);
  } catch {
    // Tracking is best-effort.
  }
}

export interface MetaViewContentParams {
  contentId: string;
  contentName: string;
  value: number;
}

export function trackViewContent({ contentId, contentName, value }: MetaViewContentParams) {
  track("ViewContent", {
    content_ids: [contentId],
    content_name: contentName,
    content_type: "product",
    value,
    currency: CURRENCY,
  });
}

export interface MetaAddToCartParams {
  contentId: string;
  contentName: string;
  price: number;
  quantity: number;
}

export function trackAddToCart({ contentId, contentName, price, quantity }: MetaAddToCartParams) {
  track("AddToCart", {
    content_ids: [contentId],
    content_name: contentName,
    content_type: "product",
    contents: [{ id: contentId, quantity, item_price: price }],
    value: price * quantity,
    currency: CURRENCY,
  });
}

export interface MetaCheckoutParams {
  contentIds: string[];
  numItems: number;
  value: number;
}

export function trackInitiateCheckout({ contentIds, numItems, value }: MetaCheckoutParams) {
  track("InitiateCheckout", {
    content_ids: contentIds,
    content_type: "product",
    num_items: numItems,
    value,
    currency: CURRENCY,
  });
}

export interface MetaPurchaseParams extends MetaCheckoutParams {
  orderId: string;
}

const TRACKED_PURCHASES_KEY = "sg_meta_tracked_purchases";

// Purchase is sent from the payment-verified handler, not from the success page, so refreshing
// /checkout/success/[orderId] can't re-send it. This guard additionally covers a second verify
// round-trip for the same order (e.g. a retry from the failed page after a late success).
// localStorage rather than sessionStorage so it also holds across tabs.
function alreadyTrackedPurchase(orderId: string): boolean {
  try {
    const tracked: string[] = JSON.parse(localStorage.getItem(TRACKED_PURCHASES_KEY) ?? "[]");
    if (tracked.includes(orderId)) return true;
    localStorage.setItem(TRACKED_PURCHASES_KEY, JSON.stringify([...tracked, orderId].slice(-50)));
    return false;
  } catch {
    return false;
  }
}

export function trackPurchase({ orderId, contentIds, numItems, value }: MetaPurchaseParams) {
  if (!PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  if (alreadyTrackedPurchase(orderId)) return;

  // eventID matches the Conversions API event_id the backend should send for the same order, so
  // Meta deduplicates the browser and server events.
  track(
    "Purchase",
    {
      content_ids: contentIds,
      content_type: "product",
      num_items: numItems,
      value,
      currency: CURRENCY,
    },
    { eventID: orderId },
  );
}

// The base code already sends the landing page's PageView; this only covers client-side
// navigations after it. Compares against the last-tracked URL rather than a "first render" flag
// so Strict Mode's double-invoked effect in dev doesn't send a duplicate.
function RouteChangePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams.toString()}`;
  const lastTrackedUrl = useRef(url);

  useEffect(() => {
    if (lastTrackedUrl.current === url) return;
    lastTrackedUrl.current = url;
    window.fbq?.("track", "PageView");
  }, [url]);

  return null;
}

// Mounted once in the root layout. Renders nothing while NEXT_PUBLIC_META_PIXEL_ID is unset,
// same as <GoogleAnalytics/>.
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
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
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
      <Suspense fallback={null}>
        <RouteChangePageView />
      </Suspense>
    </>
  );
}
