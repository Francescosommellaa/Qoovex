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
  | "ghost"
  | "glass"
  | "destructive";

export type ButtonInteraction = "standard" | "magnetic";

type NativeButtonProps = ComponentPropsWithRef<"button">;

type StandardButtonProps = NativeButtonProps & {
  interaction?: "standard";
  variant?: ButtonVariant;
};

type MagneticButtonProps = NativeButtonProps & {
  interaction: "magnetic";
  variant?: Extract<ButtonVariant, "primary" | "glass">;
};

export type ButtonProps = StandardButtonProps | MagneticButtonProps;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
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

    const hoverMedia = window.matchMedia("(hover: hover)");
    const pointerMedia = window.matchMedia("(pointer: fine)");
    const reducedMotionMedia = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let animationFrame = 0;
    let listening = false;

    const schedulePosition = (x: number, y: number, active: boolean) => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        button.style.setProperty("--qv-magnetic-x", `${x.toFixed(2)}px`);
        button.style.setProperty("--qv-magnetic-y", `${y.toFixed(2)}px`);
        button.toggleAttribute("data-magnetic-active", active);
      });
    };

    const resetPosition = () => schedulePosition(0, 0, false);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = button.getBoundingClientRect();
      const proximity = 32;
      const isNear =
        event.clientX >= rect.left - proximity &&
        event.clientX <= rect.right + proximity &&
        event.clientY >= rect.top - proximity &&
        event.clientY <= rect.bottom + proximity;

      if (!isNear) {
        resetPosition();
        return;
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rangeX = rect.width / 2 + proximity;
      const rangeY = rect.height / 2 + proximity;
      const maxOffset = 6;
      const offsetX = Math.max(
        -maxOffset,
        Math.min(maxOffset, ((event.clientX - centerX) / rangeX) * maxOffset),
      );
      const offsetY = Math.max(
        -maxOffset,
        Math.min(maxOffset, ((event.clientY - centerY) / rangeY) * maxOffset),
      );

      schedulePosition(offsetX, offsetY, true);
    };

    const setListening = (shouldListen: boolean) => {
      if (shouldListen === listening) {
        return;
      }

      listening = shouldListen;
      if (shouldListen) {
        window.addEventListener("pointermove", handlePointerMove, {
          passive: true,
        });
      } else {
        window.removeEventListener("pointermove", handlePointerMove);
      }
    };

    const updateAvailability = () => {
      const enabled =
        hoverMedia.matches &&
        pointerMedia.matches &&
        !reducedMotionMedia.matches &&
        !disabled;

      if (enabled) {
        button.setAttribute("data-magnetic-enabled", "true");
      } else {
        button.removeAttribute("data-magnetic-enabled");
      }
      setListening(enabled);

      if (!enabled) {
        resetPosition();
      }
    };

    updateAvailability();
    hoverMedia.addEventListener("change", updateAvailability);
    pointerMedia.addEventListener("change", updateAvailability);
    reducedMotionMedia.addEventListener("change", updateAvailability);

    return () => {
      setListening(false);
      cancelAnimationFrame(animationFrame);
      hoverMedia.removeEventListener("change", updateAvailability);
      pointerMedia.removeEventListener("change", updateAvailability);
      reducedMotionMedia.removeEventListener("change", updateAvailability);
      button.removeAttribute("data-magnetic-active");
      button.removeAttribute("data-magnetic-enabled");
      button.style.removeProperty("--qv-magnetic-x");
      button.style.removeProperty("--qv-magnetic-y");
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
