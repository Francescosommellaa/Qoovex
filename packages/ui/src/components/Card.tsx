import type { HTMLAttributes, ReactNode } from "react";

export type CardTone = "default" | "accent" | "attention";

export type CardProps = {
  children: ReactNode;
  tone?: CardTone;
} & HTMLAttributes<HTMLElement>;

function classNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function Card({ children, className, tone = "default", ...props }: CardProps) {
  return (
    <article {...props} className={classNames("qv-card", `qv-card--${tone}`, className)}>
      {children}
    </article>
  );
}
