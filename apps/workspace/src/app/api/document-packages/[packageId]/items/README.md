# /api/document-packages/[packageId]/items

Elementi inclusi nel pacchetto documentale.

- `GET`: lista item ordinati.
- `POST`: aggiunge `DOCUMENT`, `DOCUMENT_VERSION`, `EVIDENCE`, `CHECKLIST` o `NOTE`.

Gli item devono appartenere alla stessa organizzazione e non possono puntare a record archiviati.
