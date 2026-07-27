import * as React from "react"
import { IconSearch, IconX } from "@tabler/icons-react"

import { Button } from "#components/button"
import { Input } from "#components/input"
import { cn } from "#lib/utils"

interface SearchFieldProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  onClear?: () => void
  clearLabel?: string
}

function SearchField({ className, onClear, clearLabel = "Cancella ricerca", value, ...props }: SearchFieldProps) {
  const hasValue = typeof value === "string" && value.length > 0
  return (
    <div className={cn("relative", className)} data-slot="search-field">
      <IconSearch aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-8 pr-9" type="search" value={value} {...props} />
      {onClear && hasValue ? (
        <Button aria-label={clearLabel} className="absolute top-1/2 right-1 size-6 -translate-y-1/2" onClick={onClear} size="icon-sm" type="button" variant="ghost">
          <IconX aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}

function SearchResults({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-live="polite" className={cn("grid gap-4", className)} data-slot="search-results" {...props} />
}

export { SearchField, SearchResults }
