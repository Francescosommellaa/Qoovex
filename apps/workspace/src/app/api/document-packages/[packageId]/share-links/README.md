# /api/document-packages/[packageId]/share-links

Link di condivisione revocabili per un pacchetto documentale.

- `GET`: lista metadata dei link senza token raw e senza hash.
- `POST`: crea un link e restituisce il token raw una sola volta.

Default scadenza: 7 giorni se `expiresAt` non viene fornito.
La creazione e default-deny se il pacchetto contiene documenti o versioni non classificati oppure con sensibilita diversa da `STANDARD`.
