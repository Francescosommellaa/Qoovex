# Quality and release

## Gate standard

`pnpm check` esegue type-check, test unitari, build, audit dipendenze, verifica Prisma e `git diff --check`; `pnpm check:ci` aggiunge E2E. `verify:prisma` resta bloccante su migration, checksum e drift.

## Copertura Fase 3 implementata

- quattro definizioni registry e transizioni invalide;
- matrice affidabilita × impatto;
- payload minimizzati, artifact tenant-scoped e idempotency key;
- claim concorrente, lease di cinque minuti, fencing e backoff;
- enqueue nella transazione di documento/versione/lavoratore/cantiere;
- contratti API discriminati, route protette e permission mapping;
- shell primaria ridotta e assenza di Preferiti/Azioni rapide/Ricerca/Analisi;
- workflow scheduled con controllo JSON/logical failure;
- E2E: documento incompleto → decisione → ripresa; lavoratore → requisito mancante → documento → eccezione risolta.

La suite Workspace verificata dopo l'implementazione conta 59 file passati, 2 skipped; 311 test passati, 3 skipped. Questo dato e locale e deve essere aggiornato se i test cambiano.

## Gate prima di release

Eseguire Prisma validate/generate, migration status/diff sul target autorizzato, test mirati, `pnpm check:fast`, `pnpm check`, E2E e `git diff --check`. Per la UI verificare desktop/mobile, loading/empty/error, tastiera, touch, zoom 200%, temi, reduced motion, forced colors, overflow e console.

## Specifiche non implementate

Nessun deploy Preview/Production, commit, branch, push o PR fa parte della Fase 3 locale. Un workflow nel repository non prova esecuzione remota.

## Decisioni aperte e hard stop

Non dichiarare un ambiente allineato senza verifica specifica. OCR/AI, retention, ricerca, nuovi canali, SLA e limiti commerciali richiederanno test e gate propri.
