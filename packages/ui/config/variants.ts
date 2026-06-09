import { cva, type VariantProps } from "class-variance-authority";

export const qvSpacing = [
  "none",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
  "16",
  "20",
  "24",
  "32",
] as const;

export const qvRadius = ["none", "sm", "md", "lg", "xl", "2xl", "full"] as const;
export const qvTone = ["neutral", "primary", "success", "warning", "error"] as const;
export const qvTextSize = ["xs", "sm", "base", "lg", "xl", "2xl"] as const;
export const qvTextRole = [
  "caption",
  "eyebrow",
  "body-sm",
  "body",
  "subheading",
  "heading-sm",
  "heading",
  "heading-lg",
  "display",
  "hero",
] as const;
export const qvSurface = [
  "transparent",
  "paper",
  "cream",
  "pastel",
  "obsidian",
  "violet",
  "bg",
  "surface",
  "surface2",
  "offset",
  "raised",
] as const;

export type QvSpacing = (typeof qvSpacing)[number];
export type QvRadius = (typeof qvRadius)[number];
export type QvTone = (typeof qvTone)[number];
export type QvTextSize = (typeof qvTextSize)[number];
export type QvTextRole = (typeof qvTextRole)[number];
export type QvSurface = (typeof qvSurface)[number];

export const spacingClass: Record<QvSpacing, string> = {
  none: "gap-0",
  "1": "gap-(--spacing-1)",
  "2": "gap-(--spacing-2)",
  "3": "gap-(--spacing-3)",
  "4": "gap-(--spacing-4)",
  "5": "gap-(--spacing-5)",
  "6": "gap-(--spacing-6)",
  "8": "gap-(--spacing-8)",
  "10": "gap-(--spacing-10)",
  "12": "gap-(--spacing-12)",
  "16": "gap-(--spacing-16)",
  "20": "gap-(--spacing-20)",
  "24": "gap-(--spacing-24)",
  "32": "gap-(--spacing-32)",
};

export const paddingClass: Record<QvSpacing, string> = {
  none: "p-0",
  "1": "p-(--spacing-1)",
  "2": "p-(--spacing-2)",
  "3": "p-(--spacing-3)",
  "4": "p-(--spacing-4)",
  "5": "p-(--spacing-5)",
  "6": "p-(--spacing-6)",
  "8": "p-(--spacing-8)",
  "10": "p-(--spacing-10)",
  "12": "p-(--spacing-12)",
  "16": "p-(--spacing-16)",
  "20": "p-(--spacing-20)",
  "24": "p-(--spacing-24)",
  "32": "p-(--spacing-32)",
};

export const radiusClass: Record<QvRadius, string> = {
  none: "rounded-none",
  sm: "rounded-(--radius-sm)",
  md: "rounded-(--radius-md)",
  lg: "rounded-(--radius-lg)",
  xl: "rounded-(--radius-xl)",
  "2xl": "rounded-(--radius-2xl)",
  full: "rounded-(--radius-full)",
};

export const textSizeClass: Record<QvTextSize, string> = {
  xs: "text-(length:--text-xs)",
  sm: "text-(length:--text-sm)",
  base: "text-(length:--text-base)",
  lg: "text-(length:--text-lg)",
  xl: "text-(length:--text-xl)",
  "2xl": "text-(length:--text-2xl)",
};

export const textRoleClass: Record<QvTextRole, string> = {
  caption: "text-(length:--text-caption) leading-(--leading-caption) tracking-(--tracking-caption)",
  eyebrow: "text-(length:--text-eyebrow) leading-(--leading-eyebrow) tracking-(--tracking-eyebrow) uppercase",
  "body-sm": "text-(length:--text-body-sm) leading-(--leading-body-sm) tracking-(--tracking-body-sm)",
  body: "text-(length:--text-body) leading-(--leading-body) tracking-(--tracking-body)",
  subheading: "text-(length:--text-subheading) leading-(--leading-subheading) tracking-(--tracking-subheading)",
  "heading-sm": "text-(length:--text-heading-sm) leading-(--leading-heading-sm) tracking-(--tracking-heading-sm)",
  heading: "text-(length:--text-heading) leading-(--leading-heading) tracking-(--tracking-heading)",
  "heading-lg": "text-(length:--text-heading-lg) leading-(--leading-heading-lg) tracking-(--tracking-heading-lg)",
  display: "text-(length:--text-display) leading-(--leading-display) tracking-(--tracking-display)",
  hero: "text-(length:--text-hero) leading-(--leading-hero) tracking-(--tracking-hero)",
};

export const toneTextClass: Record<QvTone | "muted" | "faint" | "inverse", string> = {
  neutral: "text-(--color-text)",
  primary: "text-(--color-primary)",
  success: "text-(--color-success)",
  warning: "text-(--color-warning)",
  error: "text-(--color-error)",
  muted: "text-(--color-text-muted)",
  faint: "text-(--color-text-faint)",
  inverse: "text-(--color-text-inverse)",
};

export const surfaceClass: Record<QvSurface, string> = {
  transparent: "bg-transparent",
  paper: "bg-(--surface-paper)",
  cream: "bg-(--surface-cream)",
  pastel: "bg-(--surface-pastel)",
  obsidian: "bg-(--surface-obsidian)",
  violet: "bg-(--surface-violet)",
  bg: "bg-(--color-bg)",
  surface: "bg-(--color-surface)",
  surface2: "bg-(--color-surface-2)",
  offset: "bg-(--color-surface-offset)",
  raised: "bg-(--color-surface-raised)",
};

export const qvBoxVariants = cva("min-w-0", {
  variants: {
    surface: surfaceClass,
    radius: radiusClass,
    padding: paddingClass,
    border: {
      none: "",
      subtle: "border border-(--color-border)",
      divider: "border border-(--color-divider)",
      tone: "border border-(--tone-border-neutral)",
    },
    shadow: {
      none: "",
      sm: "shadow-(--shadow-sm)",
      md: "shadow-(--shadow-md)",
      lg: "shadow-(--shadow-lg)",
    },
  },
  defaultVariants: {
    surface: "transparent",
    radius: "none",
    padding: "none",
    border: "none",
    shadow: "none",
  },
});

export const qvTextVariants = cva("m-0 font-sans", {
  variants: {
    role: textRoleClass,
    size: textSizeClass,
    tone: toneTextClass,
    family: {
      body: "font-sans",
      display: "font-sans",
      mono: "font-mono",
    },
    weight: {
      regular: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    leading: {
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
    },
  },
  defaultVariants: {
    role: "body",
    tone: "neutral",
    weight: "regular",
  },
});

export type QvBoxVariantProps = VariantProps<typeof qvBoxVariants>;
export type QvTextVariantProps = VariantProps<typeof qvTextVariants>;
