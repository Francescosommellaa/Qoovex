"use client";

import * as React from "react";
import { cn } from "@qoovex/ui";
import styles from "./workspace-scroll-area.module.css";

interface WorkspaceScrollAreaProps {
  children: React.ReactNode;
}

interface ScrollMetrics {
  hasOverflow: boolean;
  thumbHeight: number;
  thumbTop: number;
}

const MIN_THUMB_HEIGHT = 42;
const REVEAL_DURATION = 900;

function getScrollMetrics(viewport: HTMLElement, rail: HTMLElement) {
  const { clientHeight, scrollHeight, scrollTop } = viewport;
  const railHeight = rail.clientHeight;
  const hasOverflow = scrollHeight > clientHeight + 1;

  if (!hasOverflow || railHeight <= 0) {
    return { hasOverflow: false, thumbHeight: 0, thumbTop: 0 };
  }

  const thumbHeight = Math.max(
    MIN_THUMB_HEIGHT,
    Math.round((clientHeight / scrollHeight) * railHeight),
  );
  const maxScrollTop = scrollHeight - clientHeight;
  const maxThumbTop = railHeight - thumbHeight;
  const thumbTop =
    maxScrollTop > 0 ? Math.round((scrollTop / maxScrollTop) * maxThumbTop) : 0;

  return { hasOverflow, thumbHeight, thumbTop };
}

export function WorkspaceScrollArea({ children }: WorkspaceScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const railRef = React.useRef<HTMLDivElement>(null);
  const revealTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const dragStateRef = React.useRef<{
    pointerId: number;
    startY: number;
    startScrollTop: number;
  } | null>(null);
  const [metrics, setMetrics] = React.useState<ScrollMetrics>({
    hasOverflow: false,
    thumbHeight: 0,
    thumbTop: 0,
  });
  const [revealed, setRevealed] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  const updateMetrics = React.useCallback(() => {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (!viewport || !rail) return;

    setMetrics(getScrollMetrics(viewport, rail));
  }, []);

  const reveal = React.useCallback(() => {
    setRevealed(true);

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
    }

    revealTimerRef.current = setTimeout(() => {
      if (!dragStateRef.current) {
        setRevealed(false);
      }
    }, REVEAL_DURATION);
  }, []);

  React.useEffect(() => {
    updateMetrics();

    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (!viewport || !rail) return undefined;

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(viewport);
    resizeObserver.observe(rail);

    return () => resizeObserver.disconnect();
  }, [updateMetrics]);

  React.useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  function handleScroll() {
    updateMetrics();
    reveal();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    const viewport = viewportRef.current;
    if (!viewport || !metrics.hasOverflow || event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: viewport.scrollTop,
    };
    setDragging(true);
    setRevealed(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    const dragState = dragStateRef.current;
    if (!viewport || !rail || !dragState) return;

    const railTravel = rail.clientHeight - metrics.thumbHeight;
    const scrollTravel = viewport.scrollHeight - viewport.clientHeight;
    const deltaY = event.clientY - dragState.startY;
    const nextScrollTop =
      railTravel > 0
        ? dragState.startScrollTop + (deltaY / railTravel) * scrollTravel
        : dragState.startScrollTop;

    viewport.scrollTop = nextScrollTop;
    updateMetrics();
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    setDragging(false);
    reveal();
  }

  const showRail = metrics.hasOverflow && (revealed || dragging);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={viewportRef}
        className={cn(
          styles.viewport,
          "h-full overflow-y-auto overscroll-contain px-(--spacing-4) pb-(--spacing-6) pt-(--spacing-4) md:px-(--spacing-6) md:pb-(--spacing-8) lg:px-(--spacing-8)",
        )}
        onScroll={handleScroll}
      >
        {children}
      </div>

      <div
        ref={railRef}
        className={cn(
          styles.rail,
          "pointer-events-none absolute right-(--spacing-2) top-1/2 z-(--z-raised) hidden h-[min(22rem,calc(100%-var(--spacing-12)))] w-1.5 rounded-(--radius-full) bg-(--color-surface-offset)/45 md:block",
        )}
        data-visible={showRail ? "true" : "false"}
        aria-hidden={!metrics.hasOverflow}
      >
        {metrics.hasOverflow ? (
          <button
            type="button"
            className={cn(
              styles.thumb,
              "pointer-events-auto absolute left-1/2 w-1.5 -translate-x-1/2 cursor-grab rounded-(--radius-full) bg-(--color-text-muted)/55 outline-none hover:bg-(--color-text-muted) focus-visible:bg-(--color-text-muted) focus-visible:ring-2 focus-visible:ring-(--color-primary-highlight) active:cursor-grabbing",
            )}
            style={{
              height: metrics.thumbHeight,
              transform: `translateX(-50%) translateY(${metrics.thumbTop}px)`,
            }}
            data-dragging={dragging ? "true" : "false"}
            aria-label="Scorri contenuto"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          />
        ) : null}
      </div>
    </div>
  );
}
