import type { Metadata } from "next";

import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of the Saree Grace website and orders.",
  alternates: { canonical: "/terms-and-conditions" },
  openGraph: {
    title: "Terms & Conditions | Saree Grace",
    description: "The terms that govern your use of the Saree Grace website and orders.",
    url: "/terms-and-conditions",
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="font-heading text-maroon-900 text-3xl">Terms &amp; Conditions</h1>

      <p className="text-maroon-700 leading-relaxed">
        By using the Saree Grace website and placing an order, you agree to the terms below.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Orders and pricing</h2>
      <p className="text-maroon-700 leading-relaxed">
        Prices are listed in Indian Rupees (INR) and may change without notice; the price shown at
        checkout is the price you pay. We reserve the right to cancel an order in cases of pricing
        errors or unavailable stock, in which case you&apos;ll receive a full refund.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Payments</h2>
      <p className="text-maroon-700 leading-relaxed">
        All payments are processed securely through Razorpay. We do not have access to, or store,
        your card, UPI, or net banking credentials.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Product accuracy</h2>
      <p className="text-maroon-700 leading-relaxed">
        We try to represent colours and weave details as accurately as possible, but slight
        variations can occur due to photography and screen settings — and, for handloom pieces,
        because each one is woven by hand.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Account responsibility</h2>
      <p className="text-maroon-700 leading-relaxed">
        You&apos;re responsible for keeping your account credentials confidential and for all
        activity under your account.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Contact</h2>
      <p className="text-maroon-700 leading-relaxed">
        Questions about these terms can be sent to{" "}
        <a href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-maroon-900 underline">
          {env.NEXT_PUBLIC_CONTACT_EMAIL}
        </a>
        .
      </p>
    </main>
  );
}
