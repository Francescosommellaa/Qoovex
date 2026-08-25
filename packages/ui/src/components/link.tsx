import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "#lib/utils"

const linkVariants = cva(
  "qv-touch-target relative inline-flex max-w-full min-w-0 items-center justify-center border border-transparent bg-clip-padding text-center text-sm font-medium whitespace-normal outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        inline: "qv-touch-target-inline h-auto min-h-0 rounded-none p-0 font-normal text-primary",
        quiet: "qv-touch-target-inline h-auto min-h-0 rounded-none p-0 font-normal text-muted-foreground",
        primary: "rounded-[var(--radius)] bg-primary text-primary-foreground",
        secondary: "rounded-[var(--radius)] bg-secondary text-secondary-foreground",
        outline: "rounded-[var(--radius)] border-border bg-background text-foreground",
        ghost: "rounded-[var(--radius)] bg-transparent text-foreground",
      },
      size: {
        default: "min-h-10 gap-1.5 px-3.5 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        sm: "min-h-9 gap-1.5 rounded-[calc(var(--radius)-0.125rem)] px-3 py-2 text-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-12 gap-2 rounded-[calc(var(--radius)+0.125rem)] px-5 py-2.5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
      },
    },
    compoundVariants: [
      { variant: "inline", className: "min-h-0 px-0 py-0" },
      { variant: "quiet", className: "min-h-0 px-0 py-0" },
    ],
    defaultVariants: { variant: "inline", size: "default" },
  }
)

type LinkProps = React.ComponentProps<"a"> & VariantProps<typeof linkVariants>

function Link({ className, variant = "inline", size = "default", ...props }: LinkProps) {
  return (
    <a
      data-link={variant === "inline" ? "inline" : variant === "quiet" ? "quiet" : "plain"}
      data-slot="link"
      className={cn(linkVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Link, linkVariants }
