import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { FooterAccordionSection } from "@/components/layout/FooterAccordionSection";
import { FooterCategoriesList } from "@/components/layout/FooterCategoriesList";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/layout/SocialIcons";
import { env } from "@/lib/env";
import { serverFetch } from "@/lib/serverApi";
import type { Category } from "@/types";

const PAYMENT_METHODS = ["UPI", "Visa", "Mastercard", "RuPay", "Net Banking"];

const linkClass = "text-maroon-700 hover:text-maroon-900 text-sm transition-colors";

// The WhatsApp number is stored as `<countrycode><10 digits>` (e.g. "919500750704") — this is
// purely a display formatter, the raw value is what's used in tel:/wa.me hrefs.
function formatPhoneForDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return `+${digits}`;
}

export async function Footer() {
  const whatsappNumber = env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const categoriesData = await serverFetch<{ categories: Category[] }>("/categories");
  const initialCategories = categoriesData?.categories ?? [];

  const socialLinks = [
    { href: env.NEXT_PUBLIC_INSTAGRAM_URL, label: "Instagram", Icon: InstagramIcon },
    { href: env.NEXT_PUBLIC_FACEBOOK_URL, label: "Facebook", Icon: FacebookIcon },
    { href: env.NEXT_PUBLIC_YOUTUBE_URL, label: "YouTube", Icon: YoutubeIcon },
    ...(whatsappNumber
      ? [{ href: `https://wa.me/${whatsappNumber}`, label: "WhatsApp", Icon: WhatsAppIcon }]
      : []),
  ].filter((link): link is { href: string; label: string; Icon: typeof InstagramIcon } =>
    Boolean(link.href),
  );

  return (
    <footer className="border-maroon-50 border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-x-8 px-4 py-10 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-5">
        <div className="border-maroon-50 border-b pb-4 sm:col-span-2 sm:border-none sm:pb-0 lg:col-span-1">
          <p className="font-heading text-maroon-900 text-lg">Saree Grace</p>
          <p className="text-maroon-600 mt-2 text-sm leading-relaxed">
            Saree Grace brings authentic Elampillai sarees straight from weaver families in Salem,
            Tamil Nadu, to your doorstep. From everyday cotton weaves to festive silk, we keep
            online saree shopping simple, honest, and rooted in real craftsmanship.
          </p>
          <nav aria-label="About Saree Grace" className="mt-4 flex flex-col gap-2">
            <Link href="/about" className={linkClass}>
              Our Story
            </Link>
            <Link href="/contact" className={linkClass}>
              Contact Us
            </Link>
          </nav>
        </div>

        <FooterAccordionSection title="Shop">
          <Link href="/products" className={linkClass}>
            All Sarees
          </Link>
          <Link href="/products?sort=newest" className={linkClass}>
            New Arrivals
          </Link>
          <Link href="/products?sort=top_rated" className={linkClass}>
            Best Sellers
          </Link>
          <Link href="/products?handloomOnly=true" className={linkClass}>
            Elampillai Handloom Collection
          </Link>
          <Link href="/account/orders" className={linkClass}>
            Track Order
          </Link>
        </FooterAccordionSection>

        <FooterAccordionSection title="Categories">
          <FooterCategoriesList initialCategories={initialCategories} />
        </FooterAccordionSection>

        <FooterAccordionSection title="Customer Information">
          <Link href="/shipping-policy" className={linkClass}>
            Shipping Policy
          </Link>
          <Link href="/refund-policy" className={linkClass}>
            Return &amp; Refund Policy
          </Link>
          <Link href="/privacy-policy" className={linkClass}>
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className={linkClass}>
            Terms &amp; Conditions
          </Link>
          <Link href="/faq" className={linkClass}>
            FAQ
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact Us
          </Link>
        </FooterAccordionSection>

        <div className="border-maroon-50 flex flex-col gap-3 border-t pt-4 sm:col-span-2 sm:border-none sm:pt-0 lg:col-span-1">
          <p className="text-maroon-900 text-sm font-medium">Get in Touch</p>
          <p className="text-maroon-700 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Saree Grace, Elampillai, Salem, Tamil Nadu</span>
          </p>
          {whatsappNumber ? (
            <a
              href={`tel:+${whatsappNumber}`}
              className="text-maroon-700 hover:text-maroon-900 flex items-center gap-2 text-sm transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              {formatPhoneForDisplay(whatsappNumber)}
            </a>
          ) : null}
          <a
            href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`}
            className="text-maroon-700 hover:text-maroon-900 flex items-center gap-2 text-sm transition-colors"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            {env.NEXT_PUBLIC_CONTACT_EMAIL}
          </a>

          {socialLinks.length > 0 ? (
            <div className="mt-1 flex items-center gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-maroon-700 hover:text-maroon-900 transition-colors"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-maroon-50 border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-maroon-900 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            We Accept
          </div>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="border-maroon-100 text-maroon-700 rounded-md border px-2.5 py-1 text-xs font-medium"
              >
                {method}
              </span>
            ))}
          </div>
          <p className="text-maroon-400 text-xs">Secure checkout powered by Razorpay</p>
        </div>
      </div>

      <div className="border-maroon-50 border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-maroon-400 text-xs">
            © {new Date().getFullYear()} Saree Grace. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex gap-4 text-xs">
            <Link href="/privacy-policy" className="text-maroon-500 hover:text-maroon-700">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-maroon-500 hover:text-maroon-700">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>
        <p className="text-maroon-400 pb-4 text-center text-xs">
          Online saree shopping from Elampillai, Salem, Tamil Nadu.
        </p>
      </div>
    </footer>
  );
}
