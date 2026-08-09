import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="font-heading text-maroon-900 mb-6 text-2xl">Checkout</h1>
        <CheckoutForm />
      </main>
    </ProtectedRoute>
  );
}
