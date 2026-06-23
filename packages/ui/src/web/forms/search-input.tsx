"use client";

import { MagnifyingGlass, X } from "@phosphor-icons/react";

import { IconButton } from "../primitives/button";
import { cx } from "../primitives/utils";
import { Input, type InputProps } from "./controls";

export interface SearchInputProps extends Omit<InputProps, "type" | "startIcon" | "endIcon"> {
  "aria-label": string;
  onClear?: () => void;
  clearLabel?: string;
}

export function SearchInput({
  "aria-label": ariaLabel,
  onClear,
  clearLabel = "Cancella ricerca",
  value,
  className,
  ...props
}: SearchInputProps) {
  const hasValue = value !== undefined && String(value).length > 0;
  return (
    <span className={cx("qv-search-input", className)} data-has-clear={Boolean(onClear && hasValue) || undefined}>
      <Input type="search" aria-label={ariaLabel} value={value} startIcon={<MagnifyingGlass />} {...props} />
      {onClear && hasValue ? <IconButton type="button" size="sm" variant="ghost" icon={<X />} aria-label={clearLabel} onClick={onClear} /> : null}
    </span>
  );
}
