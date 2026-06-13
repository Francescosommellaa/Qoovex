import type { ComponentPropsWithRef } from "react";

import { mergeClassNames } from "./merge-class-names";

export type InputStatus = "default" | "error" | "success";

export type InputProps = Omit<ComponentPropsWithRef<"input">, "id"> & {
  id: string;
  label: string;
  description?: string;
  message?: string;
  status?: InputStatus;
};

export function Input({
  className,
  description,
  id,
  label,
  message,
  status = "default",
  ...props
}: InputProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const messageId = message ? `${id}-message` : undefined;
  const describedBy =
    [descriptionId, messageId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="qv-field" data-status={status}>
      <label className="qv-field__label" htmlFor={id}>
        {label}
      </label>
      {description ? (
        <p className="qv-field__description" id={descriptionId}>
          {description}
        </p>
      ) : null}
      <input
        aria-describedby={describedBy}
        aria-invalid={status === "error" ? true : undefined}
        className={mergeClassNames("qv-input", className)}
        id={id}
        {...props}
      />
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
  );
}
