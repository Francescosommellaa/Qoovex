export const effectTokens = {
  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
  borderThinWidth: "var(--border-thin)",
  borderFocusWidth: "var(--border-focus)",
  borderAccentWidth: "var(--border-accent)",
  blurSm: "var(--blur-sm)",
  borderThin: "1px solid var(--color-border)",
  dividerThin: "1px solid var(--color-divider)",
  insetRing: "rgba(17, 17, 17, 0.05) 0 0 0 1px inset",
  elevated:
    "rgba(17, 17, 17, 0.12) 0 26px 60px -6px, rgba(17, 17, 17, 0.04) 0 6px 6px -3px",
} as const;

export type EffectToken = keyof typeof effectTokens;
