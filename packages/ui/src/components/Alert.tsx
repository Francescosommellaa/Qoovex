import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type AlertTone = "info" | "positive" | "warning" | "danger";
export type AlertProps = { children: ReactNode; title?: string; tone?: AlertTone } & HTMLAttributes<HTMLDivElement>;

const toneClassNames: Record<AlertTone, string> = {
  info: "border-qv-info/25 bg-qv-info-soft text-qv-info",
  positive: "border-qv-positive/25 bg-qv-positive-soft text-qv-positive",
  warning: "border-qv-warning/25 bg-qv-warning-soft text-qv-warning",
  danger: "border-qv-danger/25 bg-qv-danger-soft text-qv-danger",
};

export function Alert({ children, className, title, tone = "info", ...props }: AlertProps) {
  return (
    <div {...props} className={classNames("rounded-qv-md border p-qv-4", toneClassNames[tone], className)} role={tone === "danger" ? "alert" : "status"}>
      {title ? <p className="m-0 font-semibold">{title}</p> : null}
      <div className={classNames(title && "mt-qv-2")}>{children}</div>
    </div>
  );
}
