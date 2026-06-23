import type { HTMLAttributes, Ref } from "react";

import { cx } from "./utils";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  ref?: Ref<HTMLSpanElement>;
  name: string;
  src?: string | null;
  label?: string;
  decorative?: boolean;
  size?: "sm" | "md" | "lg";
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("it") ?? "").join("") || "?";
}

export function Avatar({ ref, name, src, label, decorative = false, size = "md", className, ...props }: AvatarProps) {
  return (
    <span
      ref={ref}
      className={cx("qv-avatar", className)}
      data-size={size}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : (label ?? name)}
      aria-hidden={decorative || undefined}
      {...props}
    >
      <span aria-hidden="true">{getInitials(name)}</span>
      {src ? <img src={src} alt="" aria-hidden="true" /> : null}
    </span>
  );
}
