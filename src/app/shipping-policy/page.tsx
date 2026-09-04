import type { Metadata } from "next";

import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Shipping timelines, charges, and delivery areas for Saree Grace orders.",
  alternates: { canonical: "/shipping-policy" },
  openGraph: {
    title: "Shipping Policy | Saree Grace",
    description: "Shipping timelines, charges, and delivery areas for Saree Grace orders.",
    url: "/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="font-heading text-maroon-900 text-3xl">Shipping Policy</h1>

      <p className="text-maroon-700 leading-relaxed">
        Every order ships from our weaver network in Elampillai, Salem, Tamil Nadu. Here&apos;s what
        to expect once you&apos;ve placed an order.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Processing time</h2>
      <p className="text-maroon-700 leading-relaxed">
        Orders are typically packed and handed to our courier partner within 1–2 business days of
        payment confirmation. Handloom pieces made to order may take a little longer — this will be
        noted on the product page where it applies.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Delivery timelines</h2>
      <p className="text-maroon-700 leading-relaxed">
        We ship pan-India. Delivery generally takes 3–7 business days depending on your location,
        after the order has been shipped.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Shipping charges</h2>
      <p className="text-maroon-700 leading-relaxed">
        Any applicable shipping charges are shown at checkout before you complete payment — the
        amount you see there is the final amount charged.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Questions about your delivery</h2>
      <p className="text-maroon-700 leading-relaxed">
        Track your order any time from My Account, or reach us at{" "}
        <a href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-maroon-900 underline">
          {env.NEXT_PUBLIC_CONTACT_EMAIL}
        </a>{" "}
        and we&apos;ll help track it down.
      </p>
    </main>
  );
}
