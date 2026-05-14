export const typographyTokens = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.5rem",
  "2xl": "2.75rem",
} as const;

export const fontWeightTokens = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export type TypographyToken = keyof typeof typographyTokens;
export type FontWeightToken = keyof typeof fontWeightTokens;
