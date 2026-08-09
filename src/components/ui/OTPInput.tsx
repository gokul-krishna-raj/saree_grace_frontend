"use client";

import { type ClipboardEvent, type KeyboardEvent, useRef } from "react";

import { cn } from "@/lib/cn";

export interface OTPInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled,
  error,
  autoFocus,
}: OTPInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (index: number, digit: string) => {
    const next = [...value];
    next[index] = digit;
    onChange(next);
  };

  const handleChange = (index: number, rawInput: string) => {
    const digit = rawInput.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").split("");
    if (digits.length === 0) return;
    event.preventDefault();

    const next = [...value];
    digits.slice(0, length - index).forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    onChange(next);

    const nextEmptyIndex = next.findIndex((digit) => !digit);
    inputRefs.current[nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex]?.focus();
  };

  return (
    <div role="group" aria-label="One-time passcode" className="flex justify-between gap-2">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={error ? true : undefined}
          className={cn(
            "border-maroon-100 text-maroon-900 h-12 w-11 rounded-lg border bg-white text-center text-xl font-medium",
            "focus-visible:outline-maroon-600 focus-visible:outline-2 focus-visible:outline-offset-2",
            error && "border-red-500 focus-visible:outline-red-500",
            disabled && "opacity-50",
          )}
        />
      ))}
    </div>
  );
}
