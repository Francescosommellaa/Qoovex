"use client";

import * as React from "react";
import {
  Warning,
  CheckCircle,
  DotsSixVertical,
} from "@phosphor-icons/react";
import { cn, mergeRefs } from "../lib/utils";

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

function ResizeHandle() {
  return (
    <DotsSixVertical
      data-resize-handle
      size={12}
      weight="bold"
      aria-hidden="true"
      className="cursor-ns-resize shrink-0 text-[var(--color-text-faint)] opacity-40"
    />
  );
}

function ErrorTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <Warning
        size={13}
        className="cursor-default text-[var(--color-error)]"
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

function useAutoGrow(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string | undefined,
  variant: TextareaVariant,
  maxRows: number,
) {
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element || variant !== "auto") return;

    element.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
    const paddingTop = parseFloat(getComputedStyle(element).paddingTop);
    const paddingBottom = parseFloat(getComputedStyle(element).paddingBottom);
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;
    const nextHeight = Math.min(element.scrollHeight, maxHeight);

    element.style.height = `${nextHeight}px`;
    element.style.overflowY =
      element.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, variant, maxRows, ref]);
}

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
    const textareaElement = textarea;

    const handle = wrapper.querySelector<HTMLElement>("[data-resize-handle]");
    if (!handle) return;

    let startY = 0;
    let startHeight = 0;

    function onMouseDown(event: MouseEvent) {
      // Resize the textarea itself so the wrapper layout stays stable.
      startY = event.clientY;
      startHeight = textareaElement.offsetHeight;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      event.preventDefault();
    }

    function onMouseMove(event: MouseEvent) {
      const nextHeight = Math.max(startHeight + (event.clientY - startY), 80);
      textareaElement.style.height = `${nextHeight}px`;
      textareaElement.style.overflowY = "auto";
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    handle.addEventListener("mousedown", onMouseDown);
    return () => handle.removeEventListener("mousedown", onMouseDown);
  }, [wrapperRef, textareaRef, variant]);
}

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
    const textareaRef = mergeRefs(innerRef, forwardedRef);

    useAutoGrow(innerRef, currentValue, variant, maxRows);
    useManualResize(wrapperRef, innerRef, variant);

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
      if (!controlled) {
        setInternalValue(event.target.value);
      }

      onChange?.(event);
    }

    const errorMessage =
      helperText ??
      (minLength ? `Digita almeno ${minLength} caratteri.` : undefined);

    const statusNode =
      status === "error" && errorMessage ? (
        <ErrorTooltip text={errorMessage} />
      ) : status === "success" ? (
        <CheckCircle
          size={13}
          className="text-[var(--color-success)]"
          aria-hidden="true"
        />
      ) : null;

    return (
      <div className="flex w-full flex-col gap-[var(--input-gap)]">
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              "text-[length:var(--text-xs)] font-medium text-[var(--color-label)] tracking-[0.03em] uppercase select-none",
              srOnlyLabel && "sr-only",
            )}
          >
            {label}
          </label>
        ) : null}

        <div
          ref={wrapperRef}
          className={cn(
            "relative flex w-full flex-col overflow-hidden",
            "rounded-[var(--textarea-radius)]",
            "bg-[var(--color-input-bg)] border",
            "transition-[border-color,box-shadow]",
            "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
            STATUS_RING[status],
            disabled && "opacity-50 pointer-events-none",
            className,
          )}
        >
          <textarea
            ref={textareaRef}
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

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-7"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, var(--color-input-bg) 65%)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

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

            <span className="inline-flex h-4 items-center gap-[var(--spacing-2)]">
              {statusNode}
              {variant === "fixed" ? <ResizeHandle /> : null}
            </span>
          </div>
        </div>

        {status === "error" && errorMessage ? (
          <p
            id={helperId}
            role="alert"
            aria-live="polite"
            className={cn(
              "text-[length:var(--text-xs)]",
              STATUS_HELPER.error,
              "[@media(hover:hover)]:hidden",
            )}
          >
            {errorMessage}
          </p>
        ) : null}

        {status === "default" && helperText ? (
          <p
            id={helperId}
            className={cn(
              "text-[length:var(--text-xs)]",
              STATUS_HELPER.default,
            )}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
