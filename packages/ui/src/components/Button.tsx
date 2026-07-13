import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type ButtonLinkProps = ButtonBaseProps & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;

type ButtonElementProps = ButtonBaseProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ButtonProps = ButtonLinkProps | ButtonElementProps;

const baseClassName = "qv-button inline-flex min-h-qv-control items-center justify-center gap-qv-2 whitespace-nowrap rounded-qv-md border border-transparent px-qv-4 font-semibold no-underline transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-qv-standard active:translate-y-px motion-reduce:transition-none disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60";

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-qv-accent text-qv-on-accent hover:bg-qv-accent-strong",
  secondary: "bg-qv-surface text-qv-content shadow-qv-sm hover:bg-qv-surface-muted border-qv-border",
  ghost: "bg-transparent text-qv-accent-strong hover:bg-qv-accent-soft",
  danger: "bg-qv-danger text-qv-on-accent hover:bg-qv-danger/90",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "min-h-qv-control-sm px-qv-3 text-sm",
  md: "px-qv-4 text-sm",
  lg: "min-h-qv-control-lg px-qv-5 text-base",
};

export function Button(props: ButtonProps) {
  const { children, className, size = "md", variant = "primary" } = props;
  const classes = classNames(baseClassName, variantClassNames[variant], sizeClassNames[size], className);

  if (props.href) {
    const linkProps = props as ButtonLinkProps;
    const { children: _children, className: _className, href, size: _size, variant: _variant, ...anchorProps } = linkProps;
    return (
      <a {...anchorProps} className={classes} href={href}>
        {children}
      </a>
    );
  }

  const elementProps = props as ButtonElementProps;
  const {
    children: _children,
    className: _className,
    href: _href,
    size: _size,
    type = "button",
    variant: _variant,
    ...buttonProps
  } = elementProps;
  return (
    <button {...buttonProps} className={classes} type={type}>
      {children}
    </button>
  );
}
