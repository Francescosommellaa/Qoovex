# Operational protocol

Questo indice rimanda alle fonti canoniche: `06_OPERATIONS_AND_ENVIRONMENT.md`, `07_QUALITY_AND_RELEASE.md` e `08_SUPPORT_AND_DATA_CONTROL.md`.

Non eseguire reset, seed, `db push`, cancellazioni Azienda o cleanup Blob senza classificare il database e lo storage. I controlli standard sono definiti in `07_QUALITY_AND_RELEASE.md`.

## Database operation impact

Questo controllo e automatico e obbligatorio: non richiede che il richiedente nomini Prisma, costi o Operations. Se il perimetro e database-sensitive, il task non e completo finche l'impatto non e stato analizzato, le ottimizzazioni sicure e verificabili non sono state applicate e le esclusioni non sono state motivate. Non applicare micro-ottimizzazioni speculative e non alterare un flusso corretto quando manca evidenza di spreco.

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

La ricerca deve includere chiamate Prisma, transazioni, loop asincroni, refresh/revalidation, polling, cron e job. Le ottimizzazioni semplici che restano nel perimetro autorizzato vanno eseguite nello stesso task: eliminazione di letture duplicate, request memoization sicura, read model batch tenant-scoped, `createMany`/`updateMany` equivalenti, filtri temporali e paginazione gia convenzionata. Ogni modifica che incontra un hard stop viene invece proposta con problema, file o configurazione coinvolti, alternativa meno invasiva, rischio, beneficio e impatto atteso sulle Operations.

Local, test e Preview non possono usare Production. Ogni task deve confermare gli ambienti coinvolti prima di comandi che interrogano Prisma; una fattura o un piano superiore non autorizzano query superflue. Le quote del piano Prisma sono condivise tra i database dello stesso account/installazione, quindi anche il traffico Preview consuma il plafond comune.
