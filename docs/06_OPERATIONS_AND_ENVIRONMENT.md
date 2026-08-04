# 06 — Operations and environment

## Migration

La history contiene 6 migration. Le prime 5 coincidono con il baseline Production; `20260803230000_qoovex_vnext_from_zero` è il solo passaggio al nuovo dominio. La migration esegue un reset irreversibile dei record baseline esplicitamente autorizzato, elimina tabelle/enum/colonne legacy e crea membership multiple, participant cliente, immobili, agreement, timeline, allegati, step, richieste, proposte, autorità economica, pagamenti documentati, dispute, closure/export e processi vNext.

## Prove locali

- fresh: istanza Prisma Dev locale ricreata, 6 migration applicate, head vNext e drift nullo;
- upgrade: database loopback isolato con le prime 5 migration, applicazione della sola migration vNext, record baseline azzerati, tabelle vNext presenti, tabelle legacy assenti e drift nullo;
- target remoto: Production è stata verificata in sola lettura alla head `20260720010000_calendar_events`; la head Preview resta non verificata perché le variabili database integrate non sono state restituite dal pull CLI. Nessuna mutazione remota è stata eseguita.

Il target Local verificato è PostgreSQL loopback porta 51225 ed è alla head vNext senza differenze rispetto a `schema.prisma`. Preview e Production non vengono più mutate da push o completamento CI: i relativi workflow sono `workflow_dispatch` manuali, richiedono SHA esatto e conferma testuale esatta, oltre ai gate ambiente e ai controlli già presenti.

I workflow usano gli environment GitHub `Preview – qoovex-workspace` e `Production – qoovex-workspace`. `VERCEL_ORG_ID`, `VERCEL_WORKSPACE_PROJECT_ID` e `VERCEL_SCOPE` sono variabili di environment; `VERCEL_TOKEN` deve essere un secret presente in entrambi gli environment prima del dispatch manuale. Gli ultimi workflow osservati sono falliti sul controllo di questa credenziale prima di qualsiasi reset, migration o deploy. `VERCEL_AUTOMATION_BYPASS_SECRET` è opzionale e serve soltanto quando la protezione deployment lo richiede.

## Env

IBAN: `QOOVEX_DATA_ENCRYPTION_KEYS` e `QOOVEX_DATA_ENCRYPTION_ACTIVE_KEY_ID`. E2E può usare chiave sintetica e Blob adapter locale soltanto con `QOOVEX_E2E_MODE=1` e attestazioni esistenti. Preview e Production richiedono database, Blob, callback e segreti distinti; Blob resta privato.

## Runner e cleanup

Il workflow schedulato invoca data-control via GET e il runner vNext via POST, entrambi protetti da `CRON_SECRET`. Cleanup ordinario è limitato a token/grant scaduti, archivi export oltre retention e Blob realmente orfani non soggetti a hold. `ORGANIZATION_DELETE` non è disponibile.

## hard_stop

Nessun `db push`, `migrate reset`, `migrate resolve` o SQL manuale nei workflow di release. Il reset remoto per `20260803230000_qoovex_vnext_from_zero` resta tecnicamente disponibile soltanto dietro dispatch manuale, conferma testuale esatta, target identity, isolamento Preview/Production e reset Blob one-shot; l'esecuzione non è autorizzata da questo documento né dallo stato corrente del repository.
