"use client";

import * as React from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import {
  FIELD_ROOT_CLASS,
  FIELD_TRIGGER_STATUS_RING,
  FieldHelperText,
  FieldLabel,
} from "../FieldControl";
import { cn, useControllableValue } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export type SelectItem = SelectOption | SelectGroup;
export type SelectSize = "sm" | "md" | "lg";
export type SelectStatus = "default" | "error" | "success";

// Single
export interface SelectSingleProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

// Multi
export interface SelectMultiProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  maxSelected?: number;
}

export type SelectProps = {
  options: SelectItem[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  status?: SelectStatus;
  size?: SelectSize;
  disabled?: boolean;
  srOnlyLabel?: boolean;
  showSelectedCount?: boolean;
  id?: string;
  name?: string;
  className?: string;
} & (SelectSingleProps | SelectMultiProps);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isGroup(item: SelectItem): item is SelectGroup {
  return "options" in item;
}

function flatOptions(items: SelectItem[]): SelectOption[] {
  return items.flatMap((item) => (isGroup(item) ? item.options : [item]));
}

function findOption(
  items: SelectItem[],
  value: string,
): SelectOption | undefined {
  return flatOptions(items).find((o) => o.value === value);
}

// ─── Static maps ──────────────────────────────────────────────────────────────

const TRIGGER_SIZE: Record<SelectSize, string> = {
  sm: "min-h-(--input-height-sm) text-(length:--text-xs)",
  md: "min-h-(--input-height-md) text-(length:--text-sm)",
  lg: "min-h-(--input-height-lg) text-(length:--text-base)",
};

const OPTION_SIZE: Record<SelectSize, string> = {
  sm: "min-h-(--input-height-sm) text-(length:--text-xs)",
  md: "min-h-(--input-height-md) text-(length:--text-sm)",
  lg: "min-h-(--input-height-lg) text-(length:--text-base)",
};

const MULTI_TAG_TONES = [
  "[background:var(--tone-surface-blue)]",
  "[background:var(--tone-surface-green)]",
  "[background:var(--tone-surface-purple)]",
  "[background:var(--tone-surface-amber)]",
  "[background:var(--tone-surface-red)]",
] as const;

const MULTI_TAG_MIN_VISIBLE_RATIO = 0.8;

// ─── Multi-tag chip ────────────────────────────────────────────────────────────

function MultiTag({
  label,
  onRemove,
  size,
  tone,
  measureRef,
  inert = false,
}: {
  label: string;
  onRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size: SelectSize;
  tone: (typeof MULTI_TAG_TONES)[number];
  measureRef?: (node: HTMLButtonElement | null) => void;
  inert?: boolean;
}) {
  return (
    <button
      ref={measureRef}
      type="button"
      aria-label={`Rimuovi ${label}`}
      onClick={onRemove}
      tabIndex={inert ? -1 : undefined}
      className={cn(
        "inline-flex items-center justify-center",
        "min-h-(--select-tag-min-height) max-w-(--select-tag-max-width)",
        "px-(--select-tag-px) py-(--select-tag-py) rounded-(--select-tag-radius)",
        "border border-(--color-select-tag-border)",
        "text-(--color-select-tag-text)",
        "leading-none",
        "shadow-[var(--select-tag-shadow)]",
        "cursor-pointer touch-manipulation select-none",
        "transition-[border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-qoovex)]",
        "hover:border-(--color-select-tag-border-hover) hover:shadow-[var(--select-tag-hover-shadow)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary-highlight)",
        "active:scale-[0.98]",
        "text-(length:--text-xs)",
        "shrink-0",
        tone,
      )}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}

// ─── Option row ───────────────────────────────────────────────────────────────

function Option({
  option,
  selected,
  size,
  onSelect,
}: {
  option: SelectOption;
  selected: boolean;
  size: SelectSize;
  onSelect: (v: string) => void;
}) {
  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={option.disabled || undefined}
      className={cn(
        "flex w-full items-center justify-between gap-(--spacing-2)",
        "px-(--input-px) rounded-(--select-item-radius)",
        "mb-(--spacing-1) last:mb-0",
        "cursor-pointer select-none",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-qoovex)]",
        OPTION_SIZE[size],
        selected
          ? "bg-(--color-select-item-selected-bg) text-(--color-select-item-selected-text)"
          : "text-(--color-text) hover:bg-(--color-select-item-hover)",
        option.disabled && "opacity-40 pointer-events-none",
      )}
      onClick={() => !option.disabled && onSelect(option.value)}
    >
      <span className="truncate">{option.label}</span>
      {selected && (
        <Check
          size={12}
          weight="bold"
          className="shrink-0"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  function Select(props, ref) {
    const {
      options,
      placeholder = "Seleziona...",
      label,
      helperText,
      status = "default",
      size = "md",
      disabled = false,
      srOnlyLabel = false,
      showSelectedCount = true,
      id,
      name,
      className,
    } = props;

    const isMulti = props.multiple === true;
    const selectId = id ?? React.useId();
    const listboxId = `${selectId}-listbox`;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const multiContentRef = React.useRef<HTMLDivElement>(null);
    const measureOverflowRef = React.useRef<HTMLSpanElement>(null);
    const measureChipRefs = React.useRef<Map<string, HTMLButtonElement>>(
      new Map(),
    );
    const [visibleMultiCount, setVisibleMultiCount] = React.useState(3);

    // ── Valore singolo ──
    const [singleValue, setSingleValue] = useControllableValue<string>({
      value: !isMulti ? (props as SelectSingleProps).value : undefined,
      defaultValue: !isMulti
        ? ((props as SelectSingleProps).defaultValue ?? "")
        : "",
      onChange: !isMulti ? (props as SelectSingleProps).onChange : undefined,
    });

    // ── Valore multiplo ──
    const [multiValue, setMultiValue] = useControllableValue<string[]>({
      value: isMulti ? (props as SelectMultiProps).value : undefined,
      defaultValue: isMulti
        ? ((props as SelectMultiProps).defaultValue ?? [])
        : [],
      onChange: isMulti ? (props as SelectMultiProps).onChange : undefined,
    });

    const maxSelected = isMulti
      ? (props as SelectMultiProps).maxSelected
      : undefined;
    const multiValueSignature = isMulti ? multiValue.join("\u0000") : "";
    const [measuredMultiSignature, setMeasuredMultiSignature] =
      React.useState("");

    // chiudi su click esterno
    React.useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // chiudi su Escape (solo single)
    React.useEffect(() => {
      if (!open || isMulti) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [open, isMulti]);

    function handleSelect(val: string) {
      if (!isMulti) {
        setSingleValue(val);
        setOpen(false);
        return;
      }
      const current = multiValue;
      if (current.includes(val)) {
        setMultiValue(current.filter((v) => v !== val));
      } else {
        if (maxSelected !== undefined && current.length >= maxSelected) return;
        setMultiValue([...current, val]);
      }
    }

    function handleRemoveTag(val: string, e: React.MouseEvent) {
      e.stopPropagation();
      setMultiValue(multiValue.filter((v) => v !== val));
    }

    function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen((p) => !p);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    function setMeasureChipRef(
      value: string,
      node: HTMLButtonElement | null,
    ) {
      if (node) {
        measureChipRefs.current.set(value, node);
        return;
      }
      measureChipRefs.current.delete(value);
    }

    const updateVisibleMultiCount = React.useCallback(() => {
      if (!isMulti) return;
      if (multiValue.length === 0) {
        setVisibleMultiCount(0);
        setMeasuredMultiSignature(multiValueSignature);
        return;
      }

      const content = multiContentRef.current;
      if (!content) return;

      const contentWidth = content.getBoundingClientRect().width;
      if (contentWidth <= 0) return;

      const contentStyle = window.getComputedStyle(content);
      const contentGap =
        Number.parseFloat(contentStyle.columnGap || contentStyle.gap) || 0;
      const overflowWidth =
        measureOverflowRef.current?.getBoundingClientRect().width ?? 0;

      let usedWidth = 0;
      let nextVisibleCount = 0;

      for (const value of multiValue) {
        const chip = measureChipRefs.current.get(value);
        const chipWidth = chip?.getBoundingClientRect().width ?? 0;
        if (chipWidth <= 0) break;

        const gapBeforeChip = nextVisibleCount === 0 ? 0 : contentGap;
        const hasHiddenAfterChip =
          nextVisibleCount + 1 < multiValue.length && overflowWidth > 0;
        const overflowReservation = hasHiddenAfterChip
          ? contentGap + overflowWidth
          : 0;
        const minimumVisibleWidth =
          usedWidth +
          gapBeforeChip +
          chipWidth * MULTI_TAG_MIN_VISIBLE_RATIO +
          overflowReservation;

        if (minimumVisibleWidth > contentWidth) break;

        usedWidth += gapBeforeChip + chipWidth;
        nextVisibleCount += 1;
      }

      setVisibleMultiCount(
        Math.min(Math.max(nextVisibleCount, 1), multiValue.length),
      );
      setMeasuredMultiSignature(multiValueSignature);
    }, [isMulti, multiValue, multiValueSignature]);

    React.useEffect(() => {
      if (!isMulti) return;

      const frame = window.requestAnimationFrame(updateVisibleMultiCount);
      const content = multiContentRef.current;

      if (!content || typeof ResizeObserver === "undefined") {
        window.addEventListener("resize", updateVisibleMultiCount);
        return () => {
          window.cancelAnimationFrame(frame);
          window.removeEventListener("resize", updateVisibleMultiCount);
        };
      }

      const observer = new ResizeObserver(updateVisibleMultiCount);
      observer.observe(content);

      return () => {
        window.cancelAnimationFrame(frame);
        observer.disconnect();
      };
    }, [isMulti, updateVisibleMultiCount]);

    const caretSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;
    const visibleMultiValue = isMulti
      ? multiValue.slice(0, visibleMultiCount)
      : [];
    const multiMeasurementReady = measuredMultiSignature === multiValueSignature;
    const hiddenMultiCount = isMulti && multiMeasurementReady
      ? Math.max(multiValue.length - visibleMultiCount, 0)
      : 0;

    // ── Render trigger content ──
    const triggerContent = isMulti ? (
      multiValue.length === 0 ? (
        <span className="flex-1 truncate text-(--color-input-placeholder)">
          {placeholder}
        </span>
      ) : (
        <div
          ref={multiContentRef}
          className="flex flex-1 items-center gap-x-(--select-tag-gap-x) min-w-0"
        >
          <div
            className="flex flex-1 flex-nowrap items-center gap-x-(--select-tag-gap-x) min-w-0 overflow-hidden pr-(--spacing-1) [mask-image:var(--select-tag-rail-mask)]"
          >
            {visibleMultiValue.map((v, index) => {
              const opt = findOption(options, v);
              return opt ? (
                <MultiTag
                  key={v}
                  label={opt.label}
                  size={size}
                  tone={MULTI_TAG_TONES[index % MULTI_TAG_TONES.length]}
                  onRemove={(e) => handleRemoveTag(v, e)}
                />
              ) : null;
            })}
          </div>
          {hiddenMultiCount > 0 && (
            <span
              aria-label={`${hiddenMultiCount} selezioni aggiuntive`}
              className="inline-flex min-h-(--select-tag-min-height) shrink-0 items-center rounded-(--select-tag-radius) border border-(--color-select-tag-more-border) bg-(--color-select-tag-more-bg) px-(--select-tag-px) py-(--select-tag-py) text-(length:--text-xs) font-medium leading-none text-(--color-select-tag-more-text)"
            >
              +{hiddenMultiCount}
            </span>
          )}
        </div>
      )
    ) : (
      <span
        className={cn(
          "flex-1 truncate",
          !findOption(options, singleValue) &&
            "text-(--color-input-placeholder)",
        )}
      >
        {findOption(options, singleValue)?.label ?? placeholder}
      </span>
    );

    const selectedCountMeta =
      isMulti && showSelectedCount && maxSelected !== undefined ? (
        <span className="ml-auto shrink-0 text-(length:--text-xs) font-medium leading-none tracking-[0.04em] text-(--color-select-count-text)">
          {multiValue.length}/{maxSelected}
        </span>
      ) : null;

    return (
      <div
        ref={ref}
        className={cn(FIELD_ROOT_CLASS, className)}
      >
        {name && !isMulti ? (
          <input type="hidden" name={name} value={singleValue} />
        ) : null}
        {name && isMulti
          ? multiValue.map((value) => (
              <input key={value} type="hidden" name={name} value={value} />
            ))
          : null}
        {(label || selectedCountMeta) && (
          <div className="flex min-h-[0.75rem] w-full items-center gap-(--spacing-3)">
            {label && (
              <FieldLabel
                id={`${selectId}-label`}
                srOnly={srOnlyLabel}
              >
                {label}
              </FieldLabel>
            )}
            {selectedCountMeta}
          </div>
        )}

        <div ref={containerRef} className="relative w-full">
          <div
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-label={label ? undefined : placeholder}
            aria-labelledby={label ? `${selectId}-label` : undefined}
            aria-describedby={helperId}
            aria-invalid={status === "error" || undefined}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            data-open={open}
            data-disabled={disabled}
            onClick={() => {
              if (!disabled) setOpen((p) => !p);
            }}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              "relative flex w-full items-center justify-between",
              "rounded-(--select-radius) border",
              "bg-(--color-input-bg)",
              "px-(--input-px) py-(--select-trigger-py) gap-(--input-gap)",
              "cursor-pointer",
              "transition-[border-color,box-shadow]",
              "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
              "focus-visible:outline-none",
              "focus-visible:border-(--color-input-border-focus)",
              "focus-visible:ring-2 focus-visible:ring-(--color-primary-highlight)",
              "data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none",
              TRIGGER_SIZE[size],
              FIELD_TRIGGER_STATUS_RING[status],
            )}
          >
            {triggerContent}
            <CaretDown
              size={caretSize}
              className="shrink-0 text-(--color-input-icon)"
              aria-hidden="true"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform var(--duration-base) var(--ease-qoovex)",
              }}
            />
          </div>

          {isMulti && multiValue.length > 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none invisible absolute left-0 top-0 flex flex-nowrap items-center gap-x-(--select-tag-gap-x)"
            >
              {multiValue.map((v, index) => {
                const opt = findOption(options, v);
                return opt ? (
                  <MultiTag
                    key={v}
                    label={opt.label}
                    size={size}
                    tone={MULTI_TAG_TONES[index % MULTI_TAG_TONES.length]}
                    onRemove={() => undefined}
                    measureRef={(node) => setMeasureChipRef(v, node)}
                    inert
                  />
                ) : null;
              })}
              <span
                ref={measureOverflowRef}
                className="inline-flex min-h-(--select-tag-min-height) shrink-0 items-center rounded-(--select-tag-radius) border border-(--color-select-tag-more-border) bg-(--color-select-tag-more-bg) px-(--select-tag-px) py-(--select-tag-py) text-(length:--text-xs) font-medium leading-none text-(--color-select-tag-more-text)"
              >
                +{multiValue.length}
              </span>
            </div>
          )}

          {/* Dropdown */}
          <div
            id={listboxId}
            role="listbox"
            aria-label={label ?? "Opzioni"}
            aria-multiselectable={isMulti || undefined}
            className={cn(
              "absolute z-[var(--z-dropdown)] w-full",
              "mt-(--spacing-1)",
              "rounded-(--select-dropdown-radius)",
              "border border-(--color-border)",
              "bg-(--color-surface-2)",
              "shadow-[var(--select-dropdown-shadow)]",
              "overflow-hidden overflow-y-auto max-h-64",
              "origin-top",
              "transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
            )}
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "scaleY(1)" : "scaleY(0.95)",
              pointerEvents: open ? "auto" : "none",
            }}
          >
            <div className="p-(--spacing-1)">
              {options.map((item, idx) => {
                if (isGroup(item)) {
                  return (
                    <div key={idx} role="group" aria-label={item.label}>
                      <div
                        className={
                          "px-(--input-px) py-(--spacing-1) " +
                          "text-(length:--text-xs) font-semibold uppercase " +
                          "tracking-[0.06em] text-(--color-select-group-label) select-none"
                        }
                      >
                        {item.label}
                      </div>
                      {item.options.map((opt) => (
                        <Option
                          key={opt.value}
                          option={opt}
                          selected={
                            isMulti
                              ? multiValue.includes(opt.value)
                              : singleValue === opt.value
                          }
                          size={size}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  );
                }
                return (
                  <Option
                    key={item.value}
                    option={item}
                    selected={
                      isMulti
                        ? multiValue.includes(item.value)
                        : singleValue === item.value
                    }
                    size={size}
                    onSelect={handleSelect}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {helperText && (
          <FieldHelperText id={helperId} status={status}>
            {helperText}
          </FieldHelperText>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
