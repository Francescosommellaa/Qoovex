import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center font-accent font-medium tracking-wide whitespace-nowrap no-underline transition-all duration-200 ease-out focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 select-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:shrink-0 [a]:active:scale-[0.97] [button]:active:scale-[0.97] data-interactive:active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-2xs [a]:hover:bg-primary/90 [button]:hover:bg-primary/90 data-interactive:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/40 [a]:hover:bg-secondary/80 [button]:hover:bg-secondary/80 data-interactive:hover:bg-secondary/80",
        outline:
          "border border-border/80 bg-background/50 text-foreground/90 backdrop-blur-2xs [a]:hover:bg-accent [a]:hover:text-accent-foreground [button]:hover:bg-accent [button]:hover:text-accent-foreground data-interactive:hover:bg-accent",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20 focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20 [button]:hover:bg-destructive/20 data-interactive:hover:bg-destructive/20",
        info: "bg-info/10 text-info border border-info/20 focus-visible:ring-info/20 [a]:hover:bg-info/20 [button]:hover:bg-info/20 data-interactive:hover:bg-info/20",
        success:
          "bg-success/10 text-success border border-success/20 focus-visible:ring-success/20 [a]:hover:bg-success/20 [button]:hover:bg-success/20 data-interactive:hover:bg-success/20",
        warning:
          "bg-warning/15 text-warning-foreground border border-warning/25 focus-visible:ring-warning/25 [a]:hover:bg-warning/25 [button]:hover:bg-warning/25 data-interactive:hover:bg-warning/25",
        ghost:
          "text-muted-foreground [a]:hover:bg-muted [a]:hover:text-foreground [button]:hover:bg-muted [button]:hover:text-foreground data-interactive:hover:bg-muted",
        glass:
          "bg-background/60 text-foreground border border-border/70 shadow-2xs backdrop-blur-md [a]:hover:bg-background/80 [button]:hover:bg-background/80 data-interactive:hover:bg-background/80",
      },
      size: {
        sm: "h-4.5 px-2 text-[0.6875rem] gap-1 rounded-full [&>svg]:size-2.5!",
        default: "h-5.5 px-2.5 text-xs gap-1.5 rounded-full [&>svg]:size-3.5!",
        lg: "h-6.5 px-3 text-xs sm:text-sm gap-1.5 rounded-full [&>svg]:size-4!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  })
}

export { Badge, badgeVariants }
