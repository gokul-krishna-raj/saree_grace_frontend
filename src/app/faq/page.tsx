import type { Metadata } from "next";

import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about ordering, payment, shipping, and returns at Saree Grace.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Frequently Asked Questions | Saree Grace",
    description:
      "Answers to common questions about ordering, payment, shipping, and returns at Saree Grace.",
    url: "/faq",
  },
};

const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What makes Saree Grace sarees different?",
    answer:
      "Every saree is sourced directly from weaver families in Elampillai, Tamil Nadu, so you're buying straight from the source rather than through layers of middlemen. Product listings note the fabric, care details, and whether a piece is handloom.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Browse by category or search, add a saree to your cart, and check out with a delivery address. You'll get an order confirmation once payment is complete.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Checkout is powered by Razorpay, which supports UPI, credit/debit cards (Visa, Mastercard, RuPay), and net banking. We currently don't offer Cash on Delivery — all orders are prepaid.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Sign in and visit your order history under My Account to see the status of every order.",
  },
  {
    question: "What is your return and refund policy?",
    answer:
      "See our Return & Refund Policy page for eligibility and timelines. Approved refunds are issued to the original payment method via Razorpay.",
  },
  {
    question: "Do you ship across India?",
    answer:
      "Yes, we ship pan-India from Elampillai, Salem, Tamil Nadu. See our Shipping Policy for estimated delivery timelines.",
  },
  {
    question: "How do I contact support?",
    answer: `Email us at ${env.NEXT_PUBLIC_CONTACT_EMAIL} or use the WhatsApp link on our Contact page — we typically reply within a business day.`,
  },
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1 className="font-heading text-maroon-900 text-3xl">Frequently Asked Questions</h1>
      <p className="text-maroon-700 leading-relaxed">
        Everything you need to know about shopping for sarees online with Saree Grace.
      </p>
      <div className="flex flex-col gap-3">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="border-maroon-100 group rounded-lg border bg-white p-4 open:pb-4"
          >
            <summary className="text-maroon-900 cursor-pointer list-none font-medium marker:content-none">
              {faq.question}
            </summary>
            <p className="text-maroon-700 mt-2 leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
