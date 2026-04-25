"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type RadioSize = "sm" | "md" | "lg";
export type RadioTone = "primary" | "success" | "warning" | "error";
export type RadioLabelPosition = "left" | "right";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: RadioSize;
  tone?: RadioTone;
  labelPosition?: RadioLabelPosition;
  onCheckedChange?: (checked: boolean) => void;
}

const SIZES: Record<RadioSize, string> = {
  sm: "qv-choice--sm",
  md: "qv-choice--md",
  lg: "qv-choice--lg",
};

const TONES: Record<RadioTone, string> = {
  primary: "qv-choice--tone-primary",
  success: "qv-choice--tone-success",
  warning: "qv-choice--tone-warning",
  error: "qv-choice--tone-error",
};

const LABEL_POSITIONS: Record<RadioLabelPosition, string> = {
  left: "qv-choice-field--label-left",
  right: "qv-choice-field--label-right",
};

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(
    {
      label,
      description,
      size = "md",
      tone = "primary",
      labelPosition = "right",
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
    const generatedId = React.useId();
    const radioId = id ?? generatedId;
    const descriptionId = description ? `${radioId}-description` : undefined;
    const describedBy = [ariaDescribedBy, descriptionId]
      .filter(Boolean)
      .join(" ");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      onChange?.(event);

      if (event.defaultPrevented) {
        return;
      }

      onCheckedChange?.(event.currentTarget.checked);
    }

    const radioControl = (
      <span
        className={cn(
          "qv-choice qv-radio",
          SIZES[size],
          TONES[tone],
          className,
        )}
        data-disabled={disabled ? "true" : undefined}
      >
        <input
          ref={ref}
          id={radioId}
          type="radio"
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
      return radioControl;
    }

    return (
      <label
        className={cn("qv-choice-field", LABEL_POSITIONS[labelPosition])}
        data-disabled={disabled ? "true" : undefined}
      >
        {radioControl}
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

Radio.displayName = "Radio";
