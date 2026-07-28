# Operational protocol

Questo indice rimanda alle fonti canoniche `06_OPERATIONS_AND_ENVIRONMENT.md`, `07_QUALITY_AND_RELEASE.md` e `08_SUPPORT_AND_DATA_CONTROL.md`.

Non eseguire reset, seed, `db push`, migration, cancellazioni Azienda o cleanup Blob senza classificare database e storage. Una direzione prodotto o una specifica concettuale non autorizza operazioni runtime, schema, provider, retention o frequenze.

## Database operation impact

Il controllo e automatico per route, server action, servizi dati, query, dashboard, widget, polling, reminder, job, notifiche, audit, liste, ricerca, filtri, export, supporto, retention e workflow documentali. Se il task e soltanto documentale, dichiarare zero operazioni aggiunte/eliminate e non interrogare database o Blob.

Ogni task database-sensitive deve riportare:

```text
Operazioni aggiunte:
Operazioni eliminate:
Query per flusso prima:
Query per flusso dopo:
Rischio N+1:
Strategia cache:
Strategia invalidazione:
Impatto tenant isolation:
Ambienti coinvolti:
Misurazione eseguita:
```

Il conteggio Prisma Client e una proxy, non una metrica ufficiale Prisma Postgres. Verificare caso normale e peggiore, N+1, duplicazioni request-scoped, polling, paginazione, batch, cache tenant-aware e invalidazione. Autorizzazione e `organizationId` server-derived non possono essere rimossi.

Le ottimizzazioni semplici e dimostrate nel perimetro vanno incluse nello stesso task. Schema, migration, provider, auth, ruoli, tenant isolation, audit, retention, frequenze, servizi esterni e configurazioni cloud richiedono approvazione esplicita.

Per ricerca e condivisione, non inserire query di ricerca, token, hash, Blob key, URL firmati, IP o user-agent in payload, audit o log applicativi. Le route pubbliche devono usare risposte indistinguibili, `private, no-store`, `no-referrer`, `noindex, nofollow` e `nosniff`; il download resta mediato e in attachment.
