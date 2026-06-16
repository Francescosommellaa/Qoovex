# Tokens Spec

Tokens translate the design language into implementation. Components must use
semantic tokens, not primitive values directly.

## Primitive Tokens

Color primitives:

```css
--qv-color-porcelain-0: #ffffff;
--qv-color-porcelain-50: #faf9f6;
--qv-color-porcelain-100: #f2f0ea;
--qv-color-graphite-900: #111111;
--qv-color-graphite-800: #1c1c1a;
--qv-color-graphite-700: #2c2b28;
--qv-color-steel-500: #8a8a84;
--qv-color-steel-300: #c9c8c0;
--qv-color-steel-100: #eeece4;
--qv-color-heat-500: #d96b2b;
--qv-color-herb-500: #5f7a4f;
--qv-color-wheat-500: #c9a646;
--qv-color-error-500: #b42318;
```

Token groups:

- Color primitives.
- Semantic surfaces, text, border, action and state tokens.
- Typography roles.
- Spacing scale.
- Radius scale.
- Elevation.
- Motion duration and easing.
- Focus, z-index and layout tokens.
- Mode overrides for `default`, `kitchen` and `review`.

## Semantic Rule

Do not write:

```css
background: #d96b2b;
```

Write:

```css
background: var(--qv-action-primary-bg);
```

## Component Readiness

Component tokens can exist only when a real component is approved. Until then,
`packages/ui` exposes foundations only.

Future component token files must define:

- Purpose.
- Allowed variants.
- States.
- Density.
- Accessibility constraints.
- Test requirements.

