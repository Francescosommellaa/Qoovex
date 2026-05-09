# UI Styles

## Cosa e
Base stilistica condivisa del design system: token, temi e reset.

## Come e composto
- `tokens.css`: CSS variables runtime. Non e una fonte separata, ma il mirror consumabile dal browser.
- `base.css`: reset e base layer.
- `tokens/`: fonte TypeScript delle scale e dei tipi token.
- `themes/`: temi `dark` e `white`.

## Props / API
| File | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| `tokens.css` | CSS variables | dark | token semantici |
| `base.css` | CSS | base | reset e stile globale minimo |
| `tokens/*.ts` | TS token maps | canonical | scale approvate |
| `themes/*.ts` | TS theme maps | dark/white | valori tokenizzati |

## Token usati
- Colors, spacing, typography, radius, motion, effects e z-index.
- I valori raw vivono solo nei token source o nel mirror CSS.

## Regole ferree
- Le app importano questi file, non duplicano token.
- `base.css` resta reset/base: niente componenti o layout app-specifici.
- Nuovi valori visuali richiedono token, tema e documentazione.
- `styles/tokens/*.ts` e `styles/tokens.css` devono restare sincronizzati.

## Esempi
```css
/* Corretto */
color: var(--color-text);
padding: var(--spacing-4);

/* Sbagliato */
color: #ffffff;
padding: 14px;
```
