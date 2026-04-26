"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import { cn, useControllableValue } from "../lib/utils";

export type ModalPlacement =
  | "responsive"
  | "center"
  | "bottom"
  | "top"
  | "left"
  | "right"
  | "fullscreen";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalTone = "neutral" | "primary" | "success" | "warning" | "error";
export type ModalScroll = "inside" | "outside";
export type ModalPadding = "none" | "sm" | "md" | "lg";
export type ModalRole = "dialog" | "alertdialog";
export type ModalHandleVisibility = "auto" | "always" | "never";
export type ModalSheetSnap = "peek" | "default" | "expanded";

export interface ModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  placement?: ModalPlacement;
  size?: ModalSize;
  tone?: ModalTone;
  scroll?: ModalScroll;
  role?: ModalRole;
  portal?: boolean;
  portalContainer?: HTMLElement | null;
  keepMounted?: boolean;
  dismissible?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  showHandle?: ModalHandleVisibility;
  sheetDrag?: boolean;
  defaultSheetSnap?: ModalSheetSnap;
  onSheetSnapChange?: (snap: ModalSheetSnap) => void;
  sheetHandleLabel?: string;
  closeLabel?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  finalFocusRef?: React.RefObject<HTMLElement | null>;
}

export interface ModalSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: ModalPadding;
}

export interface ModalTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
}

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface ModalCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface ModalContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  closeLabel: string;
  dismissible: boolean;
}

type ModalTriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  disabled?: boolean;
  "aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
  "aria-expanded"?: boolean;
};

type ModalRootStyle = React.CSSProperties & {
  "--modal-sheet-drag-offset"?: string;
};

const MODAL_EXIT_DELAY = 220;
const MODAL_SHEET_DRAG_THRESHOLD = 56;
const MODAL_MOBILE_MEDIA = "(max-width: 767px)";
const MODAL_SHEET_SNAP_ORDER: ModalSheetSnap[] = [
  "peek",
  "default",
  "expanded",
];

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const ModalContext = React.createContext<ModalContextValue | null>(null);

const PLACEMENTS: Record<ModalPlacement, string> = {
  responsive: "qv-modal--responsive",
  center: "qv-modal--center",
  bottom: "qv-modal--bottom",
  top: "qv-modal--top",
  left: "qv-modal--left",
  right: "qv-modal--right",
  fullscreen: "qv-modal--fullscreen",
};

const SIZES: Record<ModalSize, string> = {
  sm: "qv-modal--size-sm",
  md: "qv-modal--size-md",
  lg: "qv-modal--size-lg",
  xl: "qv-modal--size-xl",
  full: "qv-modal--size-full",
};

const TONES: Record<ModalTone, string> = {
  neutral: "qv-modal--tone-neutral",
  primary: "qv-modal--tone-primary",
  success: "qv-modal--tone-success",
  warning: "qv-modal--tone-warning",
  error: "qv-modal--tone-error",
};

const SCROLLS: Record<ModalScroll, string> = {
  inside: "qv-modal--scroll-inside",
  outside: "qv-modal--scroll-outside",
};

const SLOT_PADDING: Record<ModalPadding, string> = {
  none: "qv-modal__slot--padding-none",
  sm: "qv-modal__slot--padding-sm",
  md: "qv-modal__slot--padding-md",
  lg: "qv-modal__slot--padding-lg",
};

function useModalContext(componentName: string) {
  const context = React.useContext(ModalContext);

  if (!context) {
    throw new Error(`${componentName} must be used within Modal.`);
  }

  return context;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hasAttribute("disabled"))
    .filter((element) => element.getAttribute("aria-hidden") !== "true");
}

function getAdjacentSheetSnap(currentSnap: ModalSheetSnap, direction: "up" | "down") {
  const currentIndex = MODAL_SHEET_SNAP_ORDER.indexOf(currentSnap);
  const nextIndex =
    direction === "up"
      ? Math.min(currentIndex + 1, MODAL_SHEET_SNAP_ORDER.length - 1)
      : Math.max(currentIndex - 1, 0);

  return MODAL_SHEET_SNAP_ORDER[nextIndex];
}

function renderTrigger(
  trigger: React.ReactNode,
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  if (!React.isValidElement<ModalTriggerElementProps>(trigger)) {
    return trigger;
  }

  const triggerElement = trigger;

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    triggerElement.props.onClick?.(event);

    if (!event.defaultPrevented && !triggerElement.props.disabled) {
      setOpen(true);
    }
  }

  return React.cloneElement(triggerElement, {
    "aria-expanded": open,
    "aria-haspopup": "dialog",
    onClick: handleClick,
  });
}

export const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(
  function ModalClose(
    {
      children,
      className,
      onClick,
      type = "button",
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const { setOpen, closeLabel, dismissible } = useModalContext("ModalClose");

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
      onClick?.(event);

      if (!event.defaultPrevented && dismissible) {
        setOpen(false);
      }
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel ?? closeLabel}
        className={cn("qv-modal__close", className)}
        onClick={handleClick}
        {...props}
      >
        {children ?? <X weight="bold" aria-hidden="true" />}
      </button>
    );
  },
);

