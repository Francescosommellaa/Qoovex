"use client";

import * as React from "react";
import {
  CheckCircle,
  Info,
  Warning,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { cn } from "../lib/utils";

export type ToastVariant = "success" | "info" | "warning" | "error";
export type ToastPosition =
  | "top-right"
  | "top-center"
  | "bottom-right"
  | "bottom-center";

export interface ToastProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  closeLabel?: string;
  onDismiss?: () => void;
}

export interface ToastOptions {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  duration?: number;
  position?: ToastPosition;
}

export interface ToastApi {
  toast: (options: ToastOptions) => string;
  dismissToast: (id?: string) => void;
}

interface ToastRecord extends ToastOptions {
  id: string;
  open: boolean;
  duration: number;
}

const DEFAULT_TOAST_DURATION = 4200;
const DEFAULT_TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 260;

const ToastContext = React.createContext<ToastApi | null>(null);

const VARIANTS: Record<ToastVariant, string> = {
  success: "qv-toast--success",
  info: "qv-toast--info",
  warning: "qv-toast--warning",
  error: "qv-toast--error",
};

const DEFAULT_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle weight="bold" aria-hidden="true" />,
  info: <Info weight="bold" aria-hidden="true" />,
  warning: <Warning weight="bold" aria-hidden="true" />,
  error: <XCircle weight="bold" aria-hidden="true" />,
};

function createToastId() {
  return `toast-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function ToastItem({
  toast,
  onDismiss,
  onRemove,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  React.useEffect(() => {
    if (!toast.open) {
      const removeTimer = setTimeout(() => onRemove(toast.id), TOAST_REMOVE_DELAY);

      return () => clearTimeout(removeTimer);
    }

    if (toast.duration <= 0 || !Number.isFinite(toast.duration)) {
      return undefined;
    }

    const dismissTimer = setTimeout(() => onDismiss(toast.id), toast.duration);

    return () => clearTimeout(dismissTimer);
  }, [onDismiss, onRemove, toast.duration, toast.id, toast.open]);

  return (
    <Toast
      title={toast.title}
      description={toast.description}
      variant={toast.variant}
      icon={toast.icon}
      action={toast.action}
      open={toast.open}
      onDismiss={() => onDismiss(toast.id)}
    />
  );
}

function ToastViewport({
  toasts,
  position,
  onDismiss,
  onRemove,
}: {
  toasts: ToastRecord[];
  position: ToastPosition;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="qv-toast-viewport"
      data-position={position}
      role="region"
      aria-label="Notifiche"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export function ToastProvider({
  children,
  maxToasts = DEFAULT_TOAST_LIMIT,
  duration = DEFAULT_TOAST_DURATION,
  position = "top-right",
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

  const dismissToast = React.useCallback((id?: string) => {
    setToasts((currentToasts) =>
      currentToasts.map((toast) =>
        id === undefined || toast.id === id ? { ...toast, open: false } : toast,
      ),
    );
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? createToastId();
      const nextToast: ToastRecord = {
        ...options,
        id,
        open: true,
        variant: options.variant ?? "success",
        duration: options.duration ?? duration,
      };

      setToasts((currentToasts) => {
        const withoutDuplicate = currentToasts.filter((toast) => toast.id !== id);
        return [nextToast, ...withoutDuplicate].slice(0, maxToasts);
      });

      return id;
    },
    [duration, maxToasts],
  );

  const value = React.useMemo<ToastApi>(
    () => ({ toast, dismissToast }),
    [dismissToast, toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        toasts={toasts}
        position={position}
        onDismiss={dismissToast}
        onRemove={removeToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    title,
    description,
    variant = "success",
    icon,
    action,
    open = true,
    closeLabel = "Chiudi notifica",
    onDismiss,
    className,
    role,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role={role ?? (variant === "error" ? "alert" : "status")}
      aria-live={variant === "error" ? "assertive" : "polite"}
      data-state={open ? "open" : "closed"}
      className={cn("qv-toast", VARIANTS[variant], className)}
      {...props}
    >
      <span className="qv-toast__icon" aria-hidden="true">
        {icon ?? DEFAULT_ICONS[variant]}
      </span>

      <span className="qv-toast__content">
        <span className="qv-toast__title">{title}</span>
        {description ? (
          <span className="qv-toast__description">{description}</span>
        ) : null}
      </span>

      {action ? <span className="qv-toast__action">{action}</span> : null}

      {onDismiss ? (
        <button
          type="button"
          className="qv-toast__close"
          aria-label={closeLabel}
          onClick={onDismiss}
        >
          <X weight="bold" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

Toast.displayName = "Toast";
