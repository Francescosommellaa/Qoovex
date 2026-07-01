# /api/document-packages/[packageId]/items/[itemId]

Gestione del singolo item del pacchetto.

- `PATCH`: aggiorna la posizione.
- `DELETE`: rimuove l'item.

`DocumentPackageItem` non ha `archivedAt`; la rimozione elimina solo la riga item, non i record collegati.
