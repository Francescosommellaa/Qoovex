"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";

export type InputStatus = "default" | "error" | "success";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
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
      <div className="flex w-full gap-[var(--spacing-1)]" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className="flex-1 rounded-[var(--strength-bar-radius)]"
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
        className="flex w-full items-center justify-end gap-[var(--spacing-1)] overflow-hidden"
        style={{ flexWrap: "nowrap" }}
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
              "rounded-[var(--radius-full)]",
              "border shrink-0",
              "transition-[background-color,border-color,color]",
              "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
              check.passed
                ? "bg-[var(--color-success-highlight)] border-[var(--color-success)] text-[var(--color-success)]"
                : "bg-transparent border-[var(--color-border)] text-[var(--color-text-faint)]",
            ].join(" ")}
            style={{
              fontSize: "0.75rem",
              padding: "2px 7px",
              letterSpacing: "0.03em",
            }}
            aria-label={`${check.label}: ${check.passed ? "soddisfatto" : "mancante"}`}
          >
            {check.passed ? (
              <Check size={8} strokeWidth={2.5} aria-hidden="true" />
            ) : null}
            <span>{check.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ErrorTooltip({
  message,
  inputId,
}: {
  message: string;
  inputId: string;
}) {
  return (
    <>
      <span
        className={[
          "relative group/tooltip",
          "inline-flex items-center shrink-0 cursor-default",
          "[@media(hover:none)]:hidden",
        ].join(" ")}
        role="img"
        aria-hidden="true"
      >
        <AlertCircle
          size={14}
          strokeWidth={2}
          className="text-[var(--color-error)]"
          aria-hidden="true"
        />

        <span
          role="tooltip"
          id={`${inputId}-tooltip`}
          className={[
            "absolute bottom-[calc(100%+var(--spacing-2))] right-0",
            "z-[var(--z-dropdown)]",
            "w-max max-w-[220px]",
            "px-[var(--spacing-3)] py-[var(--spacing-2)]",
            "rounded-[var(--radius-md)]",
            "bg-[var(--color-tooltip-bg)] border border-[var(--color-tooltip-border)]",
            "text-[length:var(--text-xs)] text-[var(--color-tooltip-text)]",
            "shadow-[var(--shadow-md)]",
            "pointer-events-none select-none",
            "opacity-0 translate-y-1",
            "group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0",
            "transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
            "after:content-[''] after:absolute after:top-full after:right-3",
            "after:border-4 after:border-transparent",
            "after:border-t-[var(--color-tooltip-bg)]",
          ].join(" ")}
        >
          {message}
        </span>
      </span>

      <span
        className={[
          "inline-flex items-center shrink-0",
          "[@media(hover:hover)]:hidden",
        ].join(" ")}
        aria-hidden="true"
      >
        <AlertCircle
          size={14}
          strokeWidth={2}
          className="text-[var(--color-error)]"
        />
      </span>
    </>
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
        "text-[var(--color-input-icon)]",
        "hover:text-[var(--color-text)]",
        "transition-colors duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[var(--color-primary-highlight)]",
        "rounded-[var(--radius-sm)]",
        "cursor-pointer",
      ].join(" ")}
    >
      {revealed ? (
        <EyeOff size={14} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Eye size={14} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}

const SIZE_HEIGHT: Record<NonNullable<InputProps["size"]>, string> = {
  sm: "h-[var(--input-height-sm)] text-[length:var(--text-xs)]",
  md: "h-[var(--input-height-md)] text-[length:var(--text-sm)]",
  lg: "h-[var(--input-height-lg)] text-[length:var(--text-base)]",
};

const STATUS_RING: Record<InputStatus, string> = {
  default:
    "border-[var(--color-input-border)] " +
    "focus-within:border-[var(--color-input-border-focus)] " +
    "focus-within:ring-2 focus-within:ring-[var(--color-primary-highlight)]",
  error:
    "border-[var(--color-input-border-error)] " +
    "ring-2 ring-[var(--color-error-highlight)]",
  success:
    "border-[var(--color-input-border-success)] " +
    "ring-2 ring-[var(--color-success-highlight)]",
};

const STATUS_HELPER: Record<InputStatus, string> = {
  default: "text-[var(--color-input-helper)]",
  error: "text-[var(--color-input-helper-error)]",
  success: "text-[var(--color-input-helper-success)]",
};

const WRAPPER_BASE =
  "relative flex items-center gap-[var(--input-gap)] " +
  "w-full rounded-[var(--input-radius)] " +
  "bg-[var(--color-input-bg)] border " +
  "px-[var(--input-px)] " +
  "transition-[border-color,box-shadow] " +
  "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]";

const INPUT_BASE =
  "flex-1 min-w-0 bg-transparent outline-none " +
  "text-[var(--color-text)] " +
  "placeholder:text-[var(--color-input-placeholder)] " +
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
      <span className="inline-flex shrink-0 items-center gap-[var(--spacing-2)]">
        {!hasStatusIcon && !hasSuccessIcon && iconTrailing ? (
          <span
            className="inline-flex items-center text-[var(--color-input-icon)]"
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
          <ErrorTooltip message={helperText} inputId={inputId} />
        ) : null}

        {hasSuccessIcon ? (
          <span className="inline-flex items-center" aria-hidden="true">
            <CheckCircle2
              size={14}
              strokeWidth={2}
              className="text-[var(--color-success)]"
            />
          </span>
        ) : null}
      </span>
    );

    return (
      <div className="flex w-full flex-col gap-[var(--input-gap)]">
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              "text-[length:var(--text-xs)] font-medium text-[var(--color-label)] tracking-[0.03em] uppercase select-none",
              srOnlyLabel && "sr-only",
            )}
          >
            {label}
          </label>
        ) : null}

        <div
          className={cn(
            WRAPPER_BASE,
            SIZE_HEIGHT[size],
            STATUS_RING[status],
            disabled && "opacity-50 pointer-events-none",
            className,
          )}
        >
          {iconLeading ? (
            <span
              className="inline-flex shrink-0 items-center text-[var(--color-input-icon)]"
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
          <p
            id={helperId}
            className={cn(
              "text-[length:var(--text-xs)]",
              STATUS_HELPER[status],
              status === "error" && "[@media(hover:hover)]:hidden",
            )}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
