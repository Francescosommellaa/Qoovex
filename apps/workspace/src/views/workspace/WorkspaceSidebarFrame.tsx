"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Sidebar, SidebarProvider, useSidebar } from "@qoovex/ui/components/sidebar";

const DEFAULT_SIDEBAR_WIDTH = 256;
const MIN_SIDEBAR_WIDTH = 224;
const MAX_SIDEBAR_WIDTH = 360;
const MIN_CONTENT_WIDTH = 480;
const DESKTOP_BREAKPOINT = 768;
const SIDEBAR_WIDTH_STORAGE_KEY = "qoovex.workspace.sidebar-width.v1";

interface WorkspaceSidebarSizeContextValue {
  setWidth: (width: number) => void;
  width: number;
}

const WorkspaceSidebarSizeContext = createContext<WorkspaceSidebarSizeContextValue | null>(null);

function maxWidthForViewport() {
  if (typeof window === "undefined") return MAX_SIDEBAR_WIDTH;
  if (window.innerWidth < DESKTOP_BREAKPOINT) return MAX_SIDEBAR_WIDTH;
  return Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth - MIN_CONTENT_WIDTH));
}

function clampWidth(width: number) {
  return Math.min(maxWidthForViewport(), Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)));
}

export function WorkspaceSidebarProvider({ children, defaultOpen }: { children: ReactNode; defaultOpen: boolean }) {
  const [width, setWidthState] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [persistentOpen, setPersistentOpen] = useState(defaultOpen);
  const setWidth = useCallback((nextWidth: number) => {
    const clamped = clampWidth(nextWidth);
    setWidthState(clamped);
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(clamped));
  }, []);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
    if (Number.isFinite(stored) && stored > 0) setWidthState(clampWidth(stored));

    const keepWidthInViewport = () => setWidthState((current) => clampWidth(current));
    window.addEventListener("resize", keepWidthInViewport);
    return () => window.removeEventListener("resize", keepWidthInViewport);
  }, []);

  return (
    <WorkspaceSidebarSizeContext.Provider value={{ setWidth, width }}>
      <SidebarProvider
        className="h-dvh min-h-0! overflow-hidden bg-sidebar"
        onOpenChange={setPersistentOpen}
        open={persistentOpen}
        style={{ "--sidebar-width": `${width}px` } as CSSProperties}
      >
        {children}
      </SidebarProvider>
    </WorkspaceSidebarSizeContext.Provider>
  );
}

export function WorkspaceSidebarSurface({ children }: { children: ReactNode }) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      {children}
    </Sidebar>
  );
}

export function useWorkspaceSidebarWidth() {
  const size = useContext(WorkspaceSidebarSizeContext);
  if (!size) throw new Error("useWorkspaceSidebarWidth must be used within WorkspaceSidebarProvider.");
  return size.width;
}

export function WorkspaceSidebarResizeHandle() {
  const size = useContext(WorkspaceSidebarSizeContext);
  const { isMobile, state } = useSidebar();
  const drag = useRef<{ pointerId: number; startWidth: number; startX: number } | null>(null);
  const previousBodyStyles = useRef<{ cursor: string; userSelect: string } | null>(null);

  useEffect(() => () => {
    if (!previousBodyStyles.current) return;
    document.body.style.cursor = previousBodyStyles.current.cursor;
    document.body.style.userSelect = previousBodyStyles.current.userSelect;
  }, []);

  if (!size) throw new Error("WorkspaceSidebarResizeHandle must be used within WorkspaceSidebarProvider.");
  const sidebarSize = size;

  function finishResize(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    if (previousBodyStyles.current) {
      document.body.style.cursor = previousBodyStyles.current.cursor;
      document.body.style.userSelect = previousBodyStyles.current.userSelect;
      previousBodyStyles.current = null;
    }
  }

  if (isMobile || state !== "expanded") return null;

  return (
    <div
      aria-label="Ridimensiona navigazione"
      aria-orientation="vertical"
      aria-valuemax={maxWidthForViewport()}
      aria-valuemin={MIN_SIDEBAR_WIDTH}
      aria-valuenow={size.width}
      aria-valuetext={`${size.width} pixel`}
      className="absolute inset-y-2 -right-2 z-30 hidden w-4 touch-none cursor-col-resize items-center justify-center outline-none after:h-10 after:w-0.5 after:rounded-full after:bg-transparent hover:after:bg-sidebar-border focus-visible:after:bg-sidebar-ring md:flex"
      data-slot="workspace-sidebar-resize-handle"
      onDoubleClick={() => size.setWidth(DEFAULT_SIDEBAR_WIDTH)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") size.setWidth(size.width - 8);
        else if (event.key === "ArrowRight") size.setWidth(size.width + 8);
        else if (event.key === "Home") size.setWidth(MIN_SIDEBAR_WIDTH);
        else if (event.key === "End") size.setWidth(maxWidthForViewport());
        else return;
        event.preventDefault();
      }}
      onLostPointerCapture={finishResize}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.focus();
        drag.current = { pointerId: event.pointerId, startWidth: size.width, startX: event.clientX };
        previousBodyStyles.current = { cursor: document.body.style.cursor, userSelect: document.body.style.userSelect };
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
      }}
      onPointerMove={(event) => {
        if (drag.current?.pointerId !== event.pointerId) return;
        size.setWidth(drag.current.startWidth + event.clientX - drag.current.startX);
      }}
      onPointerUp={finishResize}
      role="separator"
      tabIndex={0}
      title="Trascina per ridimensionare. Doppio clic per ripristinare."
    />
  );
}
