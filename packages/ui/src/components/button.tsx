import * as React from "react";

// ─── Tipi ────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

// ─── Classi base ─────────────────────────────────────────────────

const BASE =
  "relative inline-flex items-center justify-center gap-2 font-medium " +
  "rounded-md border border-transparent select-none cursor-pointer " +
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] " +
  "duration-[--transition-base] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:opacity-40 disabled:pointer-events-none " +
  "active:scale-[0.98]";

// ─── Varianti ────────────────────────────────────────────────────

const VARIANTS = {
  primary:
    "bg-primary text-white " +
    "hover:bg-primary-hover " +
    "active:bg-primary-active " +
    "shadow-sm hover:shadow-md",

  secondary:
    "bg-surface-offset text-text border border-border " +
    "hover:bg-surface-dynamic " +
    "active:bg-surface-dynamic",

  ghost:
    "bg-transparent text-text-muted " +
    "hover:bg-surface-offset hover:text-text " +
    "active:bg-surface-dynamic",

  destructive:
    "bg-error text-white " +
    "hover:bg-error-hover " +
    "active:bg-error-active " +
    "shadow-sm hover:shadow-md",
} satisfies Record<ButtonVariant, string>;

// ─── Size ────────────────────────────────────────────────────────

const SIZES = {
  sm: "h-8  px-3 text-xs  gap-1.5",
  md: "h-10 px-4 text-sm  gap-2",
  lg: "h-12 px-5 text-base gap-2",
} satisfies Record<ButtonSize, string>;

// ─── Spinner ─────────────────────────────────────────────────────

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === "sm" ? 12 : size === "lg" ? 18 : 15;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ─── Button ──────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[BASE, VARIANTS[variant], SIZES[size], className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner size={size} />
          </span>
        )}
        <span className={loading ? "invisible" : undefined}>{children}</span>
      </button>
    );
  },
);
