# /api/document-packages

Pacchetti documentali interni dell'organizzazione.

- `GET`: lista pacchetti attivi filtrati dal contesto `Organization`.
- `POST`: crea un pacchetto documentale.

Permessi: `documentPackages:read` per lettura, `documentPackages:create` per creazione.

Non espone viewer, token, file Blob o URL permanenti.
