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
    default: "Saree Grace — Elampillai Handloom Sarees",
    template: "%s | Saree Grace",
  },
  description:
    "Authentic Elampillai handloom sarees, handpicked for everyday elegance and special occasions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body className="bg-cream font-body text-maroon-900 flex min-h-full flex-col pb-14 lg:pb-0">
        <GoogleAnalytics />
        <WebVitals />
        <StoreProvider>
          <AuthBootstrap />
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <MobileBottomNav />
          {/* top-center, not bottom-center: the fixed mobile bottom nav (added in Section 13)
              would otherwise sit on top of bottom-anchored toasts on small screens. */}
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </StoreProvider>
      </body>
    </html>
  );
}
