import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "#lib/utils"
import { IconCheck, IconX } from "@tabler/icons-react"

const spinnerVariants = cva(
  "inline-flex items-center justify-center shrink-0 text-current select-none transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        ring: "",
        track: "",
        hexagon: "",
        pulse: "",
      },
      size: {
        xs: "size-3.5 text-xs",
        sm: "size-4.5 text-xs",
        default: "size-5.5 text-xs",
        lg: "size-7 text-sm",
        xl: "size-9 text-base",
      },
      color: {
        current: "text-current",
        primary: "text-primary",
        muted: "text-muted-foreground",
        success: "text-success",
        destructive: "text-destructive",
      },
      speed: {
        slow: "[--spinner-duration:1.5s] [animation-duration:1.5s]",
        normal: "[--spinner-duration:1s] [animation-duration:1s]",
        fast: "[--spinner-duration:0.6s] [animation-duration:0.6s]",
      },
    },
    defaultVariants: {
      variant: "ring",
      size: "default",
      color: "current",
      speed: "normal",
    },
  }
)

export interface SpinnerProps
  extends Omit<React.ComponentProps<"span">, "color">,
    VariantProps<typeof spinnerVariants> {
  label?: string | string[]
  labelPosition?: "right" | "bottom"
  progress?: number // 0-100 %
  status?: "loading" | "success" | "error"
  glow?: boolean
}

function Spinner({
  className,
  variant = "ring",
  size = "default",
  color = "current",
  speed = "normal",
  label,
  labelPosition = "right",
  progress,
  status = "loading",
  glow = false,
  ...props
}: SpinnerProps) {
  const containerSizeClass = spinnerVariants({ size, color, speed })

  // Dynamic cycling label support when label is an array!
  const [currentLabelIndex, setCurrentLabelIndex] = React.useState(0)

  React.useEffect(() => {
    if (!Array.isArray(label) || label.length <= 1) return
    const interval = setInterval(() => {
      setCurrentLabelIndex((prev) => (prev + 1) % label.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [label])

  const activeLabel = Array.isArray(label) ? label[currentLabelIndex] : label

  // Handle Determinate Progress (0-100%)
  const isDeterminate = typeof progress === "number"
  const clampedProgress = isDeterminate ? Math.min(100, Math.max(0, progress)) : 0
  const circumference = 2 * Math.PI * 9.5
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference

  const renderGraphic = () => {
    // Handle State Morphing: Success or Error
    if (status === "success") {
      return (
        <span className="flex size-full items-center justify-center rounded-full bg-success/15 text-success animate-in zoom-in-75 duration-300">
          <IconCheck aria-hidden="true" className="size-3.5 stroke-[2.5]" data-slot="spinner-status-icon" />
        </span>
      )
    }

    if (status === "error") {
      return (
        <span className="flex size-full items-center justify-center rounded-full bg-destructive/15 text-destructive animate-in zoom-in-75 duration-300">
          <IconX aria-hidden="true" className="size-3.5 stroke-[2.5]" data-slot="spinner-status-icon" />
        </span>
      )
    }

    // Determinate gauge
    if (isDeterminate) {
      if (variant === "hexagon") {
        return (
          <div className="relative flex size-full items-center justify-center">
            <svg aria-hidden="true" className="size-full" fill="none" viewBox="0 0 24 24">
              <polygon className="opacity-15" pathLength="100" points="12,2.5 20.23,7.25 20.23,16.75 12,21.5 3.77,16.75 3.77,7.25" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
              <polygon className="transition-[stroke-dashoffset] duration-300 ease-out" pathLength="100" points="12,2.5 20.23,7.25 20.23,16.75 12,21.5 3.77,16.75 3.77,7.25" stroke="currentColor" strokeDasharray="100" strokeDashoffset={100 - clampedProgress} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        )
      }

      return (
        <div className="relative flex size-full items-center justify-center">
          <svg aria-hidden="true" className="size-full -rotate-90" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="2.5"
              className="opacity-15"
            />
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-300 ease-out"
            />
          </svg>
        </div>
      )
    }

    // Indeterminate Variants
    switch (variant) {
      case "hexagon":
        return (
          <svg aria-hidden="true" className="size-full" fill="none" viewBox="0 0 24 24">
            <polygon className="opacity-15" pathLength="100" points="12,2.5 20.23,7.25 20.23,16.75 12,21.5 3.77,16.75 3.77,7.25" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
            <polygon className="qv-spinner-hexagon-segment" pathLength="100" points="12,2.5 20.23,7.25 20.23,16.75 12,21.5 3.77,16.75 3.77,7.25" stroke="currentColor" strokeDasharray="28 72" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        )

      case "track":
        return (
          <svg
            aria-hidden="true"
            className={cn("size-full animate-spin motion-reduce:animate-none", spinnerVariants({ speed }))}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="2.5"
              className="opacity-15"
            />
            <path
              d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )

      case "pulse":
        return (
          <span className="relative flex size-full items-center justify-center">
            <span className="absolute size-full rounded-full bg-current opacity-30 animate-ping motion-reduce:animate-none" />
            <span className="size-2/3 rounded-full bg-current" />
          </span>
        )

      case "ring":
      default:
        return (
          <svg
            aria-hidden="true"
            className={cn("size-full animate-spin motion-reduce:animate-none", spinnerVariants({ speed }))}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2.5"
              className="opacity-15"
            />
            <path
              d="M12 3a9 9 0 0 1 9 9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )
    }
  }

  const mainElement = (
    <span
      data-slot="spinner"
      role="status"
      aria-label={status === "success" ? "Operazione completata" : status === "error" ? "Operazione non riuscita" : "Caricamento in corso..."}
      className={cn(
        containerSizeClass,
        glow && "drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]",
        className
      )}
      {...props}
    >
      {renderGraphic()}
    </span>
  )

  if (activeLabel) {
    return (
      <span
        data-slot="spinner-container"
        className={cn(
          "inline-flex items-center gap-2 text-muted-foreground text-xs font-semibold font-accent transition-all duration-300",
          labelPosition === "bottom" && "flex-col gap-1.5 text-center",
          className
        )}
      >
        {mainElement}
        <span className="animate-in fade-in slide-in-from-left-1 duration-200">{activeLabel}</span>
      </span>
    )
  }

  return mainElement
}

export { Spinner, spinnerVariants }
