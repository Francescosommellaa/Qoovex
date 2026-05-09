import type * as React from "react";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import type { QvTone } from "../../../config/variants";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  icon: React.ComponentType<PhosphorIconProps>;
  size?: IconSize;
  tone?: QvTone | "muted" | "faint" | "current";
  weight?: PhosphorIconProps["weight"];
  label?: string;
}

