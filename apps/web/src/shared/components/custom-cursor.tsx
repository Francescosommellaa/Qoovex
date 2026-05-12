"use client";

import { useEffect, useRef, useState } from "react";

const interactiveSelector = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[data-cursor]",
].join(",");

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastTrailRef = useRef(0);
  const ringPositionRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopWidth = window.matchMedia("(min-width: 768px)");

    function syncEnabled() {
      setIsEnabled(finePointer.matches && desktopWidth.matches && !reducedMotion.matches);
    }

    syncEnabled();
    finePointer.addEventListener("change", syncEnabled);
    reducedMotion.addEventListener("change", syncEnabled);
    desktopWidth.addEventListener("change", syncEnabled);

    return () => {
      finePointer.removeEventListener("change", syncEnabled);
      reducedMotion.removeEventListener("change", syncEnabled);
      desktopWidth.removeEventListener("change", syncEnabled);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("qv-custom-cursor-enabled", isEnabled);

    if (!isEnabled) {
      return () => {
        document.documentElement.classList.remove("qv-custom-cursor-enabled");
      };
    }

    function render() {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) return;

      ringPositionRef.current.x += (pointerRef.current.x - ringPositionRef.current.x) * 0.22;
      ringPositionRef.current.y += (pointerRef.current.y - ringPositionRef.current.y) * 0.22;

      dot.style.transform = `translate3d(${pointerRef.current.x}px, ${pointerRef.current.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringPositionRef.current.x}px, ${ringPositionRef.current.y}px, 0) translate(-50%, -50%)`;
      frameRef.current = window.requestAnimationFrame(render);
    }

    function addTrail(x: number, y: number) {
      const trailRoot = trailRef.current;
      const now = performance.now();
      if (!trailRoot || now - lastTrailRef.current < 38) return;

      lastTrailRef.current = now;
      const mark = document.createElement("span");
      mark.className = "qv-custom-cursor__trail";
      mark.style.left = `${x}px`;
      mark.style.top = `${y}px`;
      trailRoot.appendChild(mark);
      window.setTimeout(() => mark.remove(), 460);
    }

    function handlePointerMove(event: PointerEvent) {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      addTrail(event.clientX, event.clientY);
    }

    function handlePointerOver(event: PointerEvent) {
      const target = event.target;
      setIsInteractive(target instanceof Element && Boolean(target.closest(interactiveSelector)));
    }

    function handlePointerOut(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest(interactiveSelector)) {
        setIsInteractive(false);
      }
    }

    function handlePointerDown() {
      setIsPressed(true);
    }

    function handlePointerUp() {
      setIsPressed(false);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      document.documentElement.classList.remove("qv-custom-cursor-enabled");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          html.qv-custom-cursor-enabled,
          html.qv-custom-cursor-enabled * {
            cursor: none !important;
          }

          .qv-custom-cursor {
            position: fixed;
            inset: 0;
            z-index: var(--z-overlay);
            pointer-events: none;
          }

          .qv-custom-cursor__dot,
          .qv-custom-cursor__ring {
            position: fixed;
            left: 0;
            top: 0;
            pointer-events: none;
            will-change: transform;
          }

          .qv-custom-cursor__dot {
            width: 0.35rem;
            height: 0.35rem;
            border-radius: var(--radius-full);
            background: var(--color-text);
            opacity: 0.82;
            transition:
              opacity var(--duration-fast) var(--ease-qoovex),
              width var(--duration-fast) var(--ease-qoovex),
              height var(--duration-fast) var(--ease-qoovex);
          }

          .qv-custom-cursor__ring {
            width: 1.85rem;
            height: 1.85rem;
            border: 1px solid oklch(from var(--color-text) l c h / 0.34);
            border-radius: var(--radius-full);
            transition:
              width var(--duration-base) var(--ease-qoovex),
              height var(--duration-base) var(--ease-qoovex),
              border-color var(--duration-base) var(--ease-qoovex),
              background var(--duration-base) var(--ease-qoovex);
          }

          .qv-custom-cursor[data-interactive="true"] .qv-custom-cursor__ring {
            width: 3rem;
            height: 3rem;
            border-color: oklch(from var(--color-primary) l c h / 0.62);
            background: var(--color-primary-highlight);
          }

          .qv-custom-cursor[data-pressed="true"] .qv-custom-cursor__dot {
            width: 0.55rem;
            height: 0.55rem;
            opacity: 1;
          }

          .qv-custom-cursor[data-pressed="true"] .qv-custom-cursor__ring {
            width: 1.35rem;
            height: 1.35rem;
            border-color: var(--color-primary);
          }

          .qv-custom-cursor__trail {
            position: fixed;
            width: 0.42rem;
            height: 0.42rem;
            border-radius: var(--radius-full);
            background: var(--color-primary);
            opacity: 0.28;
            pointer-events: none;
            transform: translate(-50%, -50%) scale(1);
            animation: qv-cursor-trail 460ms var(--ease-qoovex) forwards;
          }

          @keyframes qv-cursor-trail {
            to {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.16);
            }
          }
        }
      `}</style>
      <div
        className="qv-custom-cursor"
        data-interactive={isInteractive}
        data-pressed={isPressed}
        aria-hidden="true"
      >
        <div ref={trailRef} />
        <div ref={ringRef} className="qv-custom-cursor__ring" />
        <div ref={dotRef} className="qv-custom-cursor__dot" />
      </div>
    </>
  );
}
