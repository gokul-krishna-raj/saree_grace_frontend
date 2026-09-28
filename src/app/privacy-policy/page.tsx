import type { Metadata } from "next";

import { env } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What personal information Saree Grace collects when you create an account or place an order, how it is used, how we use cookies, and your rights.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="font-heading text-maroon-900 text-3xl">Privacy Policy</h1>

      <p className="text-maroon-700 leading-relaxed">
        This policy explains what information Saree Grace collects when you shop with us, and how
        it&apos;s used.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Information we collect</h2>
      <p className="text-maroon-700 leading-relaxed">
        When you create an account or place an order, we collect your name, email address, phone
        number, and delivery address. We never store your card or UPI details — payments are
        processed directly by Razorpay, our payment partner.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">How we use your information</h2>
      <p className="text-maroon-700 leading-relaxed">
        Your information is used to process and deliver orders, provide customer support, and send
        order-related updates. We don&apos;t sell your personal information to third parties.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Cookies</h2>
      <p className="text-maroon-700 leading-relaxed">
        We use essential cookies to keep you signed in and remember your cart, along with basic
        analytics to understand how the site is used and improve it.
      </p>

      <h2 className="font-heading text-maroon-900 text-xl">Your rights</h2>
      <p className="text-maroon-700 leading-relaxed">
        You can review or update your account details any time from My Account, or contact us at{" "}
        <a href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-maroon-900 underline">
          {env.NEXT_PUBLIC_CONTACT_EMAIL}
        </a>{" "}
        to request a copy or deletion of your data.
      </p>
    </main>
  );
}
