"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/apiError";
import { type ForgotPasswordFormValues, forgotPasswordSchema } from "@/lib/validation/auth";
import { useForgotPasswordMutation } from "@/store/api/authApi";

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(values).unwrap();
      setSent(true);
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error as FetchBaseQueryError | SerializedError),
      });
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="font-heading text-maroon-900 text-2xl">Reset your password</h1>
        <p className="text-maroon-600 mt-1 text-sm">
          We&apos;ll email you a link to reset your password.
        </p>
      </div>

      {sent ? (
        <p className="bg-maroon-50 text-maroon-700 rounded-lg p-4 text-center text-sm">
          If that email exists in our system, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          {errors.root ? (
            <p role="alert" className="text-sm text-red-600">
              {errors.root.message}
            </p>
          ) : null}
          <Button type="submit" isLoading={isLoading} className="w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="text-maroon-700 text-center text-sm">
        <Link href="/login" className="text-maroon-900 font-medium underline">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
