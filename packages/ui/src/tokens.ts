export const qoovexTokens = {
  color: {
    graphite: "#182024",
    steel: "#526168",
    muted: "#566469",
    canvas: "#F3F6F4",
    panel: "#FFFFFF",
    line: "#D5DDDA",
    panelMuted: "#E8EDEB",
    ready: "#28704A",
    attention: "#99500E",
    critical: "#AD3030",
    focus: "#0B6BCB",
  },
  type: {
    display: "Barlow Condensed",
    body: "Source Sans 3",
    data: "IBM Plex Mono",
  },
  target: { minimum: 48 },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
  radius: { xs: 3, sm: 7, md: 10, lg: 14, full: 999 },
  shadow: {
    low: "0 10px 30px rgb(33 49 43 / 0.07)",
    high: "0 34px 90px rgb(28 44 38 / 0.19)",
  },
  motion: { fast: 140, normal: 200 },
  layout: { pageMax: 1440, readingMax: 720 },
  z: { sticky: 30, overlay: 50, toast: 80 },
} as const;

export type QoovexTokens = typeof qoovexTokens;
