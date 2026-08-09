"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/apiError";
import { type RegisterFormValues, registerSchema } from "@/lib/validation/auth";
import { useRegisterMutation } from "@/store/api/authApi";

export function RegisterForm() {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser(values).unwrap();
      router.push("/");
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error as FetchBaseQueryError | SerializedError),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Full name"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
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
        autoComplete="new-password"
        hint="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      {errors.root ? (
        <p role="alert" className="text-sm text-red-600">
          {errors.root.message}
        </p>
      ) : null}
      <Button type="submit" isLoading={isLoading} className="w-full">
        Create account
      </Button>
      <div className="text-maroon-400 flex items-center gap-3 text-xs">
        <span className="bg-maroon-100 h-px flex-1" />
        or
        <span className="bg-maroon-100 h-px flex-1" />
      </div>
      <GoogleSignInButton redirectTo="/" />
    </form>
  );
}
