export const typographyTokens = {
  caption: "0.625rem",
  eyebrow: "0.75rem",
  bodySm: "0.875rem",
  body: "1rem",
  subheading: "1.25rem",
  headingSm: "1.5rem",
  heading: "1.75rem",
  headingLg: "2.25rem",
  display: "3.5rem",
  hero: "5.25rem",
  xs: "0.625rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.25rem",
  xl: "1.75rem",
  "2xl": "3.5rem",
} as const;

export const fontWeightTokens = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
} as const;

export type TypographyToken = keyof typeof typographyTokens;
export type FontWeightToken = keyof typeof fontWeightTokens;
