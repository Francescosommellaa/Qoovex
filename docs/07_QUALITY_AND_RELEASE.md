# Quality and release

## Gate standard

`pnpm check` esegue type-check, test unitari, build, audit dipendenze, verifica Prisma e `git diff --check`; `pnpm check:ci` aggiunge E2E. `verify:prisma` resta bloccante su migration, checksum e drift.

## Copertura Fasi 3-4 implementata

- cinque definizioni registry e transizioni invalide;
- matrice affidabilita x impatto;
- payload minimizzati, artifact tenant-scoped e idempotency key;
- claim concorrente, lease di cinque minuti, fencing e backoff;
- enqueue nella transazione di documento/versione/lavoratore/cantiere/pacchetto;
- contratti API discriminati, route protette e permission mapping;
- shell unica adattiva, ricerca consultiva metadata-only in modale separato e card Azioni rapide guidata dai permessi;
- workflow scheduled con controllo JSON/logical failure;
- revisioni immutabili, backfill legacy, review obbligatoria, conferma concorrente, revoca/scadenza idempotente e download opt-in;
- ricerca esatta/prefisso/termine, tenant/resource scope, cursori stabili e indici PostgreSQL;
- timeline tipizzata e aggregata, correzioni append-only, payload minimizzati e audit tecnico separato;
- E2E Fase 3: documento incompleto -> decisione -> ripresa; lavoratore -> requisito mancante -> documento -> eccezione risolta;
- E2E Fase 4: ricerca autorizzata -> artifact -> timeline; preparazione -> review -> link; aggiornamento immutabile; revoca/scadenza; Centro operativo.
- access model: mapping expand/migrate/contract, backfill dry-run/idempotenza, Owner/Collaborator, permessi dipendenti, scope e grant cross-tenant, optimistic concurrency, scadenza/revoca, reinvio/rifiuto invito e separazione Support Agent/Platform Admin;

I conteggi esatti delle suite vengono riportati dal gate finale della sessione; restano prove locali e non attestano Preview o Production.

## Gate prima di release

Eseguire Prisma validate/generate, migration status/diff sul target autorizzato, test mirati, `pnpm check:fast`, `pnpm check`, E2E e `git diff --check`. Per la UI verificare desktop/mobile, loading/empty/error, tastiera, touch, zoom 200%, temi, reduced motion, forced colors, overflow e console.

## Specifiche non implementate

Nessun deploy Preview/Production, commit, branch, push o PR fa parte delle Fasi 3-4 locali. Un workflow nel repository non prova esecuzione remota.

## Decisioni aperte e hard stop

Non dichiarare un ambiente allineato senza verifica specifica. OCR/AI, ricerca nei file o semantica, retention, nuovi canali, SLA e limiti commerciali richiederanno test e gate propri.
