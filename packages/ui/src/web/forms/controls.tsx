"use client";

import type {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cx } from "../primitives/utils";
import { useFieldControl } from "./field-context";

export type FormControlSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  ref?: Ref<HTMLInputElement>;
  size?: FormControlSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Input({
  ref,
  size = "md",
  startIcon,
  endIcon,
  fullWidth = true,
  className,
  id,
  required,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const fieldProps = useFieldControl({ id, required, disabled, "aria-invalid": ariaInvalid, "aria-describedby": ariaDescribedBy });
  return (
    <span className="qv-control" data-size={size} data-full-width={fullWidth || undefined}>
      {startIcon ? <span className="qv-control__icon" data-position="start" aria-hidden="true">{startIcon}</span> : null}
      <input ref={ref} className={cx("qv-control__input", className)} {...fieldProps} {...props} />
      {endIcon ? <span className="qv-control__icon" data-position="end" aria-hidden="true">{endIcon}</span> : null}
    </span>
  );
}

export interface NumberInputProps extends Omit<InputProps, "type" | "onValueChange"> {
  onValueChange?: (value: number | null, event: ChangeEvent<HTMLInputElement>) => void;
}

export function NumberInput({ onChange, onValueChange, inputMode = "decimal", ...props }: NumberInputProps) {
  return (
    <Input
      type="number"
      inputMode={inputMode}
      onChange={(event) => {
        onChange?.(event);
        const value = event.currentTarget.valueAsNumber;
        onValueChange?.(event.currentTarget.value === "" || !Number.isFinite(value) ? null : value, event);
      }}
      {...props}
    />
  );
}

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> {
  ref?: Ref<HTMLTextAreaElement>;
  size?: FormControlSize;
  minRows?: number;
  resize?: "vertical" | "none";
  fullWidth?: boolean;
}

export function Textarea({
  ref,
  size = "md",
  minRows = 4,
  resize = "vertical",
  fullWidth = true,
  className,
  id,
  required,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  const fieldProps = useFieldControl({ id, required, disabled, "aria-invalid": ariaInvalid, "aria-describedby": ariaDescribedBy });
  return <textarea ref={ref} rows={minRows} className={cx("qv-textarea", className)} data-size={size} data-resize={resize} data-full-width={fullWidth || undefined} {...fieldProps} {...props} />;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  ref?: Ref<HTMLSelectElement>;
  size?: FormControlSize;
  fullWidth?: boolean;
  placeholder?: string;
}

export function Select({
  ref,
  size = "md",
  fullWidth = true,
  placeholder,
  className,
  id,
  required,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  children,
  ...props
}: SelectProps) {
  const fieldProps = useFieldControl({ id, required, disabled, "aria-invalid": ariaInvalid, "aria-describedby": ariaDescribedBy });
  return (
    <select ref={ref} className={cx("qv-select", className)} data-size={size} data-full-width={fullWidth || undefined} {...fieldProps} {...props}>
      {placeholder ? <option value="" disabled>{placeholder}</option> : null}
      {children}
    </select>
  );
}
