# Testing readiness plan

Questo documento traccia i test mancanti per portare Qoovex da suite unit/service a copertura MVP verificabile su browser, storage, database e configurazione produzione.

## Stato attuale

La copertura attuale è principalmente Vitest unit/service in `apps/workspace/src/shared/server` e test copy/UI statici. Copre bene molti invarianti server-side, ma non dimostra ancora che i flussi principali funzionino end-to-end nel browser con DB, Blob, auth, ruoli e route reali.

Non esiste ancora una configurazione Playwright tracciata nel repo.

## Test bloccanti per MVP pubblico

### 1. End-to-end Playwright dei flussi principali

Obiettivo: verificare che un utente reale possa usare il prodotto dal browser.

Flussi minimi:

- sign-up credentials con verifica email in modalità test/console;
- sign-in;
- setup azienda quando manca una Organization;
- creazione lavoratore;
- creazione cantiere;
- creazione tipo documento;
- creazione documento;
- upload versione documento;
- download versione documento;
- creazione scadenza;
- creazione checklist;
- completamento item checklist;
- upload prova di cantiere;
- creazione pacchetto documentale;
- generazione share link;
- logout/sign-in di nuovo.

Criterio di passaggio: ogni flusso deve verificare stato UI, stato HTTP e dato persistito dove necessario. Non basta che la pagina renderizzi.

### 2. Test reale upload/download Blob

Obiettivo: evitare regressioni su documenti, PDF, foto e prove operative.

Livelli richiesti:

- unit/service con mock controllato di `@vercel/blob` per errori, file mancanti, content type e delete best-effort;
- integration opzionale con ambiente test reale Blob, gated da env esplicita, che faccia `put private -> get private -> delete`;
- test download route che verifichi header `Cache-Control: private, no-store`, filename sanitizzato e assenza di URL Blob permanenti.

Criterio di passaggio: nessun file temporaneo deve restare nello store dopo il test.

### 3. Share link revocato/scaduto da browser anonimo

Obiettivo: verificare il comportamento reale del viewer anonimo, non solo il service.

Flussi:

- token valido apre il pacchetto condiviso in sola lettura;
- token revocato restituisce pagina/errore sicuro;
- token scaduto restituisce pagina/errore sicuro;
- token inesistente non rivela se il pacchetto esiste;
- download item incluso funziona solo con token valido;
- download item non incluso viene negato.

Criterio di passaggio: browser anonimo non deve avere sessione workspace e non deve ricevere `blobKey`, `tokenHash` o URL permanenti.

Nota: prima di rendere questi test verdi serve che il viewer pubblico e le route share anonime siano effettivamente esposte fuori dalla protezione auth.

### 4. SITE_MANAGER e WORKER su tutte le pagine workspace

Obiettivo: verificare i filtri per risorsa a livello pagina/browser, non solo service.

Matrice minima:

- `SITE_MANAGER` vede solo cantieri assegnati;
- `SITE_MANAGER` può operare su checklist/prove dei cantieri assegnati;
- `SITE_MANAGER` non accede a documenti, lavoratori, cantieri, pacchetti o audit fuori scope;
- `WORKER` vede solo dati personali o assegnati;
- `WORKER` non accede ad admin broad pages;
- entrambi ricevono errori/empty state sicuri, non dati di altre aziende o risorse.

Pagine da coprire:

- `/dashboard`;
- `/documents`;
- `/deadlines`;
- `/workers`;
- `/job-sites`;
- `/checklists`;
- `/evidence`;
- `/document-packages`;
- `/notifications`;
- `/access`;
- `/audit-log`;
- `/data-control`.

Criterio di passaggio: nessuna pagina deve mostrare dati fuori `organizationId` o fuori assegnazione risorsa.

### 5. Produzione env missing: fallimento chiaro

Obiettivo: evitare deploy che partono parzialmente e falliscono in modo opaco.

Test richiesti:

- `AUTH_SECRET` assente in produzione;
- `DATABASE_URL` assente;
- `QOOVEX_MFA_ENCRYPTION_KEY` assente quando si usa MFA;
- `BLOB_READ_WRITE_TOKEN`/OIDC Blob non valido su upload;
- `RESEND_API_KEY` assente o invalida in produzione;
- `QOOVEX_CRON_SECRET` assente su endpoint digest.

Criterio di passaggio: l'app deve fallire con messaggio server chiaro e senza esporre secret o stack sensibile al client.

### 6. Migration drift Prisma

Obiettivo: bloccare drift tra schema Prisma, migration e database reale.

Comandi da portare in CI:

```powershell
pnpm --filter @qoovex/db exec prisma validate
pnpm --filter @qoovex/db exec prisma migrate status
pnpm --filter @qoovex/db exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

Criterio di passaggio:

- `validate` OK;
- `migrate status` OK;
- `migrate diff` deve produrre `-- This is an empty migration.`;
- nessun uso di `prisma db push` in produzione.

## Test da aggiungere quando DocumentRequirement sarà implementato

`DocumentRequirement` esiste nello schema, ma non è ancora un flusso prodotto completo.

Quando verrà implementato, coprire:

- creazione requisito per Organization/Worker/JobSite;
- collegamento opzionale a `DocumentType`;
- archiviazione requisito;
- derivazione documenti mancanti;
- impatto su dashboard e stato documentale;
- isolamento `organizationId`;
- nessun requisito normativo hardcoded non validato.

## Sequenza consigliata

1. Aggiungere configurazione Playwright e smoke auth/setup azienda.
2. Aggiungere seed/test factory per Organization, ruoli e assegnazioni.
3. Coprire CRUD browser dei flussi principali OWNER/ADMIN.
4. Coprire ruoli `SITE_MANAGER` e `WORKER` pagina per pagina.
5. Coprire Blob con mock controllato e integration gated.
6. Coprire share link anonimo dopo esposizione viewer pubblico.
7. Portare `prisma migrate diff` e controllo env missing in CI.
8. Aggiungere test DocumentRequirement quando il feature set sarà reale.

## Comandi futuri attesi

Quando la suite verrà introdotta, il repo dovrebbe esporre script espliciti:

```json
{
  "test:e2e": "playwright test",
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "check:db-drift": "prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script"
}
```

Questi script non sono ancora presenti e vanno aggiunti insieme alla configurazione test dedicata.
