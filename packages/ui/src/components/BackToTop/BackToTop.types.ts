import type * as React from "react";

export type BackToTopSize = "md";
export type BackToTopVariant = "floating";

export interface BackToTopProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> {
  targetId?: string;
  label?: React.ReactNode;
  showLabel?: boolean;
  threshold?: number;
  size?: BackToTopSize;
  variant?: BackToTopVariant;
}
