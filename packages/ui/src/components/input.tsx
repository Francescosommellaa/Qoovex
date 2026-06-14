"use client";

import type { ComponentPropsWithRef } from "react";

import { useFieldControl } from "./field";
import { mergeClassNames } from "./merge-class-names";

export type InputProps = ComponentPropsWithRef<"input">;

export function Input({ className, id, ...props }: InputProps) {
  const fieldProps = useFieldControl(id);

  return (
    <input
      className={mergeClassNames("qv-control", "qv-input", className)}
      {...fieldProps}
      {...props}
    />
  );
}
