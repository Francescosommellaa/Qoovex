"use client";

import * as React from "react";
import { cn, mergeRefs } from "../lib/utils";

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxTone = "primary" | "success" | "warning" | "error";
export type CheckboxLabelPosition = "left" | "right";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: CheckboxSize;
  tone?: CheckboxTone;
  labelPosition?: CheckboxLabelPosition;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const SIZES: Record<CheckboxSize, string> = {
  sm: "qv-choice--sm",
  md: "qv-choice--md",
  lg: "qv-choice--lg",
};

const TONES: Record<CheckboxTone, string> = {
  primary: "qv-choice--tone-primary",
  success: "qv-choice--tone-success",
  warning: "qv-choice--tone-warning",
  error: "qv-choice--tone-error",
};

const LABEL_POSITIONS: Record<CheckboxLabelPosition, string> = {
  left: "qv-choice-field--label-left",
  right: "qv-choice-field--label-right",
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      description,
      size = "md",
      tone = "primary",
      labelPosition = "right",
      indeterminate = false,
      disabled,
      className,
      id,
      onChange,
      onCheckedChange,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;
    const descriptionId = description ? `${checkboxId}-description` : undefined;
    const describedBy = [ariaDescribedBy, descriptionId]
      .filter(Boolean)
      .join(" ");

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      onChange?.(event);

      if (event.defaultPrevented) {
        return;
      }

      onCheckedChange?.(event.currentTarget.checked);
    }

    const checkboxControl = (
      <span
        className={cn(
          "qv-choice qv-checkbox",
          SIZES[size],
          TONES[tone],
          className,
        )}
        data-disabled={disabled ? "true" : undefined}
      >
        <input
          ref={mergeRefs(inputRef, ref)}
          id={checkboxId}
          type="checkbox"
          disabled={disabled}
          aria-describedby={describedBy || undefined}
          className="qv-choice__input"
          onChange={handleChange}
          {...props}
        />
        <span className="qv-choice__control" aria-hidden="true" />
      </span>
    );

    if (!label && !description) {
      return checkboxControl;
    }

    return (
      <label
        className={cn("qv-choice-field", LABEL_POSITIONS[labelPosition])}
        data-disabled={disabled ? "true" : undefined}
      >
        {checkboxControl}
        <span className="qv-choice-field__copy">
          {label ? (
            <span className="qv-choice-field__label">{label}</span>
          ) : null}
          {description ? (
            <span id={descriptionId} className="qv-choice-field__description">
              {description}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
