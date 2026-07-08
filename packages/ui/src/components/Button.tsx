import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

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

function classNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function Button(props: ButtonProps) {
  const { children, className, size = "md", variant = "primary" } = props;
  const classes = classNames("qv-button", `qv-button--${variant}`, `qv-button--${size}`, className);

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
