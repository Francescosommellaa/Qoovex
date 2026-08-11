# 06 — Operations and environment

## Migration

La history contiene otto migration. Le prime cinque costituiscono il baseline storico immutabile; le tre migration forward successive introducono il dominio corrente, `AccountRole`, gli allegati contestuali e il vincolo di una sola membership Azienda attiva. La history non viene riscritta e i target remoti non usano `db push`, `migrate reset`, `migrate resolve` o SQL manuale.

## Stato verificato

- Local: otto migration applicate, head attuale e drift nullo.
- Preview: rehearsal manuale completato con database isolato, cloud migration, deploy e smoke verdi.
- Production database: otto migration applicate, zero pendenti e zero drift verificati dal cloud build Production.
- Production pubblico: la promozione del deployment staged è un passaggio manuale separato, eseguito soltanto dopo CI verde e smoke.

I workflow usano gli environment GitHub `Preview – qoovex-workspace` e `Production – qoovex-workspace`. `VERCEL_ORG_ID`, `VERCEL_WORKSPACE_PROJECT_ID` e `VERCEL_SCOPE` sono variabili di environment; `VERCEL_TOKEN` è un secret dedicato. `VERCEL_AUTOMATION_BYPASS_SECRET` è opzionale e serve soltanto quando la protezione deployment lo richiede.

## Env

IBAN: `QOOVEX_DATA_ENCRYPTION_KEYS` e `QOOVEX_DATA_ENCRYPTION_ACTIVE_KEY_ID`. E2E può usare chiave sintetica e Blob adapter locale soltanto con `QOOVEX_E2E_MODE=1` e attestazioni esistenti. Preview e Production richiedono database, Blob, callback e segreti distinti; Blob resta privato.

## Runner e cleanup

Il workflow schedulato invoca data-control via GET e il runner dei processi cantiere via POST, entrambi protetti da `CRON_SECRET`. Cleanup ordinario è limitato a token/grant scaduti, archivi export oltre retention e Blob realmente orfani non soggetti a hold. `ORGANIZATION_DELETE` non è disponibile.

## hard_stop

Il deploy remoto richiede dispatch manuale, SHA e conferma testuale esatti, target identity, CI verde, `prisma migrate deploy`, smoke staged e promozione esplicita. Un head inatteso, una credenziale mancante o uno smoke fallito interrompono il workflow prima della promozione.
