"use client";

import * as React from "react";
import { cn } from "#lib/utils";

import {
  useSlidingIndicatorState,
  SlidingIndicatorProvider,
  SlidingIndicator,
  type SlidingIndicatorContextValue,
} from "#components/sliding-indicator";

/* ─── Context ────────────────────────────────────────────────── */

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

type TabsListContextValue = {
  activeValue: string;
  moveHoverIndicator: (element: HTMLElement) => void;
  clearHoverIndicator: () => void;
};

const TabsListContext = React.createContext<TabsListContextValue | null>(null);

/**
 * Hook per accedere al contesto del `TabsList` corrente.
 * Utile per componenti figli che devono guidare l'indicatore
 * hover (ad esempio un DropdownMenuTrigger dentro una barra
 * di navigazione che condivide lo stesso indicatore).
 */
function useTabsList() {
  return React.useContext(TabsListContext);
}

/* ─── Utility ────────────────────────────────────────────────── */

function chainHandlers<E>(
  first?: ((event: E) => void) | null,
  second?: ((event: E) => void) | null,
): ((event: E) => void) | undefined {
  if (!first && !second) return undefined;
  if (!second) return first ?? undefined;
  if (!first) return second ?? undefined;
  return (event: E) => {
    first(event);
    second(event);
  };
}

/* ─── Tabs (Root) ────────────────────────────────────────────── */

/**
 * Root del componente Tabs. Gestisce lo stato del valore attivo
 * (controllato tramite `value` o non controllato tramite
 * `defaultValue`).
 */
function Tabs({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
  className,
  ...props
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue">) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const ctx = React.useMemo<TabsContextValue>(
    () => ({ value: currentValue, onValueChange: handleValueChange }),
    [currentValue, handleValueChange],
  );

  return (
    <TabsContext value={ctx}>
      <div data-slot="tabs" className={cn("flex flex-col gap-3", className)} {...props}>
        {children}
      </div>
    </TabsContext>
  );
}

/* ─── TabsList ───────────────────────────────────────────────── */

/**
 * Contenitore per i `TabsTrigger`. Include l'indicatore hover
 * che scorre tra le voci tramite `getBoundingClientRect` +
 * `translate3d`, con la stessa curva e durata della topbar di
 * navigazione (`260ms cubic-bezier(0.16, 1, 0.3, 1)`).
 *
 * Supporta la navigazione da tastiera WAI-ARIA (Freccia Sx/Dx, Home, End).
 */
function TabsList({
  children,
  className,
  activeValue: activeValueProp,
  preventHoverIndicatorAutoHide = false,
  onKeyDown: onKeyDownProp,
  onBlur: onBlurProp,
  onMouseLeave: onMouseLeaveProp,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  /** Valore attivo forzato dall'esterno (priorità su contesto). */
  activeValue?: string;
  /** Se `true`, mouse-leave e blur non nascondono l'indicatore. */
  preventHoverIndicatorAutoHide?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) {
  const tabsContext = React.useContext(TabsContext);
  const activeValue = activeValueProp ?? tabsContext?.value ?? "";

  const {
    containerRef,
    indicator,
    moveIndicator,
    clearIndicator,
    handleMouseLeave,
    handleBlur,
  } = useSlidingIndicatorState({ preventAutoHide: preventHoverIndicatorAutoHide });

  // Tastiera WAI-ARIA per tablist (Freccia Sx/Dx/Su/Giù, Home, End)
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;

      const list = containerRef.current;
      if (!list) return;
      const triggers = Array.from(
        list.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]:not([disabled])'),
      );
      if (triggers.length === 0) return;

      const currentIndex = triggers.findIndex((el) => el === document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = -1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        nextIndex = (currentIndex + 1) % triggers.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
      } else if (event.key === "Home") {
        event.preventDefault();
        nextIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        nextIndex = triggers.length - 1;
      }

      if (nextIndex !== -1 && triggers[nextIndex]) {
        triggers[nextIndex].focus();
        moveIndicator(triggers[nextIndex]);
      }
    },
    [moveIndicator, onKeyDownProp, containerRef],
  );

  const listCtx = React.useMemo<TabsListContextValue>(
    () => ({
      activeValue,
      moveHoverIndicator: moveIndicator,
      clearHoverIndicator: clearIndicator,
    }),
    [activeValue, moveIndicator, clearIndicator],
  );

  const slidingCtxValue = React.useMemo<SlidingIndicatorContextValue>(
    () => ({
      indicator,
      moveIndicator,
      clearIndicator,
      containerRef,
    }),
    [indicator, moveIndicator, clearIndicator, containerRef],
  );

  return (
    <TabsListContext value={listCtx}>
      <SlidingIndicatorProvider value={slidingCtxValue}>
        <div
          data-slot="tabs-list"
          role={tabsContext ? "tablist" : undefined}
          className={cn("relative flex items-center gap-1", className)}
          onBlur={(e) => {
            onBlurProp?.(e);
            handleBlur(e);
          }}
          onKeyDown={handleKeyDown}
          onMouseLeave={(e) => {
            onMouseLeaveProp?.(e);
            handleMouseLeave();
          }}
          ref={containerRef as React.RefObject<HTMLDivElement>}
          {...props}
        >
          <SlidingIndicator rounded="full" />
          {children}
        </div>
      </SlidingIndicatorProvider>
    </TabsListContext>
  );
}

