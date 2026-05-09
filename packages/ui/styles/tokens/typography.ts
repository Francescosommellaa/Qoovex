export const typographyTokens = {
  xs: "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
  sm: "clamp(0.875rem, 0.8rem + 0.35vw, 1rem)",
  base: "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)",
  lg: "clamp(1.125rem, 1rem + 0.75vw, 1.5rem)",
  xl: "clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem)",
  "2xl": "clamp(2rem, 1.2rem + 2.5vw, 3.5rem)",
} as const;

export type TypographyToken = keyof typeof typographyTokens;

