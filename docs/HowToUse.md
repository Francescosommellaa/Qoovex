# How to use the repository

La documentazione canonica e la sequenza `00_PRODUCT_AND_SCOPE.md` fino a `08_SUPPORT_AND_DATA_CONTROL.md`.

Per modifiche a schema, autorizzazioni, storage, API o UI, usare il codice e `packages/db/prisma/schema.prisma` come fonte tecnica primaria, aggiornare i documenti canonici coinvolti e completare i gate definiti in `07_QUALITY_AND_RELEASE.md`.

## Preflight automatico Operations database

Prima di ogni task, classificare automaticamente come database-sensitive qualunque modifica a route, server action, servizio, query, dashboard, widget dati, polling, reminder, job, notifiche, audit, liste, ricerche, filtri, export, supporto, retention o workflow documentali. Per questi task applicare senza attendere una richiesta separata il controllo `Database operation impact` di `OperationalProtocol.md`: ricostruire il flusso reale, misurare o stimare con evidenza le chiamate Prisma prima/dopo, cercare duplicazioni, N+1, polling, scansioni, over-fetching e accessi cloud evitabili, quindi applicare le ottimizzazioni sicure che mantengono comportamento, autorizzazioni e isolamento tenant.

Il controllo e obbligatorio anche quando l'esito e nessuna modifica: in quel caso il report deve indicare zero operazioni eliminate e motivare perche le operazioni esistenti sono inevitabili. Schema, migration, provider, auth, permessi, tenant isolation, frequenze job, audit, retention, servizi esterni e configurazioni cloud restano hard stop e richiedono approvazione esplicita.
