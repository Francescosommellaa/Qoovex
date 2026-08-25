import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "qv-touch-target group/button relative isolate inline-flex max-w-full min-w-0 cursor-pointer items-center justify-center overflow-visible rounded-[var(--radius)] border border-transparent bg-clip-padding text-center text-sm font-medium whitespace-normal select-none qv-disabled:pointer-events-none qv-disabled:cursor-not-allowed data-[availability=disabled]:text-muted-foreground data-[availability=disabled]:[--button-border:var(--border)] data-[availability=disabled]:[--button-surface:var(--muted)] data-[loading=true]:cursor-wait [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "text-primary-foreground [--button-border:transparent] [--button-surface:var(--primary)]",
        outline: "text-foreground [--button-border:var(--border)] [--button-surface:var(--background)]",
        secondary: "text-secondary-foreground [--button-border:transparent] [--button-surface:var(--secondary)]",
        ghost: "bg-transparent text-foreground [--button-border:transparent] [--button-surface:var(--accent)]",
        destructive: "text-destructive-foreground [--button-border:transparent] [--button-surface:var(--destructive)]",
      },
      size: {
        default: "min-h-10 gap-1.5 px-3.5 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "min-h-8 gap-1 rounded-[calc(var(--radius)-0.125rem)] px-2.5 py-1.5 text-xs in-data-[slot=button-group]:rounded-[var(--radius)] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-9 gap-1.5 rounded-[calc(var(--radius)-0.125rem)] px-3 py-2 text-sm in-data-[slot=button-group]:rounded-[var(--radius)] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-12 gap-2 rounded-[calc(var(--radius)+0.125rem)] px-5 py-2.5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-8 shrink-0 p-0",
        "icon-xs": "size-6 shrink-0 rounded-[calc(var(--radius)-0.125rem)] p-0 in-data-[slot=button-group]:rounded-[var(--radius)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 shrink-0 rounded-[calc(var(--radius)-0.125rem)] p-0 in-data-[slot=button-group]:rounded-[var(--radius)]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export { buttonVariants }
