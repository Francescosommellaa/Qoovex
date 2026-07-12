import { forwardRef, type InputHTMLAttributes } from "react";
import { classNames } from "./class-names";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      {...props}
      ref={ref}
      className={classNames(
        "min-h-qv-control w-full rounded-qv-md border border-qv-border bg-qv-surface px-qv-3 text-qv-content shadow-qv-sm placeholder:text-qv-content-muted disabled:cursor-not-allowed disabled:bg-qv-surface-muted disabled:opacity-70 aria-invalid:border-qv-danger",
        className,
      )}
    />
  );
});
