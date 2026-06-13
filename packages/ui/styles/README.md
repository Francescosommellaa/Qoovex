# UI Styles

Fonte runtime della fondazione visuale Qoovex Stable v0.1.

## Contenuto

- `tokens.css`: primitive stabili e token semantici.
- `base.css`: reset e baseline condivisa, senza componenti.
- `glass.css`: preset funzionali del Blur System.
- `components.css`: contratti visuali delle primitive React.
- `index.css`: entrypoint pubblico `@qoovex/ui/styles.css`.

## Regole

- I consumer usano token semantici, non primitive cromatiche isolate.
- Il blur deve dichiarare focus, separazione, profondità o trasformazione.
- `glass-deep` è solo marketing; liste, input e dati operativi restano opachi.
- Il focus ring non viene sostituito da glow o colore.
- I valori pubblici sono congelati nel contratto Stable v0.1.

Non inserire qui stili specifici di un’app, feature o componente di dominio.
