import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type FieldProps = {
  children: ReactNode;
  description?: string;
  error?: string;
  htmlFor?: string;
  label: string;
  required?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function Field({ children, className, description, error, htmlFor, label, required, ...props }: FieldProps) {
  return (
    <div {...props} className={classNames("grid gap-qv-2", className)}>
      <label className="font-medium text-qv-content" htmlFor={htmlFor}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {description ? <p className="m-0 text-sm text-qv-content-muted">{description}</p> : null}
      {children}
      {error ? <p className="m-0 text-sm text-qv-danger" role="alert">{error}</p> : null}
    </div>
  );
}
