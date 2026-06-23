const colorPrimitive = {
  graphite: '#182024',
  graphiteHover: '#263238',
  steel: '#526168',
  muted: '#566469',
  canvas: '#F3F6F4',
  white: '#FFFFFF',
  line: '#D5DDDA',
  lineSubtle: '#E5EBE8',
  lineStrong: '#BFC9C5',
  panelMuted: '#E8EDEB',
  success: '#28704A',
  successSubtle: '#EDF7F0',
  warning: '#99500E',
  warningSubtle: '#FFF6E9',
  danger: '#AD3030',
  dangerSubtle: '#FFF0F0',
  info: '#0B6BCB',
  infoSubtle: '#EAF3FC',
  highlight: '#EAB56F',
  inverseMuted: '#CBD3D0'
} as const;

const colorSemantic = {
  background: colorPrimitive.canvas,
  foreground: colorPrimitive.graphite,
  muted: colorPrimitive.panelMuted,
  mutedForeground: colorPrimitive.muted,
  surface: colorPrimitive.white,
  surfaceElevated: colorPrimitive.white,
  surfaceGlass: 'rgb(255 255 255 / 0.82)',
  surfaceSubtle: colorPrimitive.panelMuted,
  border: colorPrimitive.line,
  borderSubtle: colorPrimitive.lineSubtle,
  borderStrong: colorPrimitive.lineStrong,
  borderInverse: 'rgb(255 255 255 / 0.22)',
  accent: colorPrimitive.graphite,
  accentForeground: colorPrimitive.white,
  accentHover: colorPrimitive.graphiteHover,
  accentSubtle: colorPrimitive.panelMuted,
  danger: colorPrimitive.danger,
  dangerForeground: colorPrimitive.white,
  dangerSubtle: colorPrimitive.dangerSubtle,
  warning: colorPrimitive.warning,
  warningForeground: colorPrimitive.white,
  warningSubtle: colorPrimitive.warningSubtle,
  success: colorPrimitive.success,
  successForeground: colorPrimitive.white,
  successSubtle: colorPrimitive.successSubtle,
  info: colorPrimitive.info,
  infoForeground: colorPrimitive.white,
  infoSubtle: colorPrimitive.infoSubtle,
  focusRing: colorPrimitive.info,
  overlay: 'rgb(24 32 36 / 0.58)',
  shadow: 'rgb(28 44 38 / 0.19)',
  glow: 'rgb(11 107 203 / 0.24)',
  foregroundInverse: colorPrimitive.white,
  mutedForegroundInverse: colorPrimitive.inverseMuted,
  highlight: colorPrimitive.highlight
} as const;

export const qoovexTokens = {
  color: {
    primitive: colorPrimitive,
    semantic: colorSemantic
  },
  font: {
    family: {
      display: '"Cabinet Grotesk", "Arial Narrow", sans-serif',
      heading: '"Cabinet Grotesk", "Arial Narrow", sans-serif',
      body: '"General Sans", system-ui, sans-serif',
      label: '"General Sans", system-ui, sans-serif',
      caption: '"General Sans", system-ui, sans-serif',
      data: '"IBM Plex Mono", ui-monospace, monospace'
    },
    size: {
      displayXl: 104,
      displayLg: 78,
      displayMd: 58,
      headingXl: 48,
      headingLg: 36,
      headingMd: 30,
      headingSm: 24,
      bodyLg: 20,
      bodyMd: 17,
      bodySm: 15,
      label: 13,
      caption: 11,
      data: 12
    },
    lineHeight: {
      display: 0.9,
      heading: 1.08,
      body: 1.5,
      compact: 1.25
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      strong: 650,
      bold: 700
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      label: '0.04em',
      wide: '0.08em'
    }
  },
  space: {
    0: 0,
    half: 2,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
    button: 8,
    input: 8,
    card: 12,
    panel: 16
  },
  border: {
    width: {
      subtle: 1,
      default: 1,
      strong: 2,
      focus: 3
    }
  },
  opacity: {
    disabled: 0.48,
    subtle: 0.72
  },
  blur: {
    sm: 4,
    md: 12,
    lg: 20
  },
  shadow: {
    soft: { x: 0, y: 8, blur: 24, spread: 0, color: 'rgb(33 49 43 / 0.08)' },
    medium: { x: 0, y: 16, blur: 40, spread: 0, color: 'rgb(28 44 38 / 0.14)' },
    strong: { x: 0, y: 34, blur: 90, spread: 0, color: colorSemantic.shadow },
    glowSubtle: { x: 0, y: 0, blur: 0, spread: 4, color: colorSemantic.glow },
    glowAccent: { x: 0, y: 0, blur: 28, spread: 0, color: colorSemantic.glow }
  },
  elevation: {
    base: 'none',
    raised: 'soft',
    floating: 'medium',
    overlay: 'strong'
  },
  motion: {
    duration: {
      fast: 120,
      normal: 180,
      slow: 280,
      reduced: 1
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    }
  },
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    toast: 500,
    tooltip: 600
  },
  breakpoint: {
    mobile: '30rem',
    tablet: '48rem',
    laptop: '64rem',
    desktop: '80rem',
    wide: '96rem'
  },
  layout: {
    pageMax: 1440,
    readingMax: 720,
    floatingMax: 420,
    overlaySm: 480,
    overlayMd: 640,
    overlayLg: 880,
    drawerMax: 480,
    gutterMin: 16,
    gutterPreferred: '5vw',
    gutterMax: 96,
    stickyOffset: 112
  },
  target: {
    minimum: 48
  }
} as const;

export type QoovexTokens = typeof qoovexTokens;
