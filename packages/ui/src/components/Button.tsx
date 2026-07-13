import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr/CircleNotch";
import { classNames } from "./class-names";
import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  children: ReactNode;
  className?: string;
  endIcon?: PhosphorIcon;
  size?: ButtonSize;
  startIcon?: PhosphorIcon;
  variant?: ButtonVariant;
};

type ButtonLinkProps = ButtonBaseProps & {
  href: string;
  loading?: never;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;

type ButtonElementProps = ButtonBaseProps & {
  href?: undefined;
  loading?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ButtonProps = ButtonLinkProps | ButtonElementProps;

const baseClassName = "qv-button inline-flex min-h-qv-control items-center justify-center gap-qv-2 rounded-qv-md border border-transparent px-qv-4 font-semibold no-underline transition-colors duration-150 ease-qv-standard disabled:pointer-events-none disabled:opacity-60";

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-qv-accent text-qv-surface hover:bg-qv-accent-strong",
  secondary: "bg-qv-surface text-qv-content shadow-qv-sm hover:bg-qv-surface-muted border-qv-border",
  ghost: "bg-transparent text-qv-accent-strong hover:bg-qv-accent-soft",
  danger: "bg-qv-danger text-qv-surface hover:bg-qv-danger/90",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "min-h-qv-9 px-qv-3 text-sm",
  md: "px-qv-4 text-sm",
  lg: "min-h-qv-12 px-qv-5 text-base",
};

export function Button(props: ButtonProps) {
  const { children, className, endIcon, size = "md", startIcon, variant = "primary" } = props;
  const classes = classNames(baseClassName, variantClassNames[variant], sizeClassNames[size], className);

  if (props.href) {
    const linkProps = props as ButtonLinkProps;
    const { children: _children, className: _className, endIcon: _endIcon, href, loading: _loading, size: _size, startIcon: _startIcon, variant: _variant, ...anchorProps } = linkProps;
    return (
      <a {...anchorProps} className={classes} href={href}>
        {startIcon ? <Icon decorative icon={startIcon} size="sm" weight="bold" /> : null}
        {children}
        {endIcon ? <Icon decorative icon={endIcon} size="sm" weight="bold" /> : null}
      </a>
    );
  }

  const elementProps = props as ButtonElementProps;
  const {
    children: _children,
    className: _className,
    href: _href,
    loading = false,
    size: _size,
    endIcon: _endIcon,
    startIcon: _startIcon,
    type = "button",
    variant: _variant,
    ...buttonProps
  } = elementProps;
  return (
    <button {...buttonProps} aria-busy={loading || undefined} className={classes} disabled={loading || buttonProps.disabled} type={type}>
      {loading ? <Icon className="qv-button__loading-icon" decorative icon={CircleNotch} size="sm" weight="bold" /> : startIcon ? <Icon decorative icon={startIcon} size="sm" weight="bold" /> : null}
      {children}
      {!loading && endIcon ? <Icon decorative icon={endIcon} size="sm" weight="bold" /> : null}
    </button>
  );
}
