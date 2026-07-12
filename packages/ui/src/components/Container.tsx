import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type ContainerProps = {
  children: ReactNode;
  size?: "md" | "lg";
} & HTMLAttributes<HTMLDivElement>;

const sizeClassNames = { md: "max-w-4xl", lg: "max-w-6xl" } as const;

export function Container({ children, className, size = "lg", ...props }: ContainerProps) {
  return (
    <div {...props} className={classNames("qv-container mx-auto w-full px-qv-4", sizeClassNames[size], className)}>
      {children}
    </div>
  );
}
