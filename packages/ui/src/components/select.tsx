"use client";

import * as React from "react";
import { CaretDown, Check, X } from "@phosphor-icons/react";
import { cn, useControllableValue } from "../lib/utils";

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
  id?: string;
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
  sm: "min-h-[var(--input-height-sm)] text-[length:var(--text-xs)]",
  md: "min-h-[var(--input-height-md)] text-[length:var(--text-sm)]",
  lg: "min-h-[var(--input-height-lg)] text-[length:var(--text-base)]",
};

const TRIGGER_STATUS: Record<SelectStatus, string> = {
  default:
    "border-[var(--color-input-border)] " +
    "data-[open=true]:border-[var(--color-input-border-focus)] " +
    "data-[open=true]:ring-2 data-[open=true]:ring-[var(--color-primary-highlight)]",
  error:
    "border-[var(--color-input-border-error)] " +
    "ring-2 ring-[var(--color-error-highlight)]",
  success:
    "border-[var(--color-input-border-success)] " +
    "ring-2 ring-[var(--color-success-highlight)]",
};

const HELPER_STATUS: Record<SelectStatus, string> = {
  default: "text-[var(--color-input-helper)]",
  error: "text-[var(--color-input-helper-error)]",
  success: "text-[var(--color-input-helper-success)]",
};

const OPTION_SIZE: Record<SelectSize, string> = {
  sm: "min-h-[var(--input-height-sm)] text-[length:var(--text-xs)]",
  md: "min-h-[var(--input-height-md)] text-[length:var(--text-sm)]",
  lg: "min-h-[var(--input-height-lg)] text-[length:var(--text-base)]",
};

// ─── Multi-tag chip ────────────────────────────────────────────────────────────

function MultiTag({
  label,
  onRemove,
  size,
}: {
  label: string;
  onRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size: SelectSize;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[var(--spacing-1)]",
        "px-[var(--spacing-2)] rounded-[var(--select-tag-radius)]",
        "bg-[var(--color-select-tag-bg)] border border-[var(--color-select-tag-border)]",
        "text-[var(--color-select-tag-text)]",
        "h-[var(--select-tag-height)]",
        size === "lg"
          ? "text-[length:var(--text-sm)]"
          : "text-[length:var(--text-xs)]",
        "shrink-0",
      )}
    >
      <span className="max-w-[8rem] truncate">{label}</span>
      <button
        type="button"
        aria-label={`Rimuovi ${label}`}
        onClick={onRemove}
        className={cn(
          "flex items-center justify-center",
          "min-h-7 min-w-7",
          "rounded-[var(--radius-sm)]",
          "text-[var(--color-select-tag-remove)]",
          "hover:text-[var(--color-text)]",
          "transition-colors duration-[var(--duration-fast)]",
          "cursor-pointer",
          "-mr-[var(--spacing-1)]",
        )}
      >
        <X size={10} weight="bold" aria-hidden="true" />
      </button>
    </span>
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
        "flex w-full items-center justify-between gap-2",
        "px-[var(--input-px)] rounded-[var(--select-item-radius)]",
        "cursor-pointer select-none",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-qoovex)]",
        OPTION_SIZE[size],
        selected
          ? "bg-[var(--color-select-item-selected-bg)] text-[var(--color-select-item-selected-text)]"
          : "text-[var(--color-text)] hover:bg-[var(--color-select-item-hover)]",
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
      id,
      className,
    } = props;

    const isMulti = props.multiple === true;
    const selectId = id ?? React.useId();
    const listboxId = `${selectId}-listbox`;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

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

    const caretSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;

    // ── Render trigger content ──
    const triggerContent = isMulti ? (
      multiValue.length === 0 ? (
        <span className="text-[var(--color-input-placeholder)] truncate">
          {placeholder}
        </span>
      ) : (
        <div className="flex flex-wrap gap-[var(--spacing-1)] py-[var(--spacing-1)] flex-1 min-w-0">
          {multiValue.map((v) => {
            const opt = findOption(options, v);
            return opt ? (
              <MultiTag
                key={v}
                label={opt.label}
                size={size}
                onRemove={(e) => handleRemoveTag(v, e)}
              />
            ) : null;
          })}
          {maxSelected && (
            <span className="text-[length:var(--text-xs)] text-[var(--color-text-faint)] self-center ml-auto shrink-0">
              {multiValue.length}/{maxSelected}
            </span>
          )}
        </div>
      )
    ) : (
      <span
        className={cn(
          "truncate",
          !findOption(options, singleValue) &&
            "text-[var(--color-input-placeholder)]",
        )}
      >
        {findOption(options, singleValue)?.label ?? placeholder}
      </span>
    );

    return (
      <div
        ref={ref}
        className={cn("flex w-full flex-col gap-[var(--input-gap)]", className)}
      >
        {label && (
          <label
            id={`${selectId}-label`}
            className={cn(
              "text-[length:var(--text-xs)] font-medium text-[var(--color-label)] tracking-[0.03em] uppercase select-none",
              srOnlyLabel && "sr-only",
            )}
          >
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative w-full">
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-labelledby={label ? `${selectId}-label` : undefined}
            aria-describedby={helperId}
            aria-invalid={status === "error" || undefined}
            disabled={disabled}
            data-open={open}
            onClick={() => setOpen((p) => !p)}
            className={cn(
              "relative flex w-full items-center justify-between",
              "rounded-[var(--select-radius)] border",
              "bg-[var(--color-input-bg)]",
              "px-[var(--input-px)] gap-[var(--input-gap)]",
              "cursor-pointer",
              "transition-[border-color,box-shadow]",
              "duration-[var(--duration-base)] ease-[var(--ease-qoovex)]",
              "focus-visible:outline-none",
              "disabled:opacity-50 disabled:pointer-events-none",
              TRIGGER_SIZE[size],
              TRIGGER_STATUS[status],
            )}
          >
            {triggerContent}
            <CaretDown
              size={caretSize}
              className="shrink-0 text-[var(--color-input-icon)] ml-auto"
              aria-hidden="true"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform var(--duration-base) var(--ease-qoovex)",
              }}
            />
          </button>

          {/* Dropdown */}
          <div
            id={listboxId}
            role="listbox"
            aria-label={label ?? "Opzioni"}
            aria-multiselectable={isMulti || undefined}
            className={cn(
              "absolute z-[var(--z-dropdown)] w-full",
              "mt-[var(--spacing-1)]",
              "rounded-[var(--select-dropdown-radius)]",
              "border border-[var(--color-border)]",
              "bg-[var(--color-surface-2)]",
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
            <div className="p-[var(--spacing-1)]">
              {options.map((item, idx) => {
                if (isGroup(item)) {
                  return (
                    <div key={idx} role="group" aria-label={item.label}>
                      <div
                        className={
                          "px-[var(--input-px)] py-[var(--spacing-1)] " +
                          "text-[length:var(--text-xs)] font-semibold uppercase " +
                          "tracking-[0.06em] text-[var(--color-select-group-label)] select-none"
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
          <p
            id={helperId}
            className={cn(
              "text-[length:var(--text-xs)]",
              HELPER_STATUS[status],
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
