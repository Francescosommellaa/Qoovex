"use client";

import {
  createContext,
  useContext,
  useId,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";

import { mergeClassNames } from "./merge-class-names";

export type FieldStatus = "default" | "error" | "success";

type FieldContextValue = {
  controlId: string;
  describedBy?: string;
  status: FieldStatus;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export type FieldProps = ComponentPropsWithRef<"div"> & {
  children: ReactNode;
  controlId?: string;
  description?: string;
  label: string;
  message?: string;
  optional?: boolean;
  status?: FieldStatus;
};

export function useFieldControl(id?: string) {
  const field = useContext(FieldContext);
  return {
    "aria-describedby": field?.describedBy,
    "aria-invalid": field?.status === "error" ? true : undefined,
    id: id ?? field?.controlId,
  };
}

export function Field({
  children,
  className,
  controlId,
  description,
  label,
  message,
  optional,
  status = "default",
  ...props
}: FieldProps) {
  const generatedId = useId();
  const id = controlId ?? `qv-field-${generatedId}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const messageId = message ? `${id}-message` : undefined;
  const describedBy =
    [descriptionId, messageId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ controlId: id, describedBy, status }}>
      <div
        className={mergeClassNames("qv-field", className)}
        data-status={status}
        {...props}
      >
        <label className="qv-field__label" htmlFor={id}>
          {label}
          {optional ? <span>Opzionale</span> : null}
        </label>
        {description ? (
          <p className="qv-field__description" id={descriptionId}>
            {description}
          </p>
        ) : null}
        {children}
        {message ? (
          <p
            className="qv-field__message"
            id={messageId}
            role={status === "error" ? "alert" : undefined}
          >
            {message}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
