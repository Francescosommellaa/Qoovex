# Migrazione da Stable v0.1 a v0.5

La v0.5 e` intenzionalmente breaking.

## Rimozioni

- `GlassPanel`.
- `Card variant="glass|glass-strong|inverse|elevated"`.
- `Button variant="ghost|glass"`.
- Classi pubbliche `qv-glass-subtle|soft|medium|strong|deep`.
- `Input` con label e messaggi incorporati.

## Sostituzioni

```tsx
// v0.1
<Card variant="glass">...</Card>

// v0.5
<Card material="crystal" purpose="focus">...</Card>
```

```tsx
// v0.1
<Input id="name" label="Nome" message="Obbligatorio" status="error" />

// v0.5
<Field label="Nome" message="Obbligatorio" status="error">
  <Input />
</Field>
```

`ghost` diventa `tertiary`; le superfici inverse usano
`material="inverse"`. I componenti complessi usano le API compound Radix
esposte dal package.
