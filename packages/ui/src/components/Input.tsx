import { forwardRef, type InputHTMLAttributes } from "react";
import { classNames } from "./class-names";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      {...props}
      ref={ref}
      className={classNames(
        "min-h-qv-control w-full rounded-qv-sm border border-qv-border-strong bg-qv-surface px-qv-3 text-qv-content placeholder:text-qv-content-subtle disabled:cursor-not-allowed disabled:bg-qv-surface-muted disabled:opacity-70 aria-invalid:border-qv-danger",
        className,
      )}
    />
  );
});
