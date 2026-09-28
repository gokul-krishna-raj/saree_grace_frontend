import type { Metadata } from "next";

import { env } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact Saree Grace by email or WhatsApp for help choosing a saree, or with questions about an order, delivery or returns. Based in Elampillai, Salem.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="font-heading text-maroon-900 text-3xl">Contact</h1>
      <p className="text-maroon-700 leading-relaxed">
        Have a question about our sarees, orders, or delivery? Reach out via email or WhatsApp and
        we&apos;ll reply as soon as possible.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border-maroon-100 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-maroon-900 font-semibold">Email</h2>
          <p className="text-maroon-600 mt-2">{env.NEXT_PUBLIC_CONTACT_EMAIL}</p>
        </div>
        <div className="border-maroon-100 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-maroon-900 font-semibold">WhatsApp</h2>
          <p className="text-maroon-600 mt-2">Message us for support and orders.</p>
        </div>
      </div>
    </main>
  );
}
