import type * as React from "react";

export type ActionLinkVariant = "primary" | "secondary" | "ghost";
export type ActionLinkSize = "sm" | "md" | "lg";

export interface ActionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ActionLinkVariant;
  size?: ActionLinkSize;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
}

