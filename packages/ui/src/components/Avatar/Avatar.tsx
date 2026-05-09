"use client";

import * as React from "react";
import { User } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarTone = "neutral" | "primary" | "success" | "warning" | "error";
export type AvatarStatus = "online" | "busy" | "away" | "offline";

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  status?: AvatarStatus;
  fallbackIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const SIZES: Record<AvatarSize, string> = {
  sm: "qv-avatar--sm",
  md: "qv-avatar--md",
  lg: "qv-avatar--lg",
  xl: "qv-avatar--xl",
};

const TONES: Record<AvatarTone, string> = {
  neutral: "qv-avatar--tone-neutral",
  primary: "qv-avatar--tone-primary",
  success: "qv-avatar--tone-success",
  warning: "qv-avatar--tone-warning",
  error: "qv-avatar--tone-error",
};

const STATUSES: Record<AvatarStatus, string> = {
  online: "qv-avatar__status--online",
  busy: "qv-avatar__status--busy",
  away: "qv-avatar__status--away",
  offline: "qv-avatar__status--offline",
};

function getInitials(name?: string) {
  if (!name) return "";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar(
    {
      src,
      alt,
      name,
      initials,
      size = "md",
      tone = "neutral",
      status,
      fallbackIcon,
      children,
      className,
      role,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const [imageFailed, setImageFailed] = React.useState(false);

    React.useEffect(() => {
      setImageFailed(false);
    }, [src]);

    const showImage = Boolean(src && !imageFailed);
    const resolvedInitials = initials ?? getInitials(name);
    const fallbackContent =
      children ??
      (resolvedInitials || fallbackIcon || (
        <User weight="bold" aria-hidden="true" />
      ));
    const fallbackLabel = ariaLabel ?? name ?? alt;

    return (
      <span
        ref={ref}
        role={role ?? (!showImage && fallbackLabel ? "img" : undefined)}
        aria-label={!showImage ? fallbackLabel : ariaLabel}
        className={cn(
          "qv-avatar",
          SIZES[size],
          TONES[tone],
          className,
        )}
        {...props}
      >
        <span className="qv-avatar__content">
          {showImage ? (
            <img
              src={src}
              alt={alt ?? name ?? ""}
              className="qv-avatar__image"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="qv-avatar__fallback">{fallbackContent}</span>
          )}
        </span>

        {status ? (
          <span
            className={cn("qv-avatar__status", STATUSES[status])}
            aria-hidden="true"
          />
        ) : null}
      </span>
    );
  },
);

Avatar.displayName = "Avatar";