ModalClose.displayName = "ModalClose";

export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  function ModalTitle({ id, className, children, ...props }, ref) {
    const { titleId } = useModalContext("ModalTitle");

    return (
      <h2
        ref={ref}
        id={id ?? titleId}
        className={cn("qv-modal__title", className)}
        {...props}
      >
        {children}
      </h2>
    );
  },
);

ModalTitle.displayName = "ModalTitle";

export const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(function ModalDescription({ id, className, children, ...props }, ref) {
  const { descriptionId } = useModalContext("ModalDescription");

  return (
    <p
      ref={ref}
      id={id ?? descriptionId}
      className={cn("qv-modal__description", className)}
      {...props}
    >
      {children}
    </p>
  );
});

ModalDescription.displayName = "ModalDescription";

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalSlotProps>(
  function ModalHeader({ padding, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "qv-modal__slot qv-modal__header",
          padding ? SLOT_PADDING[padding] : undefined,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ModalHeader.displayName = "ModalHeader";

export const ModalBody = React.forwardRef<HTMLDivElement, ModalSlotProps>(
  function ModalBody({ padding, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "qv-modal__slot qv-modal__body",
          padding ? SLOT_PADDING[padding] : undefined,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ModalBody.displayName = "ModalBody";

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalSlotProps>(
  function ModalFooter({ padding, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "qv-modal__slot qv-modal__footer",
          padding ? SLOT_PADDING[padding] : undefined,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ModalFooter.displayName = "ModalFooter";

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    defaultOpen = false,
    onOpenChange,
    trigger,
    title,
    description,
    footer,
    placement = "responsive",
    size = "md",
    tone = "neutral",
    scroll = "inside",
    role = "dialog",
    portal = true,
    portalContainer,
    keepMounted = false,
    dismissible = true,
    closeOnEscape = true,
    closeOnOverlayClick = true,
    showCloseButton = true,
    showHandle = "auto",
    sheetDrag = true,
    defaultSheetSnap = "default",
    onSheetSnapChange,
    sheetHandleLabel = "Ridimensiona pannello",
    closeLabel = "Chiudi finestra",
    initialFocusRef,
    finalFocusRef,
    className,
    children,
    onKeyDown,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);
  const sheetDragStartYRef = React.useRef(0);
  const [mounted, setMounted] = React.useState(false);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [currentOpen, setCurrentOpen] = useControllableValue({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [present, setPresent] = React.useState(defaultOpen);
  const [sheetSnap, setSheetSnap] = React.useState<ModalSheetSnap>(defaultSheetSnap);
  const [sheetDragOffset, setSheetDragOffset] = React.useState(0);
  const [isSheetDragging, setIsSheetDragging] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(MODAL_MOBILE_MEDIA);

    function updateMobileViewport() {
      setIsMobileViewport(mediaQuery.matches);
    }

    updateMobileViewport();
    mediaQuery.addEventListener("change", updateMobileViewport);

    return () => mediaQuery.removeEventListener("change", updateMobileViewport);
  }, []);

  React.useEffect(() => {
    if (currentOpen) {
      setPresent(true);
      setSheetSnap(defaultSheetSnap);
      setSheetDragOffset(0);
      setIsSheetDragging(false);
      return undefined;
    }

    const removeTimer = setTimeout(() => setPresent(false), MODAL_EXIT_DELAY);

    return () => clearTimeout(removeTimer);
  }, [currentOpen, defaultSheetSnap]);

  React.useEffect(() => {
    if (!currentOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [currentOpen]);

  React.useEffect(() => {
    if (!currentOpen || !dismissible || !closeOnEscape) {
      return undefined;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setCurrentOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeOnEscape, currentOpen, dismissible, setCurrentOpen]);

  React.useEffect(() => {
    if (!currentOpen) {
      return undefined;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusFrame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const initialTarget =
        initialFocusRef?.current ?? getFocusableElements(dialog)[0] ?? dialog;

      initialTarget.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      const returnTarget = finalFocusRef?.current ?? previousActiveElementRef.current;

      if (returnTarget && document.contains(returnTarget)) {
        returnTarget.focus({ preventScroll: true });
      }
    };
  }, [currentOpen, finalFocusRef, initialFocusRef]);

  function closeModal() {
    if (dismissible) {
      setCurrentOpen(false);
    }
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);

    if (event.defaultPrevented || event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusableElements = getFocusableElements(dialog);

    if (focusableElements.length === 0) {
      event.preventDefault();
      dialog.focus({ preventScroll: true });
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus({ preventScroll: true });
    }
  }

  function updateSheetSnap(nextSnap: ModalSheetSnap) {
    setSheetSnap(nextSnap);
    onSheetSnapChange?.(nextSnap);
  }

  const isMobileSheet =
    isMobileViewport && (placement === "bottom" || placement === "responsive");
  const canDragSheet = sheetDrag && isMobileSheet;

  function handleSheetPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!canDragSheet || event.button !== 0) {
      return;
    }

    sheetDragStartYRef.current = event.clientY;
    setIsSheetDragging(true);
    setSheetDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSheetPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!canDragSheet || !isSheetDragging) {
      return;
    }

    const dragDistance = event.clientY - sheetDragStartYRef.current;
    const dragLimit = Math.max(window.innerHeight * 0.42, 160);
    const clampedDragDistance = Math.max(
      -dragLimit,
      Math.min(dragDistance, dragLimit),
    );

    event.preventDefault();
    setSheetDragOffset(clampedDragDistance);
  }

  function handleSheetPointerEnd(event: React.PointerEvent<HTMLButtonElement>) {
    if (!canDragSheet || !isSheetDragging) {
      return;
    }

    const dragDistance = event.clientY - sheetDragStartYRef.current;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsSheetDragging(false);
    setSheetDragOffset(0);

    if (Math.abs(dragDistance) < 8) {
      updateSheetSnap(sheetSnap === "expanded" ? "default" : "expanded");
      return;
    }

    if (dragDistance < -MODAL_SHEET_DRAG_THRESHOLD) {
      updateSheetSnap(getAdjacentSheetSnap(sheetSnap, "up"));
      return;
    }

    if (dragDistance > MODAL_SHEET_DRAG_THRESHOLD) {
      updateSheetSnap(getAdjacentSheetSnap(sheetSnap, "down"));
    }
  }

  const shouldRenderModal = keepMounted || present;
  const shouldRenderHeader = title || description || (showCloseButton && dismissible);
  const shouldRenderHandle = showHandle !== "never";
  const modalState = currentOpen ? "open" : "closed";
  const modalRootStyle: ModalRootStyle | undefined = canDragSheet
    ? { "--modal-sheet-drag-offset": `${sheetDragOffset}px` }
    : undefined;
  const context = React.useMemo<ModalContextValue>(
    () => ({
      open: currentOpen,
      setOpen: setCurrentOpen,
      titleId,
      descriptionId,
      closeLabel,
      dismissible,
    }),
    [closeLabel, currentOpen, descriptionId, dismissible, setCurrentOpen, titleId],
  );

  const modalContent = shouldRenderModal ? (
    <div
      className={cn(
        "qv-modal",
        PLACEMENTS[placement],
        SIZES[size],
        TONES[tone],
        SCROLLS[scroll],
      )}
      data-state={modalState}
      data-placement={placement}
      data-sheet-enabled={canDragSheet ? "true" : undefined}
      data-sheet-snap={canDragSheet ? sheetSnap : undefined}
      data-sheet-dragging={canDragSheet && isSheetDragging ? "true" : undefined}
      style={modalRootStyle}
      aria-hidden={!currentOpen || undefined}
    >
      {dismissible && closeOnOverlayClick ? (
        <button
          type="button"
          className="qv-modal__overlay"
          aria-label={closeLabel}
          onClick={closeModal}
        />
      ) : (
        <div className="qv-modal__overlay" aria-hidden="true" />
      )}

      <div className="qv-modal__positioner">
        <div
          ref={(node) => {
            dialogRef.current = node;

            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy ?? (title ? titleId : undefined)}
          aria-describedby={
            ariaDescribedBy ?? (description ? descriptionId : undefined)
          }
          tabIndex={-1}
          className={cn("qv-modal__content", className)}
          onKeyDown={handleDialogKeyDown}
          {...props}
        >
          {shouldRenderHandle ? (
            canDragSheet ? (
              <button
                type="button"
                className="qv-modal__handle"
                data-visibility={showHandle === "always" ? "always" : "auto"}
                aria-label={sheetHandleLabel}
                aria-valuetext={sheetSnap}
                onPointerDown={handleSheetPointerDown}
                onPointerMove={handleSheetPointerMove}
                onPointerUp={handleSheetPointerEnd}
                onPointerCancel={handleSheetPointerEnd}
              />
            ) : (
              <span
                className="qv-modal__handle"
                data-visibility={showHandle === "always" ? "always" : "auto"}
                aria-hidden="true"
              />
            )
          ) : null}

          {shouldRenderHeader ? (
            <ModalHeader>
              <div className="qv-modal__heading">
                {title ? <ModalTitle>{title}</ModalTitle> : null}
                {description ? (
                  <ModalDescription>{description}</ModalDescription>
                ) : null}
              </div>

              {showCloseButton && dismissible ? <ModalClose /> : null}
            </ModalHeader>
          ) : null}

          {children}

          {footer ? <ModalFooter>{footer}</ModalFooter> : null}
        </div>
      </div>
    </div>
  ) : null;

  const portalTarget =
    mounted && typeof document !== "undefined"
      ? (portalContainer ?? document.body)
      : null;

  return (
    <ModalContext.Provider value={context}>
      {trigger ? renderTrigger(trigger, currentOpen, setCurrentOpen) : null}
      {portal && portalTarget
        ? createPortal(modalContent, portalTarget)
        : modalContent}
    </ModalContext.Provider>
  );
});

Modal.displayName = "Modal";
