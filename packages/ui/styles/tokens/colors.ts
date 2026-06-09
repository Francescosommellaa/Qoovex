export const colorTokens = {
  bg: "#ffffff",
  surface: "#ffffff",
  surface2: "#f4f3ef",
  surfaceOffset: "#ecebea",
  surfaceDynamic: "#e2ddfd",
  surfaceRaised: "#ffffff",
  border: "rgba(17, 17, 17, 0.12)",
  divider: "rgba(17, 17, 17, 0.08)",
  overlay: "rgba(17, 17, 17, 0.42)",
  text: "#111111",
  textMuted: "#6d6c6b",
  textFaint: "#767573",
  textInverse: "#ffffff",
  primary: "#111111",
  success: "#25734a",
  warning: "#8a5a00",
  error: "#b42318",
} as const;

export type ColorToken = keyof typeof colorTokens;
