# UI Lib

## Cosa e
Utility interne che supportano componenti e pattern del design system.

## Come e composto
- `utils.ts`: merge classi e helper minimi.
- Funzioni pure usate dai componenti UI.

## Props / API
| Export | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| `cn` | function | none | classi token-safe |

## Token usati
- Nessun token diretto obbligatorio: le utility non decidono valori visuali.

## Regole ferree
- Non inserire logica business.
- Non generare classi visuali arbitrarie.
- Non duplicare helper condivisi gia presenti in altri package.

## Esempi
```ts
// Corretto
cn("qv-card", isActive && "qv-card--active");

// Sbagliato
cn(`p-[${padding}px]`);
```
