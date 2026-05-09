# Patterns

## Cosa è
Composizioni ufficiali di primitives e components.

## Come è composto
- `PageSection`, `HeroSection`, `FeatureShowcase`, `CtaBand`.
- `AuthShell`, `EmptyState`, `LoadingState`, `ProductPreviewFrame`.

## Props / API
| Prop | Tipo | Default | Valori ammessi |
|------|------|---------|----------------|
| title | ReactNode | dipende | testo tramite `Text` |
| actions | array | [] | azioni con href |

## Token usati
- Solo token e componenti da `packages/ui`.

## Regole ferree
- I pattern non introducono nuovi valori visivi nelle app.
- Se manca un elemento visuale, creare prima un componente DS.

## Esempi
```tsx
// Corretto
<HeroSection title="Qoovex" description="Workspace operativo." />

// Sbagliato
<section className="rounded-[22px] p-[19px]" />
```

