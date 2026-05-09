export const colorTokens = {
  bg: "oklch(0.1 0 0)",
  surface: "oklch(0.12 0 0)",
  surface2: "oklch(0.14 0 0)",
  surfaceOffset: "oklch(0.16 0 0)",
  surfaceDynamic: "oklch(0.19 0 0)",
  surfaceRaised: "oklch(0.22 0 0)",
  border: "oklch(1 0 0 / 0.08)",
  divider: "oklch(1 0 0 / 0.05)",
  overlay: "oklch(0 0 0 / 0.4)",
  text: "oklch(0.94 0 0)",
  textMuted: "oklch(0.94 0 0 / 0.7)",
  textFaint: "oklch(0.94 0 0 / 0.56)",
  textInverse: "oklch(0.1 0 0)",
  primary: "oklch(0.42 0.05 240)",
  success: "oklch(0.65 0.15 152)",
  warning: "oklch(0.72 0.16 65)",
  error: "oklch(0.52 0.22 22)",
} as const;

export type ColorToken = keyof typeof colorTokens;

