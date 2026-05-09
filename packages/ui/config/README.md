# UI Config

## Cosa e
Configurazione globale delle varianti e delle scale ammesse dal design system.

## Come e composto
- `variants.ts`: CVA, scale tokenizzate e class map condivise.

## Props / API
| Export | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| `qvSpacing` | readonly array | none | scala spacing ufficiale |
| `qvRadius` | readonly array | none | scala radius ufficiale |
| `qvTone` | readonly array | none | toni semantici ufficiali |
| `spacingClass` | record | none | classi basate su `--spacing-*` |
| `radiusClass` | record | none | classi basate su `--radius-*` |

## Token usati
- Spacing: `--spacing-*`.
- Radius: `--radius-*`.
- Color: semantici `--color-*`.
- Typography: `--text-*`.

## Regole ferree
- Le varianti globali non accettano numeri liberi.
- Le app non importano Tailwind arbitrary values per inventare scale.
- Nuove size/tone/radius vanno aggiunte qui e documentate.

## Esempi
```ts
// Corretto
<Stack gap="4" />

// Sbagliato
<Stack className="gap-[13px]" />
```
