"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import { useId, type ComponentPropsWithoutRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type SwitchProps = ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
> & {
  description?: string;
  label: string;
};

export function Switch({
  className,
  description,
  id,
  label,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const controlId = id ?? `qv-switch-${generatedId}`;
  const descriptionId = description ? `${controlId}-description` : undefined;

  return (
    <div className="qv-switch-row">
      <div>
        <label className="qv-choice__label" htmlFor={controlId}>
          {label}
        </label>
        {description ? (
          <p className="qv-choice__description" id={descriptionId}>
            {description}
          </p>
        ) : null}
      </div>
      <SwitchPrimitive.Root
        aria-describedby={descriptionId}
        className={mergeClassNames("qv-switch", className)}
        id={controlId}
        {...props}
      >
        <SwitchPrimitive.Thumb className="qv-switch__thumb" />
      </SwitchPrimitive.Root>
    </div>
  );
}
