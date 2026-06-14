"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type Ref,
} from "react";

import { mergeClassNames } from "./merge-class-names";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "destructive";
export type ButtonInteraction = "standard" | "magnetic";

type NativeButtonProps = ComponentPropsWithRef<"button">;
type StandardButtonProps = NativeButtonProps & {
  interaction?: "standard";
  variant?: ButtonVariant;
};
type MagneticButtonProps = NativeButtonProps & {
  interaction: "magnetic";
  variant?: "primary";
};

export type ButtonProps = StandardButtonProps | MagneticButtonProps;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export function Button({
  className,
  disabled,
  interaction = "standard",
  ref,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const setButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  useEffect(() => {
    const button = buttonRef.current;
    if (!button || interaction !== "magnetic") {
      return;
    }

    const hover = window.matchMedia("(hover: hover)");
    const pointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        button.style.removeProperty("--qv-magnetic-x");
        button.style.removeProperty("--qv-magnetic-y");
        button.removeAttribute("data-magnetic-active");
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = button.getBoundingClientRect();
      const proximity = 32;
      const near =
        event.clientX >= rect.left - proximity &&
        event.clientX <= rect.right + proximity &&
        event.clientY >= rect.top - proximity &&
        event.clientY <= rect.bottom + proximity;

      if (!near) {
        reset();
        return;
      }

      const x =
        ((event.clientX - (rect.left + rect.width / 2)) /
          (rect.width / 2 + proximity)) *
        6;
      const y =
        ((event.clientY - (rect.top + rect.height / 2)) /
          (rect.height / 2 + proximity)) *
        6;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        button.style.setProperty(
          "--qv-magnetic-x",
          `${Math.max(-6, Math.min(6, x)).toFixed(2)}px`,
        );
        button.style.setProperty(
          "--qv-magnetic-y",
          `${Math.max(-6, Math.min(6, y)).toFixed(2)}px`,
        );
        button.setAttribute("data-magnetic-active", "");
      });
    };

    const update = () => {
      const enabled =
        hover.matches &&
        pointer.matches &&
        !reducedMotion.matches &&
        !disabled;

      button.toggleAttribute("data-magnetic-enabled", enabled);
      window.removeEventListener("pointermove", handlePointerMove);
      if (enabled) {
        window.addEventListener("pointermove", handlePointerMove, {
          passive: true,
        });
      } else {
        reset();
      }
    };

    update();
    hover.addEventListener("change", update);
    pointer.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      hover.removeEventListener("change", update);
      pointer.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, [disabled, interaction]);

  return (
    <button
      className={mergeClassNames("qv-button", className)}
      data-interaction={interaction}
      data-variant={variant}
      disabled={disabled}
      ref={setButtonRef}
      type={type}
      {...props}
    />
  );
}
