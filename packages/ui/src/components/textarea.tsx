"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export type TextareaStatus = "default" | "error" | "success";
export type TextareaVariant = "auto" | "fixed" | "static";

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style"
> {
  label?: string;
  helperText?: string;
  status?: TextareaStatus;
  variant?: TextareaVariant;
  maxRows?: number;
  showCount?: boolean;
  minLength?: number;
  srOnlyLabel?: boolean;
}

const STATUS_RING: Record<TextareaStatus, string> = {
  default:
    "border-[var(--color-input-border)] " +
    "focus-within:border-[var(--color-input-border-focus)] " +
    "focus-within:ring-2 focus-within:ring-[var(--color-primary-highlight)]",
  error:
    "border-[var(--color-input-border-error)] " +
    "ring-2 ring-[var(--color-error-highlight)]",
  success:
    "border-[var(--color-input-border-success)] " +
    "ring-2 ring-[var(--color-success-highlight)]",
};

const STATUS_HELPER: Record<TextareaStatus, string> = {
  default: "text-[var(--color-input-helper)]",
  error: "text-[var(--color-input-helper-error)]",
  success: "text-[var(--color-input-helper-success)]",
};

// ─── ResizeHandle ─────────────────────────────────────────────────

function ResizeHandle() {
  return (
    <svg
      data-resize-handle
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="currentColor"
      aria-hidden="true"
      className="cursor-ns-resize text-[var(--color-text-faint)] opacity-40 shrink-0"
    >
      <circle cx="3" cy="3" r="1" />
      <circle cx="7" cy="3" r="1" />
      <circle cx="3" cy="6" r="1" />
      <circle cx="7" cy="6" r="1" />
      <circle cx="3" cy="9" r="1" />
      <circle cx="7" cy="9" r="1" />
    </svg>
  );
}

// ─── ErrorTooltip ─────────────────────────────────────────────────

function ErrorTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <AlertCircle
        size={13}
        strokeWidth={2}
        className="text-[var(--color-error)] cursor-default"
        aria-hidden="true"
      />
      <span
        className={[
          "pointer-events-none absolute bottom-full right-0 mb-2",
          "hidden [@media(hover:hover)]:group-hover:flex",
          "items-center whitespace-nowrap",
          "rounded-[var(--radius-md)]",
          "bg-[var(--color-surface-offset)]",
          "border border-[var(--color-border)]",
          "px-[var(--spacing-2)] py-[var(--spacing-1)]",
          "text-[length:var(--text-xs)] text-[var(--color-text-muted)]",
          "shadow-[var(--shadow-md)]",
          "z-20",
        ].join(" ")}
      >
        {text}
        <span
          aria-hidden="true"
          className="absolute -bottom-1 right-2 size-2 rotate-45 border-b border-r border-[var(--color-border)] bg-[var(--color-surface-offset)]"
        />
      </span>
    </span>
  );
}

// ─── useAutoGrow ──────────────────────────────────────────────────

function useAutoGrow(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string | undefined,
  variant: TextareaVariant,
  maxRows: number,
) {
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || variant !== "auto") return;
    el.style.height = "auto";
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    const pt = parseFloat(getComputedStyle(el).paddingTop);
    const pb = parseFloat(getComputedStyle(el).paddingBottom);
    const maxH = lh * maxRows + pt + pb;
    const next = Math.min(el.scrollHeight, maxH);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden";
  }, [value, variant, maxRows, ref]);
}

// ─── useManualResize ──────────────────────────────────────────────
// Ridimensiona la <textarea> direttamente — non il wrapper

