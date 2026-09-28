import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { FooterAccordionSection } from "@/components/layout/FooterAccordionSection";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/components/layout/SocialIcons";
import { env } from "@/lib/env";
import type { Category } from "@/types";

const PAYMENT_METHODS = ["UPI", "Visa", "Mastercard", "RuPay", "Net Banking"];
const MAX_CATEGORY_LINKS = 8;

const linkClass = "text-sm text-white/70 transition-colors hover:text-white";

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

export function Footer({ categories = [] }: { categories?: Category[] }) {
  const whatsappNumber = env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const topLevel = categories.filter((category) => category.parentCategory === null);

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
    <footer className="bg-maroon-950 text-white">
      <div className="container-page grid gap-x-10 pt-14 pb-6 md:grid-cols-12 md:gap-y-12 lg:pt-20">
        <div className="pb-8 md:col-span-12 lg:col-span-3 lg:pb-0">
          <Link href="/" className="font-display text-3xl leading-none">
            Saree Grace
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            Authentic Elampillai sarees, sourced directly from weaver families in Salem, Tamil Nadu
            — from everyday cottons to festive silks, delivered across India.
          </p>
          {socialLinks.length > 0 ? (
            <ul className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/50 hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="md:col-span-4 lg:col-span-2">
          <FooterAccordionSection title="Shop">
            <Link href="/products" className={linkClass}>
              All Sarees
            </Link>
            {topLevel.slice(0, MAX_CATEGORY_LINKS).map((category) => (
              <Link key={category._id} href={`/categories/${category.slug}`} className={linkClass}>
                {category.name}
              </Link>
            ))}
            <Link href="/categories" className={linkClass}>
              All Categories
            </Link>
          </FooterAccordionSection>
        </div>

        <div className="md:col-span-4 lg:col-span-2">
          <FooterAccordionSection title="Help">
            <Link href="/account/orders" className={linkClass}>
              Track Your Order
            </Link>
            <Link href="/shipping-policy" className={linkClass}>
              Shipping Policy
            </Link>
            <Link href="/refund-policy" className={linkClass}>
              Returns &amp; Refunds
            </Link>
            <Link href="/faq" className={linkClass}>
              FAQ
            </Link>
            <Link href="/contact" className={linkClass}>
              Contact Us
            </Link>
          </FooterAccordionSection>
        </div>

        <div className="md:col-span-4 lg:col-span-2">
          <FooterAccordionSection title="Saree Grace">
            <Link href="/about" className={linkClass}>
              Our Story
            </Link>
            <Link href="/privacy-policy" className={linkClass}>
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className={linkClass}>
              Terms &amp; Conditions
            </Link>
          </FooterAccordionSection>
        </div>

        <address className="flex flex-col gap-3 pt-8 not-italic md:col-span-12 md:pt-0 lg:col-span-3">
          <h2 className="mb-1 text-sm font-medium tracking-wide">Get in touch</h2>
          <p className="flex items-start gap-2.5 text-sm text-white/70">
            <MapPin className="text-gold-300 mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Elampillai, Salem, Tamil Nadu
          </p>
          {whatsappNumber ? (
            <a href={`tel:+${whatsappNumber}`} className={`${linkClass} flex items-center gap-2.5`}>
              <Phone className="text-gold-300 h-4 w-4 shrink-0" aria-hidden="true" />
              {formatPhoneForDisplay(whatsappNumber)}
            </a>
          ) : null}
          <a
            href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`}
            className={`${linkClass} flex items-center gap-2.5 break-words`}
          >
            <Mail className="text-gold-300 h-4 w-4 shrink-0" aria-hidden="true" />
            {env.NEXT_PUBLIC_CONTACT_EMAIL}
          </a>
        </address>
      </div>

      <div className="container-page">
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Saree Grace. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1">Secure payments via Razorpay</span>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-sm border border-white/15 px-2 py-0.5 text-[11px] text-white/70"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
