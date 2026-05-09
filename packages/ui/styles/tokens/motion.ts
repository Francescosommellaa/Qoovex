export const motionTokens = {
  easeQoovex: "cubic-bezier(0.16, 1, 0.3, 1)",
  durationFast: "120ms",
  durationBase: "180ms",
  durationSlow: "300ms",
} as const;

export type MotionToken = keyof typeof motionTokens;

