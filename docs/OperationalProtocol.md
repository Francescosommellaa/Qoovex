# Operational protocol

Questo indice rimanda alle fonti canoniche: `06_OPERATIONS_AND_ENVIRONMENT.md`, `07_QUALITY_AND_RELEASE.md` e `08_SUPPORT_AND_DATA_CONTROL.md`.

Non eseguire reset, seed, `db push`, cancellazioni Azienda o cleanup Blob senza classificare il database e lo storage. I controlli standard sono definiti in `07_QUALITY_AND_RELEASE.md`.

## Database operation impact

Ogni task che introduce o modifica route, server action, servizio, query, dashboard, widget dati, polling, reminder, job, notifiche, audit, liste, ricerche, filtri, export, supporto, retention o workflow documentali deve riportare:

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

Il conteggio di chiamate Prisma Client e una proxy operativa, non va presentato come metrica ufficiale Prisma Postgres. Distinguere sempre riduzione delle operazioni da miglioramenti di latenza, egress, payload, CPU o concorrenza. Nessun budget numerico globale e ammesso: un budget puo essere introdotto soltanto per un flusso misurato, con margine e test di regressione.

La review deve verificare caso normale e peggiore, N+1, duplicazioni nello stesso request lifecycle, query condivise tra layout/pagina/widget, polling, paginazione, batch, cache tenant-aware e invalidazione. Autorizzazione e `organizationId` server-derived non possono essere rimossi; risultati request-scoped possono essere riusati senza attraversare richieste o tenant.