function useManualResize(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  variant: TextareaVariant,
) {
  React.useEffect(() => {
    if (variant !== "fixed") return;
    const wrapper = wrapperRef.current;
    const textarea = textareaRef.current;
    if (!wrapper || !textarea) return;

    const handle = wrapper.querySelector<HTMLElement>("[data-resize-handle]");
    if (!handle) return;

    let startY = 0;
    let startH = 0;

    function onMouseDown(e: MouseEvent) {
      startY = e.clientY;
      startH = textarea!.offsetHeight;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    }

    function onMouseMove(e: MouseEvent) {
      const next = Math.max(startH + (e.clientY - startY), 80);
      textarea!.style.height = `${next}px`;
      textarea!.style.overflowY = "auto";
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    handle.addEventListener("mousedown", onMouseDown);
    return () => handle.removeEventListener("mousedown", onMouseDown);
  }, [wrapperRef, textareaRef, variant]);
}

// ─── Textarea ────────────────────────────────────────────────────

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      helperText,
      status = "default",
      variant = "auto",
      maxRows = 8,
      showCount = false,
      minLength,
      srOnlyLabel = false,
      id,
      className = "",
      disabled,
      onChange,
      value,
      defaultValue,
      maxLength,
      ...props
    },
    forwardedRef,
  ) {
    const inputId = id ?? React.useId();
    const helperId = `${inputId}-helper`;

    const [internalValue, setInternalValue] = React.useState(
      (defaultValue as string) ?? "",
    );
    const controlled = value !== undefined;
    const currentValue = controlled ? (value as string) : internalValue;

    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const setRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        (
          innerRef as React.MutableRefObject<HTMLTextAreaElement | null>
        ).current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    useAutoGrow(innerRef, currentValue, variant, maxRows);
    useManualResize(wrapperRef, innerRef, variant);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      if (!controlled) setInternalValue(e.target.value);
      onChange?.(e);
    }

    const errorMessage =
      helperText ??
      (minLength ? `Digita almeno ${minLength} caratteri.` : undefined);

    const statusNode =
      status === "error" && errorMessage ? (
        <ErrorTooltip text={errorMessage} />
      ) : status === "success" ? (
        <CheckCircle2
          size={13}
          strokeWidth={2}
          className="text-[var(--color-success)]"
          aria-hidden="true"
        />
      ) : null;

    return (
      <div className="flex flex-col gap-[var(--input-gap)] w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={[
              "text-[length:var(--text-xs)] font-medium text-[var(--color-label)] " +
                "tracking-[0.03em] uppercase select-none",
              srOnlyLabel ? "sr-only" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {label}
          </label>
        )}

        {/* Wrapper */}
        <div
          ref={wrapperRef}
          className={[
            "relative flex flex-col w-full overflow-hidden",
            "rounded-[var(--textarea-radius)]",
            "bg-[var(--color-input-bg)] border",
            "transition-[border-color,box-shadow]",
            "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
            STATUS_RING[status],
            disabled ? "opacity-50 pointer-events-none" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Textarea */}
          <textarea
            ref={setRef}
            id={inputId}
            disabled={disabled}
            aria-describedby={helperId}
            aria-invalid={status === "error" || undefined}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            onChange={handleChange}
            className={[
              "w-full bg-transparent outline-none resize-none",
              "px-[var(--textarea-px)] pt-[var(--textarea-py)]",
              // padding bottom = altezza footer + respiro
              "pb-[var(--spacing-2)]",
              "text-[length:var(--text-sm)] text-[var(--color-text)]",
              "placeholder:text-[var(--color-input-placeholder)]",
              "leading-[var(--textarea-line-height)]",
              "disabled:cursor-not-allowed",
            ].join(" ")}
            style={{
              minHeight: "var(--textarea-min-height)",
              resize: "none",
              ...(variant === "static"
                ? { maxHeight: "var(--textarea-max-height)", overflowY: "auto" }
                : {}),
            }}
            {...props}
          />

          {/* Footer — layer 1: gradiente visivo */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-7 pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, var(--color-input-bg) 65%)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* Footer — layer 2: contenuto */}
          <div
            className="sticky bottom-0 z-10 flex items-center justify-between px-[var(--textarea-px)] pb-[var(--spacing-1)]"
            aria-hidden="true"
          >
            <span
              className={[
                "text-[length:var(--text-xs)] tabular-nums",
                !showCount
                  ? "invisible"
                  : status === "error"
                    ? "text-[var(--color-error)]"
                    : status === "success"
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-text-faint)]",
              ].join(" ")}
            >
              {currentValue.length}
              {maxLength ? ` / ${maxLength}` : ""}
            </span>

            <span className="inline-flex items-center gap-[var(--spacing-2)] h-4">
              {statusNode}
              {variant === "fixed" && <ResizeHandle />}
            </span>
          </div>
        </div>

        {/* Helper errore — solo mobile/touch */}
        {status === "error" && errorMessage && (
          <p
            id={helperId}
            role="alert"
            aria-live="polite"
            className={[
              "text-[length:var(--text-xs)]",
              STATUS_HELPER["error"],
              "[@media(hover:hover)]:hidden",
            ].join(" ")}
          >
            {errorMessage}
          </p>
        )}

        {/* Helper neutro */}
        {status === "default" && helperText && (
          <p
            id={helperId}
            className={[
              "text-[length:var(--text-xs)]",
              STATUS_HELPER["default"],
            ].join(" ")}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
