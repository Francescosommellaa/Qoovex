export const actionLinkBase =
  "group relative inline-flex items-center justify-center overflow-hidden rounded-(--radius-full) border font-medium no-underline transition-[color,border-color,background,box-shadow,opacity] duration-[var(--duration-base)] ease-[var(--ease-qoovex)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)";

export const actionLinkVariants = {
  primary:
    "border-(--color-primary) bg-(--color-surface-offset) text-(--color-text) shadow-(--shadow-btn-resting) hover:bg-(--color-primary) hover:text-(--color-btn-filled-text) hover:shadow-(--shadow-btn-hover)",
  secondary:
    "border-(--color-border) bg-(--color-surface-offset) text-(--color-text) shadow-(--shadow-btn-resting) hover:bg-(--color-surface-raised) hover:shadow-(--shadow-btn-hover)",
  ghost:
    "border-transparent bg-transparent text-(--color-text-muted) hover:bg-(--color-btn-fill-ghost) hover:text-(--color-text)",
} as const;

export const actionLinkSizes = {
  sm: "min-h-(--input-height-sm) gap-(--spacing-2) px-(--spacing-5) text-(length:--text-xs)",
  md: "min-h-(--input-height-md) gap-(--spacing-2) px-(--spacing-6) text-(length:--text-sm)",
  lg: "min-h-(--input-height-lg) gap-(--spacing-3) px-(--spacing-8) text-(length:--text-base)",
} as const;

