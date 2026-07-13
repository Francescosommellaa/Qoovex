import { cloneElement, type HTMLAttributes, type ReactElement } from "react";
import { classNames } from "./class-names";

export type FieldProps = {
  children: ReactElement<FieldControlProps>;
  description?: string;
  error?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

type FieldControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  id?: string;
  required?: boolean;
};

export function Field({ children, className, description, error, htmlFor, label, required, ...props }: FieldProps) {
  const descriptionId = description ? `${htmlFor}-description` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [children.props["aria-describedby"], descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const control = cloneElement(children, {
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : children.props["aria-invalid"],
    "aria-required": required ? true : children.props["aria-required"],
    id: children.props.id ?? htmlFor,
    required: required ?? children.props.required,
  });
  return (
    <div {...props} className={classNames("grid gap-qv-2", className)}>
      <label className="font-medium text-qv-content" htmlFor={htmlFor}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {description ? <p className="m-0 text-sm text-qv-content-muted" id={descriptionId}>{description}</p> : null}
      {control}
      {error ? <p className="m-0 text-sm font-medium text-qv-danger" id={errorId}>{error}</p> : null}
    </div>
  );
}
