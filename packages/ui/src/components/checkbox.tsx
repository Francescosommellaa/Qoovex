"use client";

import { Check } from "@phosphor-icons/react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { useId, type ComponentPropsWithoutRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type CheckboxProps = ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  description?: string;
  label: string;
};

export function Checkbox({
  className,
  description,
  id,
  label,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const controlId = id ?? `qv-checkbox-${generatedId}`;
  const descriptionId = description ? `${controlId}-description` : undefined;

  return (
    <div className="qv-choice">
      <CheckboxPrimitive.Root
        aria-describedby={descriptionId}
        className={mergeClassNames("qv-checkbox", className)}
        id={controlId}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check aria-hidden="true" size={15} weight="bold" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
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
    </div>
  );
}
