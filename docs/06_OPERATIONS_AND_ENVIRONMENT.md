# 06 — Operazioni e ambiente

## verified_current_state

Branch dedicato: `codex/qoovex-vnext-remove-legacy`. Nessun push o PR. L’unica nuova migration è locale e distruttiva rispetto al dominio rimosso; non modifica la history precedente.

Procedura verificata: guard locale → backup → format/validate/generate → history completa su server locale separato → upgrade del database locale canonico → status/drift/check FK/indici/enum/orfani. Nessuna operazione Preview/Production, deploy o Blob remoto.

## D-VNEXT-48

Il Prompt B introdurrà vNext integralmente in una fase separata. Non esistono modalità parallele, backfill `clientName`, conversioni o compatibility window prodotto.

## Hard stop

Target remoto ambiguo, assenza backup o guardrail falliti bloccano ogni futura migration. Il database locale di test non costituisce evidenza remota.
