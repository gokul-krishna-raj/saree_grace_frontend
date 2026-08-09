"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "@/lib/toast";
import { useResendOtpMutation, useVerifyOtpMutation } from "@/store/api/authApi";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string>();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  if (!email) return null;

  const isComplete = digits.every((digit) => digit !== "");

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    if (!isComplete) return;

    try {
      await verifyOtp({ email, otp: digits.join("") }).unwrap();
      router.push("/");
    } catch (err) {
      setError(getApiErrorMessage(err as FetchBaseQueryError | SerializedError));
      setDigits(Array(OTP_LENGTH).fill(""));
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success("A new code has been sent to your email.");
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
      setError(undefined);
    } catch (err) {
      toast.error(getApiErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4">
      <p className="text-maroon-700 text-center text-sm">
        Enter the 6-digit code sent to <span className="font-medium">{email}</span>
      </p>
      <OTPInput
        value={digits}
        onChange={(next) => {
          setDigits(next);
          setError(undefined);
        }}
        disabled={isVerifying}
        error={error}
        autoFocus
      />
      {error ? (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <Button type="submit" isLoading={isVerifying} disabled={!isComplete} className="w-full">
        Verify
      </Button>
      <div className="text-center text-sm">
        {secondsLeft > 0 ? (
          <span className="text-maroon-600">Resend code in {secondsLeft}s</span>
        ) : (
          <Button type="button" variant="ghost" isLoading={isResending} onClick={handleResend}>
            Resend OTP
          </Button>
        )}
      </div>
    </form>
  );
}
