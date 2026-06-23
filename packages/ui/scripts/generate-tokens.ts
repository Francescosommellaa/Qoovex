import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { qoovexTokens } from '../src/tokens';

const outputPath = fileURLToPath(new URL('../styles/tokens.css', import.meta.url));

function px(value: number) {
  return `${value}px`;
}

function shadow(value: { x: number; y: number; blur: number; spread: number; color: string }) {
  return `${px(value.x)} ${px(value.y)} ${px(value.blur)} ${px(value.spread)} ${value.color}`;
}

function declaration(name: string, value: string | number) {
  return `  --qv-${name}: ${value};`;
}

export function renderTokensCss() {
  const {
    blur,
    border,
    breakpoint,
    color,
    font,
    layout,
    motion,
    opacity,
    radius,
    shadow: shadows,
    space,
    target,
    zIndex
  } = qoovexTokens;
  const declarations = [
    ...Object.entries(color.primitive).map(([name, value]) =>
      declaration(`palette-${toKebabCase(name)}`, value.toLowerCase())
    ),
    declaration('color-background', 'var(--qv-palette-canvas)'),
    declaration('color-foreground', 'var(--qv-palette-graphite)'),
    declaration('color-muted', 'var(--qv-palette-panel-muted)'),
    declaration('color-muted-foreground', 'var(--qv-palette-muted)'),
    declaration('color-surface', 'var(--qv-palette-white)'),
    declaration('color-surface-elevated', 'var(--qv-palette-white)'),
    declaration('color-surface-glass', color.semantic.surfaceGlass),
    declaration('color-surface-subtle', 'var(--qv-palette-panel-muted)'),
    declaration('color-border', 'var(--qv-palette-line)'),
    declaration('color-border-subtle', 'var(--qv-palette-line-subtle)'),
    declaration('color-border-strong', 'var(--qv-palette-line-strong)'),
    declaration('color-border-inverse', color.semantic.borderInverse),
    declaration('color-accent', 'var(--qv-palette-graphite)'),
    declaration('color-accent-foreground', 'var(--qv-palette-white)'),
    declaration('color-accent-hover', 'var(--qv-palette-graphite-hover)'),
    declaration('color-accent-subtle', 'var(--qv-palette-panel-muted)'),
    ...(['danger', 'warning', 'success', 'info'] as const).flatMap((name) => [
      declaration(`color-${name}`, `var(--qv-palette-${name})`),
      declaration(`color-${name}-foreground`, 'var(--qv-palette-white)'),
      declaration(`color-${name}-subtle`, `var(--qv-palette-${name}-subtle)`)
    ]),
    declaration('color-focus-ring', 'var(--qv-palette-info)'),
    declaration('color-overlay', color.semantic.overlay),
    declaration('color-shadow', color.semantic.shadow),
    declaration('color-glow', color.semantic.glow),
    declaration('color-foreground-inverse', 'var(--qv-palette-white)'),
    declaration('color-muted-foreground-inverse', 'var(--qv-palette-inverse-muted)'),
    declaration('color-highlight', 'var(--qv-palette-highlight)'),
    declaration('font-family-display', `var(--font-display, ${font.family.display})`),
    declaration('font-family-heading', 'var(--qv-font-family-display)'),
    declaration('font-family-body', `var(--font-body, ${font.family.body})`),
    declaration('font-family-label', 'var(--qv-font-family-body)'),
    declaration('font-family-caption', 'var(--qv-font-family-body)'),
    declaration('font-family-data', `var(--font-data, ${font.family.data})`),
    ...Object.entries(font.size).map(([name, value]) =>
      declaration(`font-size-${toKebabCase(name)}`, px(value))
    ),
    ...Object.entries(font.lineHeight).map(([name, value]) =>
      declaration(`line-height-${toKebabCase(name)}`, value)
    ),
    ...Object.entries(font.weight).map(([name, value]) =>
      declaration(`font-weight-${toKebabCase(name)}`, value)
    ),
    ...Object.entries(font.letterSpacing).map(([name, value]) =>
      declaration(`letter-spacing-${toKebabCase(name)}`, value)
    ),
    ...Object.entries(space).map(([name, value]) =>
      declaration(`space-${name === 'half' ? '0-5' : name}`, px(value))
    ),
    ...Object.entries(radius).map(([name, value]) => declaration(`radius-${name}`, px(value))),
    ...Object.entries(border.width).map(([name, value]) =>
      declaration(`border-width-${name}`, px(value))
    ),
    ...Object.entries(opacity).map(([name, value]) => declaration(`opacity-${name}`, value)),
    ...Object.entries(blur).map(([name, value]) => declaration(`blur-${name}`, px(value))),
    ...Object.entries(shadows).map(([name, value]) =>
      declaration(`shadow-${toKebabCase(name)}`, shadow(value))
    ),
    declaration('elevation-base', 'none'),
    declaration('elevation-raised', 'var(--qv-shadow-soft)'),
    declaration('elevation-floating', 'var(--qv-shadow-medium)'),
    declaration('elevation-overlay', 'var(--qv-shadow-strong)'),
    ...Object.entries(motion.duration).map(([name, value]) =>
      declaration(`duration-${name}`, `${value}ms`)
    ),
    ...Object.entries(motion.easing).map(([name, value]) => declaration(`easing-${name}`, value)),
    declaration('transition-hover', 'var(--qv-duration-fast) var(--qv-easing-standard)'),
    declaration('transition-entrance', 'var(--qv-duration-slow) var(--qv-easing-emphasized)'),
    ...Object.entries(zIndex).map(([name, value]) => declaration(`z-${toKebabCase(name)}`, value)),
    ...Object.entries(breakpoint).map(([name, value]) => declaration(`breakpoint-${name}`, value)),
    declaration('page-max', px(layout.pageMax)),
    declaration('reading-max', px(layout.readingMax)),
    declaration('floating-max', px(layout.floatingMax)),
    declaration('overlay-sm', px(layout.overlaySm)),
    declaration('overlay-md', px(layout.overlayMd)),
    declaration('overlay-lg', px(layout.overlayLg)),
    declaration('drawer-max', px(layout.drawerMax)),
    declaration('gutter-min', px(layout.gutterMin)),
    declaration('gutter-preferred', layout.gutterPreferred),
    declaration('gutter-max', px(layout.gutterMax)),
    declaration('sticky-offset', px(layout.stickyOffset)),
    declaration('target-min', px(target.minimum))
  ];

  return [
    '/* This file is generated by packages/ui/scripts/generate-tokens.ts. */',
    '/* Run `pnpm --filter @qoovex/ui tokens:generate` after editing src/tokens.ts. */',
    ':root {',
    ...declarations,
    '}',
    ''
  ].join('\n');
}

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
}

async function main() {
  const generated = renderTokensCss();
  if (process.argv.includes('--check')) {
    const current = await readFile(outputPath, 'utf8').catch(() => '');
    if (current !== generated) {
      console.error('styles/tokens.css non è sincronizzato con src/tokens.ts.');
      process.exitCode = 1;
    }
    return;
  }

  await writeFile(outputPath, generated, 'utf8');
}

await main();
