# Document Types API

Tipi documento configurabili dall'azienda.

- `GET /api/document-types`: lista tipi attivi filtrati per `organizationId`.
- `POST /api/document-types`: crea un tipo documento con `appliesTo`, `categoryKey` e `sensitivity` coerenti.

Permessi:
- lettura: `documents:read`;
- creazione: `documents:update`.

Nessun preset normativo viene creato da questa API. Le categorie arrivano dal registro stabile di `@qoovex/types`; nuovi tipi `UNCLASSIFIED`, `EVIDENCE` o `OTHER` sono rifiutati.
