"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
}

function sanitizeOtpValue(rawValue: string, length: number): string {
  return rawValue.replace(/[^\d]/g, "").slice(0, length);
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  className,
  "aria-label": ariaLabel = "Codice di verifica",
}: OtpInputProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const normalizedValue = sanitizeOtpValue(value, length);

  React.useEffect(() => {
    if (!autoFocus || disabled) return;
    inputRefs.current[0]?.focus();
  }, [autoFocus, disabled]);

  function focusInput(index: number) {
    const clampedIndex = Math.max(0, Math.min(length - 1, index));
    inputRefs.current[clampedIndex]?.focus();
    inputRefs.current[clampedIndex]?.select();
  }

  function updateAt(index: number, digit: string) {
    const valueChars = normalizedValue.padEnd(length, " ").split("");
    valueChars[index] = digit;
    const merged = valueChars.join("").replace(/\s/g, "");
    onChange(merged);
  }

  function handleChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = event.target.value.replace(/[^\d]/g, "");
    if (sanitized.length === 0) {
      updateAt(index, " ");
      return;
    }

    if (sanitized.length > 1) {
      const merged = sanitizeOtpValue(
        `${normalizedValue.slice(0, index)}${sanitized}${normalizedValue.slice(index + 1)}`,
        length,
      );
      onChange(merged);
      focusInput(index + sanitized.length);
      return;
    }

    updateAt(index, sanitized);
    focusInput(index + 1);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      if (normalizedValue[index]) {
        updateAt(index, " ");
        return;
      }
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const pasted = sanitizeOtpValue(
      event.clipboardData.getData("text"),
      length,
    );
    if (!pasted) return;
    onChange(pasted);
    focusInput(pasted.length - 1);
  }

  return (
    <div
      className={cn("qv-otp-input", className)}
      role="group"
      aria-label={ariaLabel}
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={normalizedValue[index] ?? ""}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="qv-otp-input__slot"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
