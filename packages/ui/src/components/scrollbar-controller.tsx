"use client";

import * as React from "react";

const ACTIVE_TIMEOUT_MS = 900;
const VIEWPORT_EDGE_PX = 20;

function scrollTarget(target: EventTarget | null) {
  if (
    target instanceof Element &&
    target !== document.documentElement &&
    target !== document.body
  ) {
    return target;
  }

  return document.documentElement;
}

export function ScrollbarController() {
  React.useEffect(() => {
    const root = document.documentElement;
    const timers = new Map<Element, number>();

    root.setAttribute("data-scrollbar-controller", "ready");

    const activate = (element: Element) => {
      element.setAttribute("data-scrollbar-active", "true");

      const currentTimer = timers.get(element);
      if (currentTimer !== undefined) window.clearTimeout(currentTimer);

      const timer = window.setTimeout(() => {
        element.removeAttribute("data-scrollbar-active");
        timers.delete(element);
      }, ACTIVE_TIMEOUT_MS);
      timers.set(element, timer);
    };

    const handleScroll = (event: Event) => activate(scrollTarget(event.target));
    const handleWindowScroll = () => activate(root);

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        root.removeAttribute("data-scrollbar-edge");
        return;
      }

      const nearRightEdge = window.innerWidth - event.clientX <= VIEWPORT_EDGE_PX;
      const nearBottomEdge = window.innerHeight - event.clientY <= VIEWPORT_EDGE_PX;

      if (nearRightEdge || nearBottomEdge) {
        root.setAttribute("data-scrollbar-edge", "true");
      } else {
        root.removeAttribute("data-scrollbar-edge");
      }
    };

    const clearEdge = () => root.removeAttribute("data-scrollbar-edge");

    document.addEventListener("scroll", handleScroll, true);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", clearEdge);
    document.addEventListener("visibilitychange", clearEdge);

    return () => {
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", clearEdge);
      document.removeEventListener("visibilitychange", clearEdge);
      clearEdge();
      root.removeAttribute("data-scrollbar-controller");

      for (const [element, timer] of timers) {
        window.clearTimeout(timer);
        element.removeAttribute("data-scrollbar-active");
      }
      timers.clear();
    };
  }, []);

  return null;
}
