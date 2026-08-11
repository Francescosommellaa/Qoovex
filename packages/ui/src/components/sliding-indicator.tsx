"use client";

import * as React from "react";
import { cn } from "#lib/utils";

export type SlidingIndicatorState = {
  height: number;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  variant?: "default" | "destructive" | string;
};

export const hiddenSlidingIndicator: SlidingIndicatorState = {
  height: 0,
  visible: false,
  width: 0,
  x: 0,
  y: 0,
  variant: "default",
};

export type SlidingIndicatorContextValue = {
  indicator: SlidingIndicatorState;
  moveIndicator: (element: HTMLElement, variant?: "default" | "destructive" | string) => void;
  clearIndicator: () => void;
  containerRef: React.RefObject<HTMLElement | null>;
};

const SlidingIndicatorContext = React.createContext<SlidingIndicatorContextValue | null>(null);

export function useSlidingIndicator() {
  return React.useContext(SlidingIndicatorContext);
}

export function useSlidingIndicatorState(options?: {
  preventAutoHide?: boolean;
}) {
  const containerRef = React.useRef<HTMLElement | null>(null);
  const activeElementRef = React.useRef<HTMLElement | null>(null);
  const [indicator, setIndicator] = React.useState<SlidingIndicatorState>(hiddenSlidingIndicator);

  const moveIndicator = React.useCallback(
    (element: HTMLElement, variant: "default" | "destructive" | string = "default") => {
      const container = containerRef.current;
      if (!container) return;
      activeElementRef.current = element;
      const containerRect = container.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();
      setIndicator({
        height: elRect.height,
        visible: true,
        width: elRect.width,
        x: elRect.left - containerRect.left,
        y: elRect.top - containerRect.top,
        variant,
      });
    },
    []
  );

  const clearIndicator = React.useCallback(() => {
    activeElementRef.current = null;
    setIndicator((prev) => ({ ...prev, visible: false }));
  }, []);

  React.useEffect(() => {
    if (!indicator.visible || !activeElementRef.current) return;
    const handleResize = () => {
      if (activeElementRef.current) {
        moveIndicator(activeElementRef.current, indicator.variant);
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [indicator.visible, indicator.variant, moveIndicator]);

  React.useEffect(() => {
    // If we just turned off preventAutoHide, and the mouse is ALREADY outside
    // the container, we need to clear the indicator because onMouseLeave won't fire again.
    if (!options?.preventAutoHide && indicator.visible) {
      if (containerRef.current && !containerRef.current.matches(':hover')) {
        clearIndicator();
      }
    }
  }, [options?.preventAutoHide, indicator.visible, clearIndicator]);

  const handleMouseLeave = React.useCallback(() => {
    if (options?.preventAutoHide) return;
    clearIndicator();
  }, [options?.preventAutoHide, clearIndicator]);

  const handleBlur = React.useCallback(
    (event: React.FocusEvent) => {
      if (options?.preventAutoHide) return;
      if (
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return;
      }
      clearIndicator();
    },
    [options?.preventAutoHide, clearIndicator]
  );

  return {
    containerRef,
    indicator,
    moveIndicator,
    clearIndicator,
    handleMouseLeave,
    handleBlur,
  };
}

export function SlidingIndicatorProvider({
  value,
  children,
}: {
  value: SlidingIndicatorContextValue;
  children: React.ReactNode;
}) {
  return (
    <SlidingIndicatorContext.Provider value={value}>
      {children}
    </SlidingIndicatorContext.Provider>
  );
}

export function SlidingIndicatorContainer({
  children,
  className,
  preventAutoHide = false,
  onMouseLeave: onMouseLeaveProp,
  onBlur: onBlurProp,
  rounded = "default",
  showIndicator = true,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  preventAutoHide?: boolean;
  rounded?: "full" | "lg" | "md" | "sm" | "default";
  showIndicator?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const {
    containerRef,
    indicator,
    moveIndicator,
    clearIndicator,
    handleMouseLeave,
    handleBlur,
  } = useSlidingIndicatorState({ preventAutoHide });

  const ctxValue = React.useMemo<SlidingIndicatorContextValue>(
    () => ({
      indicator,
      moveIndicator,
      clearIndicator,
      containerRef,
    }),
    [indicator, moveIndicator, clearIndicator]
  );

  return (
    <SlidingIndicatorContext.Provider value={ctxValue}>
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={cn("relative", className)}
        onMouseLeave={(e) => {
          onMouseLeaveProp?.(e);
          handleMouseLeave();
        }}
        onBlur={(e) => {
          onBlurProp?.(e);
          handleBlur(e);
        }}
        {...props}
      >
        {showIndicator && <SlidingIndicator rounded={rounded} />}
        {children}
      </div>
    </SlidingIndicatorContext.Provider>
  );
}

export function SlidingIndicator({
  className,
  style,
  variant,
  rounded = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  rounded?: "full" | "lg" | "md" | "sm" | "default";
  variant?: "default" | "destructive" | string;
}) {
  const ctx = useSlidingIndicator();
  if (!ctx) return null;
  const { indicator } = ctx;

  const activeVariant = indicator.variant ?? variant ?? "default";

  const indicatorStyle: React.CSSProperties = {
    height: indicator.height,
    opacity: indicator.visible ? 1 : 0,
    transform: `translate3d(${indicator.x}px, ${indicator.y}px, 0)`,
    width: indicator.width,
    ...style,
  };

  const roundedClasses = {
    full: "rounded-full",
    lg: "rounded-lg",
    md: "rounded-md",
    sm: "rounded-sm",
    default: "rounded-lg",
  };

  return (
    <span
      aria-hidden="true"
      data-slot="sliding-indicator"
      data-variant={activeVariant}
      className={cn(
        "sliding-indicator",
        roundedClasses[rounded],
        className
      )}
      style={indicatorStyle}
      {...props}
    />
  );
}
