import type { Metadata } from "next";

import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Return eligibility, exchange, and refund timelines for Saree Grace orders.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="font-heading text-maroon-900 text-3xl">Return &amp; Refund Policy</h1>

      <p className="text-maroon-700 leading-relaxed">
        We want you to be happy with your saree. If something isn&apos;t right, here&apos;s how
        returns and refunds work.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Return eligibility</h2>
      <p className="text-maroon-700 leading-relaxed">
        Most unused items, in their original condition and packaging, can be returned within 7 days
        of delivery. Since every handloom piece has small natural variations from being woven by
        hand, minor differences in weave or shade aren&apos;t considered defects.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">How to request a return</h2>
      <p className="text-maroon-700 leading-relaxed">
        Email us at{" "}
        <a href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-maroon-900 underline">
          {env.NEXT_PUBLIC_CONTACT_EMAIL}
        </a>{" "}
        with your order number and reason for return, and we&apos;ll guide you through the next
        steps.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Refunds</h2>
      <p className="text-maroon-700 leading-relaxed">
        Once a return is received and inspected, approved refunds are issued to your original
        payment method via Razorpay. Refunds are typically reflected within 5–7 business days,
        depending on your bank.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Damaged or incorrect items</h2>
      <p className="text-maroon-700 leading-relaxed">
        If your order arrives damaged or isn&apos;t what you ordered, contact us within 48 hours of
        delivery with photos of the item, and we&apos;ll sort out a replacement or refund at no
        extra cost to you.
      </p>
    </main>
  );
}
