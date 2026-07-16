"use client";

import * as React from "react";

const finePointerQuery = "(hover: hover) and (pointer: fine)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const forcedColorsQuery = "(forced-colors: active)";
const interactiveSelector =
  'a[href], button, summary, [role="button"], [data-cursor-label]';
const nativeCursorSelector =
  'input, textarea, select, option, [contenteditable="true"], [data-cursor-native]';

type CursorMode = "action" | "default" | "disabled" | "label" | "native";

function setMediaListener(query: MediaQueryList, listener: () => void) {
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function nativeCursorFor(element: Element) {
  if (
    element.matches(
      'textarea, [contenteditable="true"], input:not([type]), input[type="email"], input[type="number"], input[type="password"], input[type="search"], input[type="tel"], input[type="text"], input[type="url"]',
    )
  ) {
    return "text";
  }

  return "auto";
}

export function MarketingCursor({ pathnames }: { pathnames?: readonly string[] }) {
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const coreRef = React.useRef<HTMLSpanElement>(null);
  const haloRef = React.useRef<HTMLSpanElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);

  const pathnamesKey = pathnames?.join("\n") ?? "";

  React.useEffect(() => {
    const cursor = cursorRef.current;
    const core = coreRef.current;
    const halo = haloRef.current;
    const label = labelRef.current;
    if (!cursor || !core || !halo || !label) return;

    const root = document.documentElement;
    const finePointer = window.matchMedia(finePointerQuery);
    const reducedMotion = window.matchMedia(reducedMotionQuery);
    const forcedColors = window.matchMedia(forcedColorsQuery);
    const configuredPathnames = pathnamesKey ? pathnamesKey.split("\n") : null;
    const pointer = { x: -80, y: -80 };
    const follower = { x: -80, y: -80 };
    const previousPointer = { x: -80, y: -80 };
    let animationFrame = 0;
    let enabled = false;
    let lastFrame = performance.now();

    const routeIsActive = () =>
      configuredPathnames === null || configuredPathnames.includes(window.location.pathname);

    const setMode = (mode: CursorMode, nextLabel = "") => {
      cursor.dataset.mode = mode;
      label.textContent = nextLabel;
    };

    const updateIntent = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const nativeTarget = element?.closest(nativeCursorSelector);

      if (nativeTarget) {
        root.dataset.cursorNative = nativeCursorFor(nativeTarget);
        setMode("native");
        return;
      }

      delete root.dataset.cursorNative;
      const interactive = element?.closest(interactiveSelector);
      if (!interactive) {
        setMode("default");
        return;
      }

      const disabled =
        interactive.matches(":disabled") || interactive.getAttribute("aria-disabled") === "true";
      if (disabled) {
        setMode("disabled");
        return;
      }

      const cursorLabel = interactive.getAttribute("data-cursor-label")?.trim().slice(0, 12);
      setMode(cursorLabel ? "label" : "action", cursorLabel);
    };

    const render = (time: number) => {
      const delta = Math.min((time - lastFrame) / 1000, 0.05);
      lastFrame = time;
      const follow = 1 - Math.exp(-18 * delta);
      follower.x += (pointer.x - follower.x) * follow;
      follower.y += (pointer.y - follower.y) * follow;

      const velocityX = pointer.x - previousPointer.x;
      const velocityY = pointer.y - previousPointer.y;
      const speed = Math.min(Math.hypot(velocityX, velocityY), 18);
      const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
      const canDeform = cursor.dataset.mode !== "label";
      const stretch = canDeform ? 1 + speed * 0.009 : 1;
      const squash = 1 / stretch;

      core.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      halo.style.transform = `translate3d(${follower.x}px, ${follower.y}px, 0) translate(-50%, -50%) rotate(${canDeform ? angle : 0}deg) scale(${stretch}, ${squash})`;
      previousPointer.x = pointer.x;
      previousPointer.y = pointer.y;
      animationFrame = window.requestAnimationFrame(render);
    };

    const stop = () => {
      enabled = false;
      window.cancelAnimationFrame(animationFrame);
      cursor.dataset.enabled = "false";
      cursor.dataset.visible = "false";
      delete root.dataset.marketingCursor;
      delete root.dataset.cursorNative;
    };

    const start = () => {
      const shouldEnable =
        routeIsActive() && finePointer.matches && !reducedMotion.matches && !forcedColors.matches;
      if (!shouldEnable) {
        stop();
        return;
      }

      if (enabled) return;
      enabled = true;
      cursor.dataset.enabled = "true";
      root.dataset.marketingCursor = "active";
      lastFrame = performance.now();
      animationFrame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!routeIsActive()) {
        stop();
        return;
      }
      if (!enabled) start();
      if (!enabled) return;
      if (event.pointerType !== "mouse") {
        cursor.dataset.visible = "false";
        root.dataset.cursorNative = "auto";
        return;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (follower.x < 0 || follower.y < 0) {
        follower.x = event.clientX;
        follower.y = event.clientY;
        previousPointer.x = event.clientX;
        previousPointer.y = event.clientY;
      }
      cursor.dataset.visible = "true";
      updateIntent(event.target);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (enabled && event.pointerType === "mouse" && event.button === 0) {
        cursor.dataset.pressed = "true";
      }
    };

    const handlePointerUp = () => {
      cursor.dataset.pressed = "false";
    };

    const hide = () => {
      cursor.dataset.visible = "false";
      cursor.dataset.pressed = "false";
      delete root.dataset.cursorNative;
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) hide();
    };

    const handleVisibility = () => {
      if (document.hidden) hide();
    };

    const removeFinePointerListener = setMediaListener(finePointer, start);
    const removeReducedMotionListener = setMediaListener(reducedMotion, start);
    const removeForcedColorsListener = setMediaListener(forcedColors, start);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    window.addEventListener("pageshow", start);
    window.addEventListener("popstate", start);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      stop();
      removeFinePointerListener();
      removeReducedMotionListener();
      removeForcedColorsListener();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("pageshow", start);
      window.removeEventListener("popstate", start);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathnamesKey]);

  return (
    <div
      aria-hidden="true"
      className="marketing-cursor"
      data-enabled="false"
      data-mode="default"
      data-pressed="false"
      data-slot="marketing-cursor"
      data-visible="false"
      ref={cursorRef}
    >
      <span className="marketing-cursor__core" ref={coreRef} />
      <span className="marketing-cursor__halo" ref={haloRef}>
        <span className="marketing-cursor__label" ref={labelRef} />
        <span className="marketing-cursor__disabled-mark" />
      </span>
    </div>
  );
}
