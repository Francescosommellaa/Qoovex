"use client";

import * as React from "react";

import { PREFERS_REDUCED_MOTION_QUERY } from "#lib/motion";

const finePointerQuery = "(hover: hover) and (pointer: fine)";
const forcedColorsQuery = "(forced-colors: active)";
const interactiveSelector =
  'a[href], button, summary, [role="button"], [data-cursor-label]';
const nativeCursorSelector =
  'input, textarea, select, option, [contenteditable="true"], [data-cursor-native]';
const magneticSelector = '[data-cursor-magnetic="true"]';
const magneticBlockingSurfaceSelector = [
  "header",
  '[role="dialog"]',
  '[role="menu"]',
  '[data-slot="dropdown-menu-content"]',
  '[data-slot="popover-content"]',
].join(", ");
const magneticDistance = 12;
const magneticMaximumStrength = 0.14;
const magneticMaximumOffset = 3;
const magneticTargetRefreshInterval = 500;

type CursorMode = "action" | "default" | "disabled" | "label" | "native";
type Point = { x: number; y: number };
type MagneticPoint = Point & { active: boolean; target: HTMLElement | null };

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

function elementBelongsToTarget(target: HTMLElement, element: Element | null) {
  return element === target || (element !== null && target.contains(element));
}

function magneticTargetIsExposed(pointer: Point, target: HTMLElement, rect: DOMRect) {
  const pointerElement = document.elementFromPoint(pointer.x, pointer.y);
  if (!pointerElement) return false;

  if (!elementBelongsToTarget(target, pointerElement)) {
    const blockingSurface = pointerElement.closest(magneticBlockingSurfaceSelector);
    const competingAction = pointerElement.closest(interactiveSelector);
    if (
      (blockingSurface && !blockingSurface.contains(target)) ||
      (competingAction && !elementBelongsToTarget(target, competingAction))
    ) {
      return false;
    }
  }

  const samplePoints = [
    { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 },
    { x: rect.left + rect.width * 0.2, y: rect.top + rect.height * 0.5 },
    { x: rect.left + rect.width * 0.8, y: rect.top + rect.height * 0.5 },
    { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.2 },
    { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.8 },
  ];

  return samplePoints.every(({ x, y }) => {
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return false;
    return elementBelongsToTarget(target, document.elementFromPoint(x, y));
  });
}

