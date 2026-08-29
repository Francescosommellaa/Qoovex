import { cva } from "class-variance-authority"

const iconButtonVariants = cva(
  "qv-icon-button group/icon-button relative isolate inline-grid shrink-0 cursor-pointer place-items-center overflow-visible bg-transparent bg-clip-padding outline-none select-none qv-disabled:pointer-events-none qv-disabled:cursor-not-allowed data-[availability=disabled]:text-muted-foreground data-[availability=disabled]:[--icon-button-border:var(--border)] data-[availability=disabled]:[--icon-button-surface:var(--muted)] data-[loading=true]:cursor-wait [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-primary-foreground [--icon-button-border:transparent] [--icon-button-surface:var(--primary)]",
        secondary: "text-secondary-foreground [--icon-button-border:transparent] [--icon-button-surface:var(--secondary)]",
        outline: "text-foreground [--icon-button-border:var(--border)] [--icon-button-surface:var(--background)]",
        ghost: "text-foreground [--icon-button-border:transparent] [--icon-button-surface:var(--accent)]",
        destructive: "text-destructive-foreground [--icon-button-border:transparent] [--icon-button-surface:var(--destructive)]",
      },
      size: {
        xs: "[--icon-action-size:var(--icon-compact)] [--icon-button-radius:calc(var(--radius)-0.125rem)] [--icon-button-visual-size:1.5rem] [&_svg:not([class*='size-'])]:size-[var(--icon-compact)]",
        sm: "[--icon-action-size:var(--icon)] [--icon-button-radius:calc(var(--radius)-0.125rem)] [--icon-button-visual-size:1.75rem] [&_svg:not([class*='size-'])]:size-[var(--icon)]",
        default: "[--icon-action-size:var(--icon)] [--icon-button-radius:var(--radius)] [--icon-button-visual-size:2rem] [&_svg:not([class*='size-'])]:size-[var(--icon)]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export { iconButtonVariants }
