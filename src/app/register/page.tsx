import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="font-heading text-maroon-900 text-2xl">Create your account</h1>
        <p className="text-maroon-600 mt-1 text-sm">Join Saree Grace for a faster checkout</p>
      </div>
      <RegisterForm />
      <p className="text-maroon-700 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-maroon-900 font-medium underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
