# UI Package

Scopo: design system condiviso del monorepo.

Metti qui:
- componenti shared, token, base styles e utilita` interne al design system.

Non mettere qui:
- componenti di business Qoovex;
- layout specifici di una sola app.

Regole:
- `styles/` e` la fonte canonica dei token e del base layer;
- `src/components` contiene componenti shared riusabili;
- se un componente non serve ad almeno due contesti, valuta se deve restare app-local.
