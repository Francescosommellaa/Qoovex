# Button

Gerarchie operative del Design System V2.

## API

- `variant`: `primary | secondary | ghost | destructive | inverse`
- `size`: `xs | sm | md | lg`
- Supporta loading, icone, label swap e conferma a due click per azioni distruttive.
- `inverse` si usa esclusivamente su superfici Obsidian o Violet.

```tsx
<Button variant="primary">Salva</Button>
<Button variant="secondary">Annulla</Button>
<Button variant="inverse">Inizia gratis</Button>
```

Non creare varianti decorative locali e non usare colori hardcoded.
