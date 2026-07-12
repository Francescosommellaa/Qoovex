import { forwardRef, type InputHTMLAttributes } from "react";
import { classNames } from "./class-names";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ className, ...props }, ref) {
  return (
    <input
      {...props}
      ref={ref}
      role="switch"
      type="checkbox"
      className={classNames("qv-switch", className)}
    />
  );
});
