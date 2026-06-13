# UI Components

Primitive React condivise del design system Qoovex Stable v0.1.

## Componenti v0.1

- `Button`: azioni reali; la variante glass non applica backdrop blur.
  `interaction="magnetic"` è un opt-in riservato a CTA marketing primary o
  glass e si disattiva su touch, disabled e reduced motion.
- `Card`: paper di default; `glass` compone il preset medium e `glass-strong`
  il preset strong, entrambi solo sopra luce o contesto funzionale.
- `Input`: label e id obbligatori, messaggi accessibili e stati espliciti.
- `Badge`: stato testuale sempre presente, mai comunicato dal solo colore.
- `GlassPanel`: pilota del Blur System, con intensità semantiche controllate.

## Regole

- Preservare props HTML, `className` e ref React.
- Non introdurre API polymorphic, `asChild` o dipendenze di varianti nella v0.1.
- Non creare alternative app-local alle primitive presenti.
- Non aggiungere componenti di dominio, feature o business logic.
- Ogni nuova variante deve rappresentare una responsabilità distinta.