/* ─── TabsTrigger ─────────────────────────────────────────────── */

/**
 * Singola voce di un `TabsList`. Renderizza le icone a sinistra
 * allineate al centro del testo con dimensione e spaziatura ottimali (`gap-1.5`, `size-3.5`).
 *
 * Per default renderizza un `<button>`. Con il prop `render` è possibile passare un
 * elemento diverso (ad es. `<a href="…" />` per la navigazione).
 */
function TabsTrigger({
  value,
  children,
  className,
  render,
  onClick: onClickProp,
  onFocus: onFocusProp,
  onMouseEnter: onMouseEnterProp,
  ...props
}: {
  value: string;
  children?: React.ReactNode;
  className?: string;
  /** Elemento polimorfico (es. `<a href />`) su cui fondere le props. */
  render?: React.ReactElement<Record<string, any>>;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">) {
  const tabsContext = React.useContext(TabsContext);
  const listContext = React.useContext(TabsListContext);
  const active = listContext ? listContext.activeValue === value : false;

  const computedClassName = cn(
    "relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer select-none",
    "text-muted-foreground transition-colors hover:text-foreground",
    "focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    active && "bg-foreground text-background hover:text-background focus-visible:text-background",
    className,
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      tabsContext?.onValueChange(value);
      onClickProp?.(event as React.MouseEvent<HTMLButtonElement>);
    },
    [tabsContext, value, onClickProp],
  );

  const handleFocus = React.useCallback(
    (event: React.FocusEvent) => {
      listContext?.moveHoverIndicator(event.currentTarget as HTMLElement);
      onFocusProp?.(event as React.FocusEvent<HTMLButtonElement>);
    },
    [listContext, onFocusProp],
  );

  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent) => {
      listContext?.moveHoverIndicator(event.currentTarget as HTMLElement);
      onMouseEnterProp?.(event as React.MouseEvent<HTMLButtonElement>);
    },
    [listContext, onMouseEnterProp],
  );

  // ─ Render polimorfico ─
  if (render) {
    const renderProps = render.props as Record<string, any>;
    return React.cloneElement(
      render,
      {
        "data-slot": "tabs-trigger",
        "data-active": active ? "" : undefined,
        className: cn(computedClassName, renderProps.className),
        onClick: chainHandlers(handleClick, renderProps.onClick),
        onFocus: chainHandlers(handleFocus, renderProps.onFocus),
        onMouseEnter: chainHandlers(handleMouseEnter, renderProps.onMouseEnter),
      } as React.HTMLAttributes<HTMLElement>,
      children ?? renderProps.children,
    );
  }

  // ─ Render <button> di default ─
  return (
    <button
      type="button"
      role={tabsContext ? "tab" : undefined}
      aria-selected={tabsContext ? active : undefined}
      data-slot="tabs-trigger"
      data-active={active ? "" : undefined}
      className={computedClassName}
      onClick={handleClick}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </button>
  );
}

/* ─── TabsContent ────────────────────────────────────────────── */

/**
 * Pannello di contenuto associato a un valore. Viene montato
 * solo quando il valore corrisponde al valore attivo del
 * contesto `<Tabs>`.
 */
function TabsContent({
  value,
  children,
  className,
  ...props
}: {
  value: string;
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const tabsContext = React.useContext(TabsContext);
  if (!tabsContext || tabsContext.value !== value) return null;

  return (
    <div
      role="tabpanel"
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none animate-in fade-in-0 duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Esportazioni ───────────────────────────────────────────── */

export { Tabs, TabsList, TabsTrigger, TabsContent, useTabsList };
