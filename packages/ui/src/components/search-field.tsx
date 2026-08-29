"use client"

import * as React from "react"
import { IconSearch } from "@tabler/icons-react"

import { Button } from "#components/button"
import { Empty, EmptyActions, EmptyDescription, EmptyHeader, EmptyTitle } from "#components/empty"
import { IconAction } from "#components/icon-action"
import { IconButton } from "#components/icon-button"
import { Input } from "#components/input"
import { cn } from "#lib/utils"
import { useClearableInput } from "./input/use-clearable-input"

interface SearchFieldProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  clearable?: boolean
  onClear?: () => void
  clearLabel?: string
}

function SearchField({
  className,
  clearable = true,
  onClear,
  clearLabel = "Cancella ricerca",
  defaultValue,
  disabled,
  onInput,
  onKeyDown,
  readOnly,
  ref,
  value,
  ...props
}: SearchFieldProps) {
  const { clear, composedRef, handleInput, handleKeyDown, showClear } = useClearableInput({
    clearable,
    defaultValue,
    disabled,
    onClear,
    onInput,
    onKeyDown,
    readOnly,
    ref,
    value,
  })

  return (
    <div className={cn("relative w-full", className)} data-slot="search-field">
      <Input
        {...props}
        className="peer pl-10 pr-14 [appearance:textfield] [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
        defaultValue={defaultValue}
        disabled={disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        ref={composedRef}
        type="search"
        value={value}
      />
      <IconSearch
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus-visible:text-foreground peer-disabled:text-muted-foreground motion-reduce:transition-none"
      />
      {showClear ? (
        <span className="absolute inset-y-0 right-1.5 flex items-center animate-in fade-in zoom-in-95 duration-150 ease-out motion-reduce:animate-none">
          <IconButton
            aria-label={clearLabel}
            className="text-muted-foreground hover:text-foreground focus-visible:text-foreground"
            onClick={clear}
            size="xs"
            type="button"
            variant="ghost"
          >
            <IconAction intent="clear" />
          </IconButton>
        </span>
      ) : null}
    </div>
  )
}

function SearchResults({
  className,
  children,
  empty = false,
  onReset,
  ...props
}: React.ComponentProps<"div"> & {
  /** The consumer declares a completed search with no matches, never an empty query. */
  empty?: boolean
  /** Optional recovery command; the consumer owns query reset and input focus. */
  onReset?: () => void
}) {
  return (
    <div className={cn("grid min-w-0 gap-4", className)} data-slot="search-results" {...props}>
      {empty ? (
        <Empty variant="ghost" className="px-4 py-8 sm:px-6 sm:py-8">
          <EmptyHeader role="status">
            <IconSearch aria-hidden="true" className="mb-2 size-7 text-muted-foreground" />
            <EmptyTitle>Nessun risultato</EmptyTitle>
            <EmptyDescription className="text-sm">
              Prova con meno parole o verifica il termine cercato.
            </EmptyDescription>
          </EmptyHeader>
          {onReset ? (
            <EmptyActions>
              <Button onClick={onReset} type="button" variant="outline">
                Ricomincia la ricerca
                <IconAction intent="retry" />
              </Button>
            </EmptyActions>
          ) : null}
        </Empty>
      ) : children}
    </div>
  )
}

export { SearchField, SearchResults }
