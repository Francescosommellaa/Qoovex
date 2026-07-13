import type { ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type IconButtonProps = {
  "aria-label": string;
  children: ReactNode;
  tone?: "neutral" | "accent" | "danger";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const toneClassNames = {
  neutral: "border-qv-border bg-qv-surface text-qv-content hover:bg-qv-surface-muted",
  accent: "border-qv-accent bg-qv-accent text-qv-on-accent hover:bg-qv-accent-strong",
  danger: "border-qv-danger bg-qv-danger text-qv-on-accent hover:bg-qv-danger/90",
} as const;

export function IconButton({ children, className, tone = "neutral", type = "button", ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      className={classNames(
        "inline-flex size-qv-control items-center justify-center rounded-qv-md border transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-qv-standard active:translate-y-px motion-reduce:transition-none disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60",
        toneClassNames[tone],
        className,
      )}
      type={type}
    >
      {children}
    </button>
  );
}
