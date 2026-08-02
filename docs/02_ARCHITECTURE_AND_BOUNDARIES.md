# Architecture and boundaries

## `verified_current_state`

- `apps/workspace` e il runtime autenticato; `apps/web` e pubblico; `apps/sirio` e catalogo/proof; `packages/db`, `packages/types`, `packages/ui` e `packages/brand-resources` mantengono i confini correnti.
- Il modello e single-membership, tenant-scoped per `organizationId` e non contiene partecipanti o immobili cliente.
- `JobSite.clientName` e testo legacy; assegnazioni, timeline, richieste, ricerca e processi correnti sono Azienda-scoped.
- Share link tokenizzati e partecipazione autenticata sono confini diversi.

## `approved_product_direction`

### D-VNEXT-18 - risoluzione del contesto

Ogni richiesta futura risolve nell'ordine: identita autenticata, contesto selezionato e firmato, fonte di autorizzazione, risorsa canonica, tenant derivato dalla risorsa, scope e capability. Cache, cursori, deduplica, ricerca ed export includono il tipo e l'identificatore del contesto. Nessun `userId` o `organizationId` inviato dal client basta a determinare autorita.

### D-VNEXT-20 - multi-membership

La relazione futura User-Azienda e molti-a-molti con unicita `(organizationId, userId)`. Selezionare una membership non rende visibili altre membership; sessioni e invalidazione devono poter colpire il solo contesto modificato senza lasciare token stale. Le partecipazioni cliente non entrano in questa relazione.

### D-VNEXT-21 - ClientProperty

`ClientProperty` e un contenitore privato del cliente con campi concettuali: proprietario `User`, nome scelto, indirizzo, immagine Blob privata opzionale, note private, timestamp e stato. Un collegamento separato associa un immobile a un cantiere/partecipazione autorizzata.

```text
Cliente
`- Immobile privato
   |- Cantiere Azienda A
   |- Cantiere Azienda B
   `- Cantiere Azienda C
```

Invarianti:

- non e prova della proprieta legale e non e un tenant;
- l'Azienda non vede nome privato, immagine o note del cliente;
- `JobSite.address` resta separato e non viene deduplicato automaticamente con l'indirizzo dell'immobile;
- nessun matching per indirizzo collega immobili o cantieri;
- ciascuna Azienda vede soltanto il proprio cantiere e non scopre le altre;
- contenuti non attraversano cantieri senza un flusso di disclosure esplicito.

### Confini dei read model

Panoramica Azienda, contesto cliente, timeline interna, timeline condivisa, audit, processi e supporto sono read model distinti. Il dominio puo produrre eventi comuni, ma ogni proiezione rivalida partecipazione, audience, disclosure e capability. Support non usa il read model cliente per aggirare il proprio limite metadata-only.

### Placement futuro

Il futuro schema appartiene a `packages/db`, i DTO realmente condivisi a `packages/types`, l'orchestrazione e l'authorization server-side a Workspace. Le superfici restano app-local; `packages/ui` non contiene dominio o access policy. Blob resta privato e ogni download e mediato.

## `conceptual_not_implemented`

`PLATFORM`, `ORGANIZATION`, `CLIENT_JOB_SITE`, `JobSiteParticipant`, `ClientProperty`, relativi link, read model e cache key sono concetti contrattuali. Non sono tabelle, tipi pubblici, cookie, route, componenti o servizi attivi.

`JobSiteOperationalPhase` e i processi `@1` correnti non cambiano in questo task. La modalita `LEGACY/VNEXT` descritta in `06_OPERATIONS_AND_ENVIRONMENT.md` e futura.

## `hard_stop`

Retention canonica, protezione IBAN e modello commerciale definitivo sono i tre hard stop decisionali vNext. Database remoto e sicurezza della migration unica sono gate operativi. Nessuna nuova infrastruttura e autorizzata.
