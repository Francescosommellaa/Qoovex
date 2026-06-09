# Card

Superficie strutturale piatta per contenuti, form, liste e composizioni.

## API

- `variant`: `paper | cream | pastel | obsidian | violet`
- `tone`: `neutral | primary | success | warning | error`
- `padding`: `none | sm | md | lg`
- `span`: `auto | wide | tall | featured`
- `overflow`: `hidden | visible`
- `interactive`: abilita il comportamento interattivo tokenizzato.

Le varianti legacy `surface`, `panel`, `bento` e `quiet` restano temporaneamente
come alias di migrazione e non vanno usate nel nuovo codice.

```tsx
<Card variant="cream" padding="lg">
  <CardBody>Contenuto operativo</CardBody>
</Card>
```

Obsidian e Violet sono contesti locali intenzionali, non temi globali.
