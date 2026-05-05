"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardBody, cn } from "@qoovex/ui";

/** Unico boundary client marketing (Card + link come Button); classi link allineate a `packages/ui` Button. */

const LINK_BUTTON_BASE =
  "group relative inline-flex items-center justify-center select-none cursor-pointer " +
  "rounded-full font-medium whitespace-nowrap tracking-[0.012em] overflow-hidden " +
  "transition-[color,border-color,box-shadow,opacity] " +
  "duration-[var(--duration-base)] ease-[var(--ease-qoovex)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export type MarketingLinkButtonVariant = "primary" | "secondary" | "ghost";

export type MarketingLinkButtonSize = "xs" | "sm" | "md" | "lg";

const LINK_VARIANTS: Record<MarketingLinkButtonVariant, string> = {
  primary:
    "bg-surface-offset text-text border border-primary/40 " +
    "shadow-[var(--shadow-btn-resting)] " +
    "hover:text-(--color-btn-filled-text) hover:border-transparent " +
    "hover:shadow-[var(--shadow-btn-hover)] " +
    "active:shadow-[var(--shadow-btn-active)]",
  secondary:
    "bg-surface-offset text-text border border-border " +
    "shadow-[var(--shadow-btn-resting)] " +
    "hover:shadow-[var(--shadow-btn-hover)] " +
    "active:shadow-[var(--shadow-btn-active)]",
  ghost:
    "bg-transparent text-text-muted border border-transparent " +
    "hover:text-text active:opacity-70",
};

const LINK_FILLS: Record<MarketingLinkButtonVariant, string> = {
  primary:
    "absolute inset-0 rounded-[inherit] scale-x-0 origin-left pointer-events-none " +
    "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-qoovex)] " +
    "group-hover:scale-x-100 bg-primary",
  secondary:
    "absolute inset-0 rounded-[inherit] scale-x-0 origin-left pointer-events-none " +
    "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-qoovex)] " +
    "group-hover:scale-x-100 bg-(--color-btn-fill-secondary)",
  ghost:
    "absolute inset-0 rounded-[inherit] scale-x-0 origin-left pointer-events-none " +
    "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-qoovex)] " +
    "group-hover:scale-x-100 bg-(--color-btn-fill-ghost)",
};

const LINK_SIZES: Record<MarketingLinkButtonSize, string> = {
  xs: "h-8  px-4   gap-1.5 text-(length:--text-xs)",
  sm: "h-9  px-6   gap-2   text-(length:--text-xs)",
  md: "h-10 px-6   gap-2   text-(length:--text-sm)",
  lg: "h-12 px-8   gap-2.5 text-(length:--text-base)",
};

type MarketingLinkButtonProps = {
  href: string;
  variant: MarketingLinkButtonVariant;
  size?: MarketingLinkButtonSize;
  children: ReactNode;
  className?: string;
};

export function MarketingLinkButton({
  href,
  variant,
  size = "md",
  children,
  className,
}: MarketingLinkButtonProps) {
  const merged = cn(LINK_BUTTON_BASE, LINK_VARIANTS[variant], LINK_SIZES[size], className);
  const inner = (
    <>
      <span className={LINK_FILLS[variant]} aria-hidden="true" />
      <span className="relative z-10 inline-flex items-center justify-center gap-[inherit]">{children}</span>
    </>
  );

  const isExternal = /^https?:\/\//i.test(href);

  if (isExternal) {
    return (
      <a href={href} className={merged}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={merged}>
      {inner}
    </Link>
  );
}

type MarketingSurfaceProps = {
  children: ReactNode;
  cardClassName?: string;
  bodyClassName?: string;
};

/** Card “quiet” riusata dalle sezioni pagina (stesso chrome DS ovunque). */
export function MarketingQuietSurface({
  children,
  cardClassName,
  bodyClassName,
}: MarketingSurfaceProps) {
  return (
    <Card variant="quiet" tone="neutral" padding="lg" className={cn("w-full", cardClassName)}>
      <CardBody className={cn("flex flex-col gap-3", bodyClassName)}>{children}</CardBody>
    </Card>
  );
}

/** Card “panel” per blocchi hero marketing tipo CTA. */
export function MarketingPanelSurface({
  children,
  cardClassName,
  bodyClassName,
}: MarketingSurfaceProps) {
  return (
    <Card variant="panel" tone="neutral" padding="lg" className={cn("w-full", cardClassName)}>
      <CardBody className={cn("flex flex-col gap-3", bodyClassName)}>{children}</CardBody>
    </Card>
  );
}
