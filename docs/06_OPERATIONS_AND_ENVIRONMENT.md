# 06 — Operations and environment

## Migration

La history contiene 19 migration. Prompt B aggiunge soltanto `20260803010000_implement_qoovex_vnext`; nessuna migration precedente è stata riscritta. La migration crea il dominio vNext, rende le membership multi-azienda, migra `JobSiteUserAssignment` in participant Azienda, porta i JobSite esistenti a `DRAFT revision=1`, conserva l’eventuale `archivedAt` legacy in audit tecnico e non inventa clienti, agreement o timeline condivise.

## Prove locali

- backup pre-Prompt-B: JSON locale non versionato con checksum SHA-256;
- restore: database isolato post-Prompt-A;
- fresh: schema vuoto, 19 migration, seed sintetico, drift nullo;
- upgrade: 18 migration + 79 righe ripristinate, applicazione della sola migration vNext, conteggi foundation preservati, drift nullo.

I target usati sono PostgreSQL loopback porta 51225 e database temporanei con prefisso `qoovex_vnext_*`. Preview e Production non sono state interrogate o modificate.

## Env

IBAN: `QOOVEX_DATA_ENCRYPTION_KEYS` e `QOOVEX_DATA_ENCRYPTION_ACTIVE_KEY_ID`. E2E può usare chiave sintetica e Blob adapter locale soltanto con `QOOVEX_E2E_MODE=1` e attestazioni esistenti. Production continua a usare Blob privato.

## Runner e cleanup

Il workflow schedulato può invocare il runner vNext protetto. Cleanup è limitato a token/grant scaduti, archivi export oltre retention e Blob realmente orfani non soggetti a hold. `ORGANIZATION_DELETE` non è disponibile.

## hard_stop

Nessun `db push`, `migrate resolve`, reset remoto, SQL manuale fuori migration, deploy, push o PR. La migrazione remota richiede un task separato con backup, target identity e autorizzazione esplicita.
