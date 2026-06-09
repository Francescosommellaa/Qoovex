# HeroSection

## Cosa e
Hero mobile-first per pagine pubbliche Qoovex.

## Come e composto
- `Box`, `Stack`, `Text`, `Icon`.
- `Badge` per eyebrow opzionale.
- `Button` per azioni.
- Slot visuale opzionale.
- Blocco proof opzionale con coppie valore/label.
- Gradiente radiale atmosferico off-canvas, mai strutturale.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| eyebrow | ReactNode | undefined | testo breve |
| title | ReactNode | n/a | contenuto testuale |
| description | ReactNode | n/a | contenuto testuale |
| actions | array | [] | azioni con href |
| visual | ReactNode | undefined | componente DS/pattern |
| proof | ReactNode oppure array | undefined | metriche o blocco proof |

## Token usati
- Spacing: `--spacing-6`, `--spacing-12`, `--spacing-16`.
- Typography: ruoli `hero`, `body` e `caption`.
- Container: `--container-wide`.

## Regole ferree
- Non creare CTA locali: usare solo `actions`, renderizzate con `Button`.
- Non inserire valori layout locali nel consumer.
- Non sostituire `Text`, `Stack` o `Box` con markup visuale locale.

## Esempi
```tsx
// Corretto
<HeroSection title="Qoovex" description="Workspace per chef." />

// Sbagliato
<section className="pt-[73px]" />
```
