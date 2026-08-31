import * as React from "react"

import { cn } from "#lib/utils"

type LabelProps = React.ComponentProps<"label"> & {
  /** Presentation only: pass the same required value as the associated control. */
  required?: boolean
  optional?: boolean
}

function Label({ children, className, required = false, optional = false, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "qv-label inline-block min-w-0 max-w-full text-sm leading-5 font-medium text-foreground select-none",
        className
      )}
      {...props}
    >
      <span data-slot="label-text" className="min-w-0 [overflow-wrap:anywhere]">
        {children}
        {required ? (
          <span aria-hidden="true" data-slot="label-required" className="whitespace-nowrap font-normal text-muted-foreground">{"\u00a0*"}</span>
        ) : optional ? (
          <>{" "}<span aria-hidden="true" data-slot="label-optional" className="inline-block whitespace-nowrap text-xs leading-4 font-normal text-muted-foreground">Facoltativo</span></>
        ) : null}
      </span>
    </label>
  )
}

export { Label, type LabelProps }
