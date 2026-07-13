import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react";
import type { HTMLAttributes } from "react";
import { classNames } from "./class-names";

export type IconSize = "sm" | "md" | "lg";

type IconBaseProps = {
  className?: string;
  icon: PhosphorIcon;
  size?: IconSize;
  weight?: IconWeight;
} & Omit<HTMLAttributes<SVGSVGElement>, "children">;

type DecorativeIconProps = IconBaseProps & {
  decorative?: true;
  label?: never;
};

type InformativeIconProps = IconBaseProps & {
  decorative: false;
  label: string;
};

export type IconProps = DecorativeIconProps | InformativeIconProps;

const sizeClassNames: Record<IconSize, string> = {
  sm: "size-qv-4",
  md: "size-qv-icon",
  lg: "size-qv-6",
};

export function Icon({ className, decorative = true, icon: Source, label, size = "md", weight = "regular", ...props }: IconProps) {
  return (
    <Source
      {...props}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      className={classNames("qv-icon shrink-0", sizeClassNames[size], className)}
      focusable="false"
      role={decorative ? undefined : "img"}
      weight={weight}
    />
  );
}
