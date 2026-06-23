"use client";

import { useEffect, useId, type HTMLAttributes, type LabelHTMLAttributes, type Ref } from "react";

import { cx } from "../primitives/utils";
import { useFieldContext } from "./field-context";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  ref?: Ref<HTMLLabelElement>;
}

export function Label({ ref, htmlFor, className, children, ...props }: LabelProps) {
  const field = useFieldContext();
  return (
    <label ref={ref} htmlFor={htmlFor ?? field?.controlId} className={cx("qv-label", className)} {...props}>
      <span>{children}</span>
      {field?.required ? <span className="qv-label__required" aria-hidden="true">*</span> : null}
    </label>
  );
}

interface FieldMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
}

function useDescriptionId(kind: "hint" | "error", providedId?: string) {
  const field = useFieldContext();
  const generatedId = useId().replace(/:/g, "");
  const id = providedId ?? (field ? `${field.controlId}-${kind}` : `qv-field-${kind}-${generatedId}`);
  const registerDescription = field?.registerDescription;

  useEffect(() => registerDescription?.(kind, id), [id, kind, registerDescription]);
  return id;
}

export type FieldHintProps = FieldMessageProps;

export function FieldHint({ ref, id: providedId, className, ...props }: FieldHintProps) {
  const id = useDescriptionId("hint", providedId);
  return <p ref={ref} id={id} className={cx("qv-field__hint", className)} {...props} />;
}

export type FieldErrorProps = FieldMessageProps;

export function FieldError({ ref, id: providedId, className, role = "alert", ...props }: FieldErrorProps) {
  const id = useDescriptionId("error", providedId);
  return <p ref={ref} id={id} role={role} className={cx("qv-field__error", className)} {...props} />;
}

export { Field, type FieldLayout, type FieldProps } from "./field-context";
