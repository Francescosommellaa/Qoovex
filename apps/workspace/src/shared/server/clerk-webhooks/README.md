# Clerk Webhook Services

Scopo: service server-only dedicati agli eventi Clerk.

Metti qui:
- type guard e DTO del payload Clerk;
- dispatcher evento -> service;
- handler per singolo evento o gruppo coerente di eventi.

Non mettere qui:
- `NextResponse`;
- verifica firma Svix;
- componenti React;
- accesso diretto a `@qoovex/db`.

Regole:
- la route API verifica firma e chiama il dispatcher;
- ogni service restituisce un DTO `{ body, status }`;
- loggare solo metadati sanitizzati, mai payload completi o secret.
