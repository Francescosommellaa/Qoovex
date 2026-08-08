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
        bars: "",
        dots: "",
        orbit: "",
        pulse: "",
      },
      size: {
        xs: "size-3.5 text-[0.65rem]",
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
        slow: "[animation-duration:1.5s]",
        normal: "[animation-duration:1s]",
        fast: "[animation-duration:0.6s]",
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
          <IconCheck className="size-3.5 stroke-[2.5]" />
        </span>
      )
    }

    if (status === "error") {
      return (
        <span className="flex size-full items-center justify-center rounded-full bg-destructive/15 text-destructive animate-in zoom-in-75 duration-300">
          <IconX className="size-3.5 stroke-[2.5]" />
        </span>
      )
    }

    // Determinate Circular Gauge
    if (isDeterminate) {
      return (
        <div className="relative flex size-full items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 24 24" fill="none">
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
          {size === "xl" || size === "lg" ? (
            <span className="absolute font-mono text-[0.6rem] font-bold tracking-tighter">
              {Math.round(clampedProgress)}%
            </span>
          ) : null}
        </div>
      )
    }

    // Indeterminate Variants
    switch (variant) {
      case "bars":
        return (
          <svg
            className={cn("size-full animate-spin", spinnerVariants({ speed }))}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={angle}
                x1="12"
                y1="3"
                x2="12"
                y2="6"
                strokeWidth="2.2"
                strokeLinecap="round"
                transform={`rotate(${angle} 12 12)`}
                style={{ opacity: 0.15 + (i / 8) * 0.85 }}
              />
            ))}
          </svg>
        )

      case "track":
        return (
          <svg
            className={cn("size-full animate-spin", spinnerVariants({ speed }))}
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

      case "dots":
        return (
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.32s]" />
            <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.16s]" />
            <span className="size-1.5 rounded-full bg-current animate-bounce" />
          </span>
        )

      case "orbit":
        return (
          <svg
            className={cn("size-full animate-spin", spinnerVariants({ speed }))}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
              className="opacity-20"
              strokeDasharray="3 3"
            />
            <circle cx="12" cy="3" r="2.5" fill="currentColor" />
            <circle cx="12" cy="21" r="1.5" fill="currentColor" className="opacity-60" />
          </svg>
        )

      case "pulse":
        return (
          <span className="relative flex size-full items-center justify-center">
            <span className="absolute size-full rounded-full bg-current opacity-30 animate-ping" />
            <span className="size-2/3 rounded-full bg-current" />
          </span>
        )

      case "ring":
      default:
        return (
          <svg
            className={cn("size-full animate-spin", spinnerVariants({ speed }))}
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
      aria-label="Caricamento in corso..."
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
          "inline-flex items-center gap-2 text-muted-foreground text-xs font-medium font-accent transition-all duration-300",
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
