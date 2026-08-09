import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

import { VerifyOtpForm } from "./VerifyOtpForm";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default function VerifyOtpPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="font-heading text-maroon-900 text-2xl">Verify your email</h1>
        <p className="text-maroon-600 mt-1 text-sm">
          We&apos;ve sent a one-time passcode to confirm your account
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <VerifyOtpForm />
      </Suspense>
    </main>
  );
}
