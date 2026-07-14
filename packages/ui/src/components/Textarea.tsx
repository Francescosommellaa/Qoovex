import { forwardRef, type TextareaHTMLAttributes } from "react";
import { classNames } from "./class-names";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      {...props}
      ref={ref}
      className={classNames(
        "min-h-qv-field-tall w-full resize-y rounded-qv-sm border border-qv-border-strong bg-qv-surface px-qv-3 py-qv-3 text-qv-content placeholder:text-qv-content-subtle disabled:cursor-not-allowed disabled:bg-qv-surface-muted disabled:opacity-70 aria-invalid:border-qv-danger",
        className,
      )}
    />
  );
});
