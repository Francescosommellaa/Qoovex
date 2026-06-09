"use client";

import * as React from "react";
import { CheckCircle, Check, Eye, EyeSlash } from "@phosphor-icons/react";
import {
  FIELD_ROOT_CLASS,
  FIELD_STATUS_RING,
  FieldErrorTooltip,
  FieldHelperText,
  FieldLabel,
} from "../FieldControl";
import { cn } from "../../lib/utils";

export type InputStatus = "default" | "error" | "success";
export type InputSurface = "light" | "dark";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  helperText?: string;
  status?: InputStatus;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  srOnlyLabel?: boolean;
  showStrength?: boolean;
  /** Shows the toggle that reveals or hides the password. */
  showPasswordToggle?: boolean;
  surface?: InputSurface;
}

interface StrengthCheck {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

const STRENGTH_CHECKS: StrengthCheck[] = [
  { key: "length", label: "8+ car.", test: (value) => value.length >= 8 },
  { key: "upper", label: "A-Z", test: (value) => /[A-Z]/.test(value) },
  { key: "lower", label: "a-z", test: (value) => /[a-z]/.test(value) },
  { key: "digit", label: "0-9", test: (value) => /[0-9]/.test(value) },
  {
    key: "special",
    label: "!@#$",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

function getLevel(score: number): StrengthLevel {
  if (score === 0) return "empty";
  if (score <= 2) return "weak";
  if (score === 3) return "fair";
  if (score === 4) return "good";
  return "strong";
}

const STRENGTH_LABEL: Record<StrengthLevel, string> = {
  empty: "",
  weak: "Debole",
  fair: "Sufficiente",
  good: "Buona",
  strong: "Ottima",
};

const STRENGTH_COLOR_VAR: Record<StrengthLevel, string> = {
  empty: "var(--color-strength-empty)",
  weak: "var(--color-strength-weak)",
  fair: "var(--color-strength-fair)",
  good: "var(--color-strength-good)",
  strong: "var(--color-strength-strong)",
};

function StrengthMeter({ value }: { value: string }) {
  const checks = STRENGTH_CHECKS.map((check) => ({
    ...check,
    passed: check.test(value),
  }));

  const score = checks.filter((check) => check.passed).length;
  const level = getLevel(value.length === 0 ? 0 : score);
  const color = STRENGTH_COLOR_VAR[level];
  const label = STRENGTH_LABEL[level];

  return (
    <div
      className="flex w-full flex-col gap-2"
      style={{ minHeight: "3rem" }}
      aria-live="polite"
      aria-label="Sicurezza password"
    >
      <div className="flex w-full gap-(--spacing-1)" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className="flex-1 rounded-(--strength-bar-radius)"
            style={{
              height: "var(--strength-bar-height)",
              backgroundColor:
                value.length > 0 && index < score
                  ? color
                  : "var(--color-strength-empty)",
              transition: "background-color var(--transition-base)",
            }}
          />
        ))}
      </div>

      <div
        className="flex w-full items-center justify-end gap-(--spacing-1) overflow-hidden"
        style={{ flexWrap: "wrap" }}
      >
        <span
          className="shrink-0 font-medium"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            width: "4rem",
            textAlign: "right",
            color: value.length > 0 ? color : "var(--color-text-faint)",
            transition: "color var(--transition-base)",
          }}
        >
          {value.length > 0 ? label : ""}
        </span>

        {checks.map((check) => (
          <span
            key={check.key}
            className={[
              "inline-flex items-center justify-center gap-[2px]",
              "rounded-(--radius-full)",
              "border shrink-0",
              "transition-[background-color,border-color,color]",
              "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
              check.passed
                ? "bg-(--color-success-highlight) border-(--color-success) text-(--color-success)"
                : "bg-transparent border-(--color-border) text-(--color-text-faint)",
            ].join(" ")}
            style={{
              fontSize: "0.75rem",
              padding: "2px 7px",
              letterSpacing: "0.03em",
            }}
            aria-label={`${check.label}: ${check.passed ? "soddisfatto" : "mancante"}`}
          >
            {check.passed ? <Check size={8} aria-hidden="true" /> : null}
            <span>{check.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function PasswordToggle({
  revealed,
  onToggle,
}: {
  revealed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={revealed ? "Nascondi password" : "Mostra password"}
      className={[
        "inline-flex items-center shrink-0",
        "text-(--color-input-icon)",
        "hover:text-(--color-text)",
        "transition-colors duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-(--color-primary-highlight)",
        "rounded-(--radius-sm)",
        "cursor-pointer",
      ].join(" ")}
    >
      {revealed ? (
        <EyeSlash size={14} aria-hidden="true" />
      ) : (
        <Eye size={14} aria-hidden="true" />
      )}
    </button>
  );
}

const SIZE_HEIGHT: Record<NonNullable<InputProps["size"]>, string> = {
  sm: "h-(--input-height-sm) text-(length:--text-xs)",
  md: "h-(--input-height-md) text-(length:--text-sm)",
  lg: "h-(--input-height-lg) text-(length:--text-base)",
};

const WRAPPER_BASE =
  "relative flex items-center gap-(--input-gap) " +
  "w-full rounded-(--input-radius) " +
  "bg-(--color-input-bg) border " +
  "px-(--input-px) " +
  "transition-[border-color,box-shadow] " +
  "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]";

const INPUT_BASE =
  "flex-1 min-w-0 bg-transparent outline-none " +
  "text-(--color-text) " +
  "placeholder:text-(--color-input-placeholder) " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      helperText,
      status = "default",
      iconLeading,
      iconTrailing,
      size = "md",
      srOnlyLabel = false,
      showStrength = false,
      showPasswordToggle = false,
      surface = "light",
      id,
      className = "",
      disabled,
      onChange,
      value,
      defaultValue,
      type,
      ...props
    },
    ref,
  ) {
    const inputId = id ?? React.useId();
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const [internalValue, setInternalValue] = React.useState(
      (defaultValue as string) ?? "",
    );
    const passwordValue =
      showStrength && type === "password"
        ? ((value as string | undefined) ?? internalValue)
        : "";
    const [revealed, setRevealed] = React.useState(false);
    const resolvedType = type === "password" && revealed ? "text" : type;

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      if (showStrength && type === "password") {
        setInternalValue(event.target.value);
      }

      onChange?.(event);
    }

    const hasStatusIcon = status === "error" && helperText;
    const hasSuccessIcon = status === "success";
    const hasToggle = showPasswordToggle && type === "password";

    const trailingSlot = (
      <span className="inline-flex shrink-0 items-center gap-(--spacing-2)">
        {!hasStatusIcon && !hasSuccessIcon && iconTrailing ? (
          <span
            className="inline-flex items-center text-(--color-input-icon)"
            aria-hidden="true"
          >
            {iconTrailing}
          </span>
        ) : null}

        {hasToggle ? (
          <PasswordToggle
            revealed={revealed}
            onToggle={() => setRevealed((currentValue) => !currentValue)}
          />
        ) : null}

        {hasStatusIcon ? (
          <FieldErrorTooltip
            message={helperText}
            tooltipId={`${inputId}-tooltip`}
          />
        ) : null}

        {hasSuccessIcon ? (
          <span className="inline-flex items-center" aria-hidden="true">
            <CheckCircle size={14} className="text-(--color-success)" />
          </span>
        ) : null}
      </span>
    );

    return (
      <div
        className={cn(
          FIELD_ROOT_CLASS,
          surface === "dark" && "qv-input--dark",
        )}
      >
        {label ? (
          <FieldLabel htmlFor={inputId} srOnly={srOnlyLabel}>
            {label}
          </FieldLabel>
        ) : null}

        <div
          className={cn(
            WRAPPER_BASE,
            SIZE_HEIGHT[size],
            FIELD_STATUS_RING[status],
            disabled && "opacity-50 pointer-events-none",
            className,
          )}
        >
          {iconLeading ? (
            <span
              className="inline-flex shrink-0 items-center text-(--color-input-icon)"
              aria-hidden="true"
            >
              {iconLeading}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            aria-describedby={helperId}
            aria-invalid={status === "error" || undefined}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={INPUT_BASE}
            {...props}
          />

          {trailingSlot}
        </div>

        {showStrength && type === "password" ? (
          <StrengthMeter value={passwordValue} />
        ) : null}

        {helperText ? (
          <FieldHelperText
            id={helperId}
            status={status}
            hideWhenHoverTooltip={status === "error"}
          >
            {helperText}
          </FieldHelperText>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
