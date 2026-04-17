// packages/ui/src/components/search-bar.tsx
"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";

export interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function SearchBar({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onSearch,
  placeholder = "Cerca…",
  disabled = false,
  isLoading = false,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const value = controlledValue ?? internalValue;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (controlledValue === undefined) setInternalValue(v);
    onValueChange?.(v);
  }

  function handleClear() {
    if (controlledValue === undefined) setInternalValue("");
    onValueChange?.("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch?.(value);
    }
  }

  return (
    <div className={cn("search-bar-root", className)}>
      <div className="search-bar-field">
        <span className="search-bar-icon-lead" aria-hidden>
          <Search size={16} strokeWidth={1.5} />
        </span>

        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="search-bar-input"
          autoComplete="off"
          spellCheck={false}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="search-bar-clear"
            aria-label="Cancella ricerca"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}