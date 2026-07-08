import type { HTMLAttributes, ReactNode } from "react";

export type ContainerProps = {
  children: ReactNode;
  size?: "md" | "lg";
} & HTMLAttributes<HTMLDivElement>;

function classNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function Container({ children, className, size = "lg", ...props }: ContainerProps) {
  return (
    <div {...props} className={classNames("qv-container", `qv-container--${size}`, className)}>
      {children}
    </div>
  );
}
