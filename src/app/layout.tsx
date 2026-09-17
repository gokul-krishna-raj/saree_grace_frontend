import "./globals.css";

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { WebVitals } from "@/components/analytics/WebVitals";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { WebSiteJsonLd } from "@/components/seo/WebSiteJsonLd";
import { env } from "@/lib/env";
import { StoreProvider } from "@/store/StoreProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
  alternates: {
    canonical: "./",
  },
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body
        className="bg-background font-body text-foreground flex min-h-full flex-col pb-14 lg:pb-0"
        suppressHydrationWarning
      >
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <GoogleAnalytics />
        <WebVitals />
        <StoreProvider>
          <AuthBootstrap />
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <MobileBottomNav />
          <WhatsAppButton />
          {/* top-center, not bottom-center: the fixed mobile bottom nav (added in Section 13)
              would otherwise sit on top of bottom-anchored toasts on small screens. */}
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </StoreProvider>
      </body>
    </html>
  );
}
