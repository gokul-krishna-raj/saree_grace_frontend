import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { WebVitals } from "@/components/analytics/WebVitals";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getCategories } from "@/lib/catalog";
import { env } from "@/lib/env";
import { StoreProvider } from "@/store/StoreProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  // Headings only use regular/medium/semibold and the occasional italic accent.
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  // latin-ext carries the ₹ sign (U+20B9), shown on almost every page. Without it in the
  // preloaded subsets the browser only discovers that font file after rendering a price, and
  // re-paints the text when it arrives (measured: it arrived last, at "VeryHigh" priority).
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Saree Grace — Authentic Elampillai Sarees",
    template: "%s | Saree Grace",
  },
  description:
    "Authentic Elampillai sarees, soft silks, handloom cottons, and bridal collections direct from Salem master weavers.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: "Saree Grace",
    title: "Saree Grace — Authentic Elampillai Sarees",
    description:
      "Authentic Elampillai sarees, soft silks, handloom cottons, and bridal collections direct from Salem master weavers.",
    images: [
      {
        url: "/saree_grace_logo.png",
        width: 1200,
        height: 630,
        alt: "Saree Grace — Authentic Elampillai Sarees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saree Grace — Authentic Elampillai Sarees",
    description:
      "Authentic Elampillai sarees, soft silks, handloom cottons, and bridal collections direct from Salem master weavers.",
    images: ["/saree_grace_logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/saree_grace_favicon.png",
  },
  verification: {
    ...(env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION
      ? { other: { "facebook-domain-verification": env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION } }
      : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categories = await getCategories();

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body
        className="bg-background font-body text-foreground flex min-h-full flex-col"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground sr-only z-[60] rounded-md px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <GoogleAnalytics />
        <WebVitals />
        <StoreProvider>
          <AuthBootstrap />
          <MetaPixel />
          <AnnouncementBar />
          <Header categories={categories} />
          <div id="main-content" className="flex flex-1 flex-col" tabIndex={-1}>
            {children}
          </div>
          <Footer categories={categories} />
          <CartDrawer />
          <WhatsAppButton />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: "6px",
                background: "#2b1418",
                color: "#faf7f2",
                fontSize: "14px",
                padding: "10px 14px",
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
