"use client";

import type { ComponentPropsWithRef } from "react";

import { useFieldControl } from "./field";
import { mergeClassNames } from "./merge-class-names";

export type TextareaProps = ComponentPropsWithRef<"textarea">;

export function Textarea({ className, id, ...props }: TextareaProps) {
  const fieldProps = useFieldControl(id);

  return (
    <textarea
      className={mergeClassNames("qv-control", "qv-textarea", className)}
      {...fieldProps}
      {...props}
    />
  );
}
