"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { type ResetPasswordFormValues, resetPasswordSchema } from "@/lib/validation/auth";
import { useResetPasswordMutation } from "@/store/api/authApi";

export function ResetPasswordForm() {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  if (!token) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        This reset link is missing or invalid. Please request a new one.{" "}
        <Link href="/forgot-password" className="underline">
          Request again
        </Link>
      </p>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword({ token, newPassword: values.newPassword }).unwrap();
      toast.success("Password reset. Please sign in again.");
      router.push("/login");
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error as FetchBaseQueryError | SerializedError),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {errors.root ? (
        <p role="alert" className="text-sm text-red-600">
          {errors.root.message}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading} className="w-full">
        Reset password
      </Button>
    </form>
  );
}
