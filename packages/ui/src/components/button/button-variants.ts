import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "qv-touch-target group/button relative inline-flex max-w-full min-w-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-center text-sm font-medium whitespace-normal outline-none select-none transition-[color,background-color,border-color,box-shadow,opacity,text-decoration-color] [transition-duration:var(--motion-duration-feedback)] [transition-timing-function:var(--ease-standard)] qv-disabled:pointer-events-none qv-disabled:cursor-not-allowed qv-disabled:opacity-50 data-[loading=true]:cursor-wait [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 active:bg-primary/80 aria-expanded:bg-primary/90 aria-expanded:[transition-duration:var(--motion-duration-state)]",
        outline: "border-border/80 bg-background text-foreground shadow-2xs hover:bg-accent/60 hover:text-accent-foreground active:bg-accent aria-expanded:bg-accent/60 aria-expanded:[transition-duration:var(--motion-duration-state)] dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 aria-expanded:bg-secondary aria-expanded:[transition-duration:var(--motion-duration-state)]",
        ghost: "bg-transparent text-foreground hover:bg-accent/80 hover:text-accent-foreground active:bg-accent aria-expanded:bg-accent/80 aria-expanded:[transition-duration:var(--motion-duration-state)]",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/30 aria-expanded:bg-destructive/20 aria-expanded:[transition-duration:var(--motion-duration-state)] dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "qv-touch-target-inline h-auto min-h-0 rounded-none border-transparent bg-transparent p-0 font-normal text-primary underline decoration-transparent underline-offset-4 shadow-none hover:bg-transparent hover:decoration-current active:text-primary/80 focus-visible:decoration-current",
      },
      size: {
        default: "min-h-8 gap-1.5 px-3 py-1 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "min-h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 py-0.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-7 gap-1.5 rounded-[min(var(--radius-md),12px)] px-2.5 py-1 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-9.5 gap-2 px-4 py-1.5 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8 shrink-0 rounded-lg p-0",
        "icon-xs": "size-6 shrink-0 rounded-[min(var(--radius-md),10px)] p-0 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 shrink-0 rounded-[min(var(--radius-md),12px)] p-0 in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9.5 shrink-0 rounded-xl p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export { buttonVariants }
