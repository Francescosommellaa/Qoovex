# Quality and release

## Stato attuale verificato

### Gate standard

Il gate repository e `pnpm check`: type-check, test unitari, build, audit dipendenze, verifica Prisma e `git diff --check`. `pnpm check:ci` aggiunge E2E. `pnpm lint` non e un comando root valido.

`verify:prisma` deve bloccare migration mancanti, riordinate, modificate, fallite o pendenti e qualunque schema diff. La CI usa PostgreSQL effimero e le protezioni E2E dedicate. Non indebolire il controllo drift e non usare `.first()` per nascondere collisioni strict-mode Playwright.

## Verifica documentale

Una modifica esclusivamente documentale deve almeno:

- validare ogni JSON modificato;
- distinguere stato attuale, direzione approvata, concetti non implementati e hard stop;
- controllare link, percorsi e riferimenti a file eliminati;
- cercare placeholder presentati come capability e promesse legali;
- verificare l'allowlist dei file modificati;
- eseguire `git diff --check` e `pnpm check:fast`.

Il gate documentale non autorizza query, migration, codegen o operazioni di ambiente. Se vengono modificati codice, schema, manifest o contratti runtime, si applica il gate completo proporzionato e la prova browser per le superfici UI.

## Qualita del motore futuro

Prima della Fase 3 dovranno essere approvati contratti, stati, schema e migration. I test futuri dovranno coprire:

- isolamento tra Aziende, utenti e resource scope;
- deduplica di evento, processo e step;
- retry idempotente e fencing;
- replay senza riscrittura dello storico;
- completamento parziale e riconciliazione;
- affidabilita e impatto senza soglie implicite;
- separazione tra eccezione e notifica;
- minimizzazione di timeline e audit;
- nessuna condivisione, ruolo o eliminazione automatica non autorizzata;
- query count indipendente dalla cardinalita per dashboard e timeline.

Nessun test di processo esiste oggi e questa documentazione non ne simula l'esito.

## Allineamento post-task

Ogni modifica sostanziale aggiorna documentazione canonica, Qoovex-Brain e session log. La Memory Codex si aggiorna soltanto su richiesta esplicita tramite il canale ad hoc autorizzato. Un deploy e verificato solo con smoke check nell'ambiente interessato.
