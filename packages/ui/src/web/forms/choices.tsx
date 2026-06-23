"use client";

import type { InputHTMLAttributes, Ref } from "react";

import { cx } from "../primitives/utils";
import { useFieldControl } from "./field-context";

interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "role"> {
  ref?: Ref<HTMLInputElement>;
}

function ChoiceControl({ type, role, ref, className, id, required, disabled, "aria-invalid": ariaInvalid, "aria-describedby": ariaDescribedBy, ...props }: ChoiceProps & { type: "checkbox" | "radio"; role?: "switch" }) {
  const fieldProps = useFieldControl({ id, required, disabled, "aria-invalid": ariaInvalid, "aria-describedby": ariaDescribedBy });
  return (
    <span className="qv-choice" data-control={role ?? type}>
      <input ref={ref} type={type} role={role} className={cx("qv-choice__input", className)} {...fieldProps} {...props} />
      <span className="qv-choice__indicator" aria-hidden="true" />
    </span>
  );
}

export type CheckboxProps = ChoiceProps;
export function Checkbox(props: CheckboxProps) {
  return <ChoiceControl type="checkbox" {...props} />;
}

export type RadioProps = ChoiceProps;
export function Radio(props: RadioProps) {
  return <ChoiceControl type="radio" {...props} />;
}

export type SwitchProps = ChoiceProps;
export function Switch(props: SwitchProps) {
  return <ChoiceControl type="checkbox" role="switch" {...props} />;
}
