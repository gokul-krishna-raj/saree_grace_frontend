import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="font-heading text-maroon-900 text-2xl">Welcome back</h1>
        <p className="text-maroon-600 mt-1 text-sm">Sign in to continue to Saree Grace</p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <LoginForm />
      </Suspense>
      <p className="text-maroon-700 text-center text-sm">
        New here?{" "}
        <Link href="/register" className="text-maroon-900 font-medium underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
