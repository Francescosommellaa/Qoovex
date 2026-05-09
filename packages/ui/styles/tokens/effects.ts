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
} as const;

export type EffectToken = keyof typeof effectTokens;
