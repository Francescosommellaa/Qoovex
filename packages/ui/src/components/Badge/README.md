# Badge

Etichetta compatta per stato, categoria e annunci.

## API

- `variant`: `soft | outline | filled | announcement`
- `tone`: `neutral | primary | success | warning | error`
- `size`: `sm | md | lg`

`announcement` aggiunge il prefisso visivo `NEW` e va usato per novita brevi,
non per stati operativi.

```tsx
<Badge variant="announcement">Nuovo sistema</Badge>
<Badge variant="outline">Bozza</Badge>
```
