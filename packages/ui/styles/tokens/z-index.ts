export const zIndexTokens = {
  base: "0",
  raised: "10",
  dropdown: "100",
  sticky: "200",
  modal: "300",
  toast: "400",
  overlay: "500",
} as const;

export type ZIndexToken = keyof typeof zIndexTokens;