function resolveMagneticPoint(pointer: Point, targets: readonly HTMLElement[]): MagneticPoint {
  let nearest: { target: HTMLElement; rect: DOMRect; distance: number } | null = null;

  for (const target of targets) {
    if (
      !target.isConnected ||
      target.getAttribute("data-cursor-magnetic") === "false" ||
      target.matches(":disabled") ||
      target.getAttribute("aria-disabled") === "true"
    ) {
      continue;
    }

    const rect = target.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const distanceX = Math.max(rect.left - pointer.x, 0, pointer.x - rect.right);
    const distanceY = Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom);
    const distance = Math.hypot(distanceX, distanceY);
    if (distance > magneticDistance || (nearest && distance >= nearest.distance)) continue;

    nearest = { target, rect, distance };
  }

  if (!nearest) return { ...pointer, active: false, target: null };
  if (!magneticTargetIsExposed(pointer, nearest.target, nearest.rect)) {
    return { ...pointer, active: false, target: null };
  }

  const center = {
    x: nearest.rect.left + nearest.rect.width / 2,
    y: nearest.rect.top + nearest.rect.height / 2,
  };
  const distanceToCenter = Math.hypot(center.x - pointer.x, center.y - pointer.y);
  const influenceRadius = Math.hypot(nearest.rect.width / 2, nearest.rect.height / 2) + magneticDistance;
  const proximity = 1 - Math.min(distanceToCenter / influenceRadius, 1);
  const strength = magneticMaximumStrength * proximity;
  const rawOffset = {
    x: (center.x - pointer.x) * strength,
    y: (center.y - pointer.y) * strength,
  };
  const offsetMagnitude = Math.hypot(rawOffset.x, rawOffset.y);
  const offsetLimit = offsetMagnitude > magneticMaximumOffset
    ? magneticMaximumOffset / offsetMagnitude
    : 1;

  return {
    x: pointer.x + rawOffset.x * offsetLimit,
    y: pointer.y + rawOffset.y * offsetLimit,
    active: true,
    target: nearest.target,
  };
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
    const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY);
    const forcedColors = window.matchMedia(forcedColorsQuery);
    const configuredPathnames = pathnamesKey ? pathnamesKey.split("\n") : null;
    const pointer = { x: -80, y: -80 };
    const follower = { x: -80, y: -80 };
    const previousPointer = { x: -80, y: -80 };
    let magneticPoint: MagneticPoint = { x: -80, y: -80, active: false, target: null };
    let magneticTargets: HTMLElement[] = [];
    let magneticPointIsDirty = true;
    let magneticTargetsRefreshedAt = 0;
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

    const refreshMagneticTargets = () => {
      magneticTargets = Array.from(document.querySelectorAll<HTMLElement>(magneticSelector));
      magneticTargetsRefreshedAt = performance.now();
      magneticPointIsDirty = true;
    };

    const markMagneticPointDirty = () => {
      magneticPointIsDirty = true;
    };

    const render = (time: number) => {
      if (magneticPointIsDirty) {
        magneticPoint = resolveMagneticPoint(pointer, magneticTargets);
        magneticPointIsDirty = false;
        updateIntent(
          magneticPoint.target ?? document.elementFromPoint(pointer.x, pointer.y),
        );
        const magneticState = magneticPoint.active ? "true" : "false";
        if (cursor.dataset.magnetic !== magneticState) {
          follower.x = magneticPoint.x;
          follower.y = magneticPoint.y;
          previousPointer.x = magneticPoint.x;
          previousPointer.y = magneticPoint.y;
          cursor.dataset.magnetic = magneticState;
        }
      }

      const delta = Math.min((time - lastFrame) / 1000, 0.05);
      lastFrame = time;
      const follow = 1 - Math.exp(-18 * delta);
      follower.x += (magneticPoint.x - follower.x) * follow;
      follower.y += (magneticPoint.y - follower.y) * follow;

      const velocityX = magneticPoint.x - previousPointer.x;
      const velocityY = magneticPoint.y - previousPointer.y;
      const speed = Math.min(Math.hypot(velocityX, velocityY), 18);
      const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
      const canDeform = cursor.dataset.mode !== "label";
      const stretch = canDeform ? 1 + speed * 0.009 : 1;
      const squash = 1 / stretch;

      core.style.transform = `translate3d(${magneticPoint.x}px, ${magneticPoint.y}px, 0) translate(-50%, -50%)`;
      halo.style.transform = `translate3d(${follower.x}px, ${follower.y}px, 0) translate(-50%, -50%) rotate(${canDeform ? angle : 0}deg) scale(${stretch}, ${squash})`;
      previousPointer.x = magneticPoint.x;
      previousPointer.y = magneticPoint.y;
      animationFrame = window.requestAnimationFrame(render);
    };

    const stop = () => {
      enabled = false;
      window.cancelAnimationFrame(animationFrame);
      cursor.dataset.enabled = "false";
      cursor.dataset.visible = "false";
      cursor.dataset.magnetic = "false";
      delete root.dataset.marketingCursor;
      delete root.dataset.cursorNative;
    };

    const start = () => {
      refreshMagneticTargets();
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
      if (performance.now() - magneticTargetsRefreshedAt >= magneticTargetRefreshInterval) {
        refreshMagneticTargets();
      }
      magneticPointIsDirty = true;
      if (follower.x < 0 || follower.y < 0) {
        follower.x = event.clientX;
        follower.y = event.clientY;
        previousPointer.x = event.clientX;
        previousPointer.y = event.clientY;
      }
      cursor.dataset.visible = "true";
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
      cursor.dataset.magnetic = "false";
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
    window.addEventListener("scroll", markMagneticPointDirty, { passive: true });
    window.addEventListener("resize", markMagneticPointDirty, { passive: true });
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
      window.removeEventListener("scroll", markMagneticPointDirty);
      window.removeEventListener("resize", markMagneticPointDirty);
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
      data-magnetic="false"
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
