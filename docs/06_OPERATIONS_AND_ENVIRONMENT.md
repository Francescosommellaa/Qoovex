# 06 â€” Operations and environment

## Migration

La history contiene 8 migration. Le prime 6 sono evidenza storica immutabile; la settima migration forward aggiunge `AccountRole?` e rimuove le tabelle e i grant delle superfici documentali autonome. L'ottava vincola ogni account a una sola membership Azienda attiva. Non riscrive la history e non usa `db push`, `migrate reset` o `migrate resolve`.

## Prove locali

- fresh: istanza Prisma Dev locale ricreata, 8 migration applicate, head attuale e drift nullo;
- upgrade: database loopback isolato con le prime 5 migration, applicazione delle migration forward, record baseline azzerati, tabelle attuali presenti, tabelle rimosse assenti e drift nullo;
- target remoto: Production Ã¨ stata verificata in sola lettura alla head `20260720010000_calendar_events`; la head Preview resta non verificata perchÃ© le variabili database integrate non sono state restituite dal pull CLI. Nessuna mutazione remota Ã¨ stata eseguita.

Il target Local verificato Ã¨ PostgreSQL loopback porta 51225 ed Ã¨ alla head attuale senza differenze rispetto a `schema.prisma`. Preview e Production non vengono piÃ¹ mutate da push o completamento CI: i relativi workflow sono `workflow_dispatch` manuali, richiedono SHA esatto e conferma testuale esatta, oltre ai gate ambiente e ai controlli giÃ  presenti.

I workflow usano gli environment GitHub `Preview â€“ qoovex-workspace` e `Production â€“ qoovex-workspace`. `VERCEL_ORG_ID`, `VERCEL_WORKSPACE_PROJECT_ID` e `VERCEL_SCOPE` sono variabili di environment; `VERCEL_TOKEN` deve essere un secret presente in entrambi gli environment prima del dispatch manuale. Gli ultimi workflow osservati sono falliti sul controllo di questa credenziale prima di qualsiasi reset, migration o deploy. `VERCEL_AUTOMATION_BYPASS_SECRET` Ã¨ opzionale e serve soltanto quando la protezione deployment lo richiede.

## Env

IBAN: `QOOVEX_DATA_ENCRYPTION_KEYS` e `QOOVEX_DATA_ENCRYPTION_ACTIVE_KEY_ID`. E2E puÃ² usare chiave sintetica e Blob adapter locale soltanto con `QOOVEX_E2E_MODE=1` e attestazioni esistenti. Preview e Production richiedono database, Blob, callback e segreti distinti; Blob resta privato.

## Runner e cleanup

Il workflow schedulato invoca data-control via GET e il runner attuale via POST, entrambi protetti da `CRON_SECRET`. Cleanup ordinario Ã¨ limitato a token/grant scaduti, archivi export oltre retention e Blob realmente orfani non soggetti a hold. `ORGANIZATION_DELETE` non Ã¨ disponibile.

## hard_stop

Nessun `db push`, `migrate reset`, `migrate resolve` o SQL manuale nei workflow di release. Il deploy remoto richiede dispatch manuale, conferma testuale esatta, target identity, isolamento Preview/Production, backup verificato e `prisma migrate deploy`; l'esecuzione non Ã¨ autorizzata da questo documento nÃ© dallo stato corrente del repository.
