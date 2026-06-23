import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { cx } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "subtle" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

export function Button({
  ref,
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  fullWidth = false,
  loading = false,
  loadingLabel = "Caricamento",
  disabled,
  type = "button",
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("qv-button", className)}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="qv-button__spinner" aria-hidden="true" /> : startIcon ? <span className="qv-button__icon" aria-hidden="true">{startIcon}</span> : null}
      <span className="qv-button__label">{children}</span>
      {loading ? <span className="qv-visually-hidden">{loadingLabel}</span> : endIcon ? <span className="qv-button__icon" aria-hidden="true">{endIcon}</span> : null}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "children" | "startIcon" | "endIcon" | "fullWidth"> {
  "aria-label": string;
  icon: ReactNode;
}

export function IconButton({ icon, className, ...props }: IconButtonProps) {
  return <Button className={cx("qv-icon-button", className)} startIcon={icon} {...props} />;
}
