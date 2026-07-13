import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ButtonHTMLAttributes } from "react";
import { classNames } from "./class-names";
import { Icon } from "./Icon";

export type IconButtonProps = {
  "aria-label": string;
  icon: PhosphorIcon;
  tone?: "neutral" | "accent" | "danger";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const toneClassNames = {
  neutral: "border-qv-border bg-qv-surface text-qv-content hover:bg-qv-surface-muted",
  accent: "border-qv-accent bg-qv-accent text-qv-surface hover:bg-qv-accent-strong",
  danger: "border-qv-danger bg-qv-danger text-qv-surface hover:bg-qv-danger/90",
} as const;

export function IconButton({ className, icon, tone = "neutral", type = "button", ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      className={classNames(
        "inline-flex size-qv-control items-center justify-center rounded-qv-md border transition-colors duration-150 ease-qv-standard disabled:pointer-events-none disabled:opacity-60",
        toneClassNames[tone],
        className,
      )}
      type={type}
    >
      <Icon decorative icon={icon} weight="bold" />
    </button>
  );
}
