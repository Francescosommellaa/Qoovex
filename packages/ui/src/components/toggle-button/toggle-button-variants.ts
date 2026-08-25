import { cva } from "class-variance-authority"

const toggleButtonVariants = cva(
  "group/toggle-button relative isolate text-muted-foreground data-pressed:text-background qv-disabled:pointer-events-none qv-disabled:cursor-not-allowed qv-disabled:text-muted-foreground qv-disabled:[--toggle-button-state-border:var(--border)] qv-disabled:[--toggle-button-state-surface:var(--muted)] data-pressed:qv-disabled:text-muted-foreground [--toggle-button-interaction-surface:var(--accent)] [--toggle-button-state-border:var(--foreground)] [--toggle-button-state-surface:var(--foreground)]",
)

export { toggleButtonVariants }
