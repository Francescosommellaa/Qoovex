import type { Icon as PhosphorGlyph, IconProps as PhosphorIconProps } from "@phosphor-icons/react";

export type IconSize = 16 | 20 | 24;
export type IconProps = {
  glyph: PhosphorGlyph;
  label?: string;
  size?: IconSize;
  weight?: PhosphorIconProps["weight"];
} & Omit<PhosphorIconProps, "aria-hidden" | "aria-label" | "children" | "size" | "weight">;

export function Icon({ glyph: Glyph, label, size = 20, weight = "regular", ...props }: IconProps) {
  return (
    <Glyph
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      focusable="false"
      size={size}
      weight={weight}
    />
  );
}
