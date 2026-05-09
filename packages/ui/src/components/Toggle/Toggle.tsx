"use client";

import * as React from "react";
import { cn, useControllableValue } from "../../lib/utils";

export type ToggleSize = "sm" | "md" | "lg";
export type ToggleTone = "primary" | "success" | "warning" | "error";
export type ToggleLabelPosition = "left" | "right";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: ToggleSize;
  tone?: ToggleTone;
  label?: React.ReactNode;
  description?: React.ReactNode;
  labelPosition?: ToggleLabelPosition;
  iconChecked?: React.ReactNode;
  iconUnchecked?: React.ReactNode;
}

const SIZES: Record<ToggleSize, string> = {
  sm: "qv-toggle--sm",
  md: "qv-toggle--md",
  lg: "qv-toggle--lg",
};

const TONES: Record<ToggleTone, string> = {
  primary: "qv-toggle--tone-primary",
  success: "qv-toggle--tone-success",
  warning: "qv-toggle--tone-warning",
  error: "qv-toggle--tone-error",
};

const LABEL_POSITIONS: Record<ToggleLabelPosition, string> = {
  left: "qv-toggle-field--label-left",
  right: "qv-toggle-field--label-right",
};

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      size = "md",
      tone = "primary",
      label,
      description,
      labelPosition = "right",
      iconChecked,
      iconUnchecked,
      disabled,
      className,
      onClick,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const switchingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const generatedId = React.useId();
    const toggleId = id ?? generatedId;
    const labelId = label ? `${toggleId}-label` : undefined;
    const descriptionId = description ? `${toggleId}-description` : undefined;
    const [currentChecked, setCurrentChecked] = useControllableValue({
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });

    React.useEffect(() => {
      return () => {
        if (switchingTimeoutRef.current) {
          clearTimeout(switchingTimeoutRef.current);
        }
      };
    }, []);

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
      onClick?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      if (switchingTimeoutRef.current) {
        clearTimeout(switchingTimeoutRef.current);
      }

      const toggleElement = event.currentTarget;
      toggleElement.dataset.switching = "true";
      switchingTimeoutRef.current = setTimeout(() => {
        toggleElement.removeAttribute("data-switching");
      }, 220);

      setCurrentChecked(!currentChecked);
    }

    const hasIcons = Boolean(iconChecked || iconUnchecked);

    const toggleControl = (
      <button
        ref={ref}
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={currentChecked}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (!ariaLabel ? labelId : undefined)}
        aria-describedby={ariaDescribedBy ?? descriptionId}
        disabled={disabled}
        data-state={currentChecked ? "checked" : "unchecked"}
        className={cn("qv-toggle", SIZES[size], TONES[tone], className)}
        onClick={handleClick}
        {...props}
      >
        <span className="qv-toggle__thumb" aria-hidden="true">
          {hasIcons ? (
            <>
              <span className="qv-toggle__icon qv-toggle__icon--unchecked">
                {iconUnchecked}
              </span>
              <span className="qv-toggle__icon qv-toggle__icon--checked">
                {iconChecked}
              </span>
            </>
          ) : null}
        </span>
      </button>
    );

    if (!label && !description) {
      return toggleControl;
    }

    return (
      <span className={cn("qv-toggle-field", LABEL_POSITIONS[labelPosition])}>
        {toggleControl}
        <span className="qv-toggle-field__copy">
          {label ? (
            <span id={labelId} className="qv-toggle-field__label">
              {label}
            </span>
          ) : null}
          {description ? (
            <span id={descriptionId} className="qv-toggle-field__description">
              {description}
            </span>
          ) : null}
        </span>
      </span>
    );
  },
);

Toggle.displayName = "Toggle";
