"use client";

import * as React from "react";
import { CheckCircle, DotsSixVertical } from "@phosphor-icons/react";
import {
  FIELD_ROOT_CLASS,
  FIELD_STATUS_RING,
  FieldErrorTooltip,
  FieldHelperText,
  FieldLabel,
} from "./field-control";
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

function ResizeHandle() {
  return (
    <DotsSixVertical
      data-resize-handle
      size={12}
      weight="bold"
      aria-hidden="true"
      className="cursor-ns-resize shrink-0 text-(--color-text-faint) opacity-40"
    />
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
        <FieldErrorTooltip message={errorMessage} />
      ) : status === "success" ? (
        <CheckCircle
          size={13}
          className="text-(--color-success)"
          aria-hidden="true"
        />
      ) : null;

    return (
      <div className={FIELD_ROOT_CLASS}>
        {label ? (
          <FieldLabel htmlFor={inputId} srOnly={srOnlyLabel}>
            {label}
          </FieldLabel>
        ) : null}

        <div
          ref={wrapperRef}
          className={cn(
            "relative flex w-full flex-col overflow-hidden",
            "rounded-(--textarea-radius)",
            "bg-(--color-input-bg) border",
            "transition-[border-color,box-shadow]",
            "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
            FIELD_STATUS_RING[status],
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
              "px-(--textarea-px) pt-(--textarea-py)",
              "pb-(--spacing-2)",
              "text-(length:--text-sm) text-(--color-text)",
              "placeholder:text-(--color-input-placeholder)",
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
            className="sticky bottom-0 z-10 flex items-center justify-between px-(--textarea-px) pb-(--spacing-1)"
            aria-hidden="true"
          >
            <span
              className={[
                "text-(length:--text-xs) tabular-nums",
                !showCount
                  ? "invisible"
                  : status === "error"
                    ? "text-(--color-error)"
                    : status === "success"
                      ? "text-(--color-success)"
                      : "text-(--color-text-faint)",
              ].join(" ")}
            >
              {currentValue.length}
              {maxLength ? ` / ${maxLength}` : ""}
            </span>

            <span className="inline-flex h-4 items-center gap-(--spacing-2)">
              {statusNode}
              {variant === "fixed" ? <ResizeHandle /> : null}
            </span>
          </div>
        </div>

        {status === "error" && errorMessage ? (
          <FieldHelperText
            id={helperId}
            role="alert"
            live="polite"
            status="error"
            hideWhenHoverTooltip
          >
            {errorMessage}
          </FieldHelperText>
        ) : null}

        {status === "default" && helperText ? (
          <FieldHelperText id={helperId} status="default">
            {helperText}
          </FieldHelperText>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
