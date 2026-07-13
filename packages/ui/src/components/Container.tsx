import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type ContainerProps = {
  children: ReactNode;
  size?: "md" | "lg" | "wide";
} & HTMLAttributes<HTMLDivElement>;

const sizeClassNames = {
  md: "max-w-qv-reading",
  lg: "max-w-qv-content",
  wide: "max-w-qv-wide",
} as const;

export function Container({ children, className, size = "lg", ...props }: ContainerProps) {
  return (
    <div {...props} className={classNames("qv-container mx-auto w-full px-qv-page", sizeClassNames[size], className)}>
      {children}
    </div>
  );
}
