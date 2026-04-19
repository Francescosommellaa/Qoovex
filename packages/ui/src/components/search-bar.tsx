"use client";

import * as React from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn, mergeRefs, useControllableValue } from "../lib/utils";

export interface SearchBarProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className" | "defaultValue" | "size" | "value"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  isLoading?: boolean;
  className?: string;
  inputClassName?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    {
      value,
      defaultValue = "",
      onValueChange,
      onSearch,
      onChange,
      onKeyDown,
      placeholder = "Cerca...",
      disabled = false,
      isLoading = false,
      className,
      inputClassName,
      autoComplete = "off",
      spellCheck = false,
      ...props
    },
    forwardedRef,
  ) {
    const localRef = React.useRef<HTMLInputElement>(null);
    const inputRef = mergeRefs(localRef, forwardedRef);
    const [query, setQuery] = useControllableValue({
      value,
      defaultValue,
      onChange: onValueChange,
    });

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      setQuery(event.target.value);
      onChange?.(event);
    }

    function handleClear() {
      setQuery("");
      localRef.current?.focus();
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Enter") {
        event.preventDefault();
        onSearch?.(query);
      }

      onKeyDown?.(event);
    }

    return (
      <div className={cn("search-bar-root", className)}>
        <div className="search-bar-field">
          <span className="search-bar-icon-lead" aria-hidden>
            <MagnifyingGlass size={16} />
          </span>

          <input
            {...props}
            ref={inputRef}
            type="text"
            role="searchbox"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("search-bar-input", inputClassName)}
            autoComplete={autoComplete}
            spellCheck={spellCheck}
          />

          {query && !disabled && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="search-bar-clear"
              aria-label="Cancella ricerca"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";
