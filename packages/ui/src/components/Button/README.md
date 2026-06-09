# Button

Gerarchie operative monocromatiche condivise da marketing e prodotto.

## API

- `variant`: `primary | secondary | ghost | destructive | inverse`
- `size`: `xs | sm | md | lg`
- Supporta loading, icone, icon-only, label swap e conferma a due click per
  azioni distruttive.
- `inverse` si usa esclusivamente su superfici Obsidian o Violet.
- La size `sm` misura 42 px ed e la size canonica per le CTA della Topbar.
- Hover, active, focus, disabled e loading appartengono al componente: non
  duplicarli con override locali.

```tsx
<Button variant="primary">Salva</Button>
<Button variant="secondary">Annulla</Button>
<Button variant="inverse">Inizia gratis</Button>
```

Per gli icon-only fornire sempre un nome accessibile tramite `aria-label`.
Non creare varianti decorative locali e non usare colori hardcoded.
