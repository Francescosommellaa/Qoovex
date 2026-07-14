import { forwardRef, type InputHTMLAttributes } from "react";
import { classNames } from "./class-names";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ className, ...props }, ref) {
  return (
    <input
      {...props}
      ref={ref}
      type="checkbox"
      className={classNames("size-qv-5 rounded-qv-xs border-qv-border-strong text-qv-accent accent-qv-accent disabled:cursor-not-allowed disabled:opacity-60", className)}
    />
  );
});
