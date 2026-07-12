import { forwardRef, type SelectHTMLAttributes } from "react";
import { classNames } from "./class-names";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ children, className, ...props }, ref) {
  return (
    <select
      {...props}
      ref={ref}
      className={classNames(
        "min-h-qv-control w-full rounded-qv-md border border-qv-border bg-qv-surface px-qv-3 text-qv-content shadow-qv-sm disabled:cursor-not-allowed disabled:bg-qv-surface-muted disabled:opacity-70 aria-invalid:border-qv-danger",
        className,
      )}
    >
      {children}
    </select>
  );
});
