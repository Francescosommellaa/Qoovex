import { forwardRef, type InputHTMLAttributes } from "react";
import { classNames } from "./class-names";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ className, ...props }, ref) {
  return (
    <input
      {...props}
      ref={ref}
      type="radio"
      className={classNames("size-qv-5 border-qv-border text-qv-accent accent-qv-accent disabled:cursor-not-allowed disabled:opacity-60", className)}
    />
  );
});
