import Script from "next/script";

import { env } from "@/lib/env";

// Mounted once in the root layout. No real GA4 property exists yet (NOTES.md) — the script
// simply never loads while NEXT_PUBLIC_GA_MEASUREMENT_ID is unset, rather than loading against
// a fake measurement ID.
export function GoogleAnalytics() {
  if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
