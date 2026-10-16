import Script from "next/script";

import { env } from "@/lib/env";

const GTM_ID = env.NEXT_PUBLIC_GTM_ID;

// Mounted once in the root layout, so the container loads on every route; client-side
// navigations don't reload it (use GTM's built-in History Change trigger for those).
//
// GA4 is NOT managed by this container: <GoogleAnalytics/> already loads gtag.js and sends
// page_view plus the ecommerce events in lib/analytics.ts. Adding a Google tag / GA4 Event tag
// for the same measurement ID inside GTM would double-count every page view and purchase. The
// container shares window.dataLayer with gtag.js and receives the same ecommerce events as
// { event, ecommerce } pushes (lib/analytics.ts) for non-GA4 tags such as Google Ads.
//
// afterInteractive (same as GA4, Meta Pixel and @next/third-parties' GoogleTagManager) rather
// than a raw <head> script, so tags added in the GTM UI can't touch the DOM before hydration.
export function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <Script id="gtm-init" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `}
    </Script>
  );
}

// Must be the first child of <body>, per Google's install instructions.
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
