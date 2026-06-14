# Stili Stable v0.5

- `tokens.css`: palette, scala 4 px, tipografia, densita`, radius, motion e
  profili Crystal.
- `base.css`: reset, focus, tipografia e reduced motion.
- `glass.css`: implementazione fisica di Paper, Inverse e Crystal.
- `components.css`: stati e geometria delle primitive.
- `index.css`: entrypoint pubblico `@qoovex/ui/styles.css`.

Crystal usa due pseudo-superfici non sovrapposte: frame 6 px e centro con radius
22 px dentro un host da 28 px. Host, testo e discendenti non applicano filtri.
I colori percepiti provengono esclusivamente dal backdrop reale.
