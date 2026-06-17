# Specifica token

I token traducono il linguaggio di design in implementazione. I componenti
dovranno usare token semantici, non valori primitivi diretti.

## Token primitivi

Primitive colore:

```css
--qv-color-porcelain-0: #ffffff;
--qv-color-porcelain-50: #faf9f6;
--qv-color-porcelain-100: #f2f0ea;
--qv-color-graphite-900: #111111;
--qv-color-graphite-800: #1c1c1a;
--qv-color-graphite-700: #2c2b28;
--qv-color-steel-500: #8a8a84;
--qv-color-steel-300: #c9c8c0;
--qv-color-steel-100: #eeece4;
--qv-color-heat-500: #d96b2b;
--qv-color-herb-500: #5f7a4f;
--qv-color-wheat-500: #c9a646;
--qv-color-error-500: #b42318;
```

Gruppi token:

- Primitive colore.
- Token semantici per superfici, testo, bordi, azioni e stati.
- Ruoli tipografici.
- Scala spaziatura.
- Scala radius.
- Elevazione.
- Durate ed easing.
- Focus, z-index e layout.
- Override di modalita' per `default`, `kitchen` e `review`.

## Regola semantica

Non scrivere:

```css
background: #d96b2b;
```

Scrivere:

```css
background: var(--qv-action-primary-bg);
```

## Prontezza componenti

I token componente possono esistere solo quando un componente reale viene
approvato. Fino ad allora `packages/ui` espone solo fondazioni.

I futuri token componente dovranno definire:

- Scopo.
- Varianti consentite.
- Stati.
- Densita'.
- Vincoli di accessibilita'.
- Test richiesti.

