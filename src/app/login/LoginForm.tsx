"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/apiError";
import { type LoginFormValues, loginSchema } from "@/lib/validation/auth";
import { useLoginMutation } from "@/store/api/authApi";

export function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values).unwrap();
      router.push(redirectTo);
    } catch (error) {
      const typedError = error as FetchBaseQueryError | SerializedError;
      if (getApiErrorCode(typedError) === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
        return;
      }
      setError("root", { message: getApiErrorMessage(typedError) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {errors.root ? (
        <p role="alert" className="text-sm text-red-600">
          {errors.root.message}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-maroon-700 text-sm underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full">
        Sign in
      </Button>
      <div className="text-maroon-400 flex items-center gap-3 text-xs">
        <span className="bg-maroon-100 h-px flex-1" />
        or
        <span className="bg-maroon-100 h-px flex-1" />
      </div>
      <GoogleSignInButton redirectTo={redirectTo} />
    </form>
  );
}
