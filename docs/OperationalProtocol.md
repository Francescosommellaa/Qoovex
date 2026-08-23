# Operational protocol

Questo indice rimanda alle fonti canoniche `06_OPERATIONS_AND_ENVIRONMENT.md`, `07_QUALITY_AND_RELEASE.md` e `08_SUPPORT_AND_DATA_CONTROL.md`.

Codice, schema, migration e manifest sono la fonte di `verified_current_state`. Una `approved_product_direction` e una specifica `conceptual_not_implemented` non autorizzano operazioni runtime, schema, provider, retention, frequenze, permessi, route o UI.

## Unita di lavoro persistente

Una `task` conserva il proprio requisito, blast radius, regressione e gate. Un `micro-task` e una task consecutiva che resta nello stesso `work block`: il `work block`, la selezione applicability-aware, la Blast-Radius Verification Rule, il riuso dell'evidenza verde e `not_applicable` sono definiti dal contratto canonico in `HowToUse.md`. Il preflight completo e obbligatorio all'avvio del blocco e si ripete soltanto alle condizioni definite in quella fonte; ogni micro-task ispeziona comunque file, consumer, test, diff e stato Git correnti prima di modificare.

## Task documentale canonico

Un task esclusivamente documentale:

1. valida JSON, riferimenti, link, terminologia e classificazioni;
2. aggiorna i documenti canonici e il Qoovex-Brain tramite MCP;
3. aggiorna la Memory solo se richiesto esplicitamente, tramite nota ad hoc;
4. esegue `pnpm check:fast` e `git diff --check`;
5. appende il session log soltanto dopo i gate.

Non interrogare database o Blob per provare una specifica concettuale. Non eseguire reset, seed, `db push`, migration, deploy, cancellazioni Azienda o cleanup Blob.

## Contratto di completamento

Ogni task con modifiche deve chiudere nella stessa iterazione requisito, regressione e gate pertinenti. Prima della modifica si classifica il blast radius; prima della consegna si eseguono i gate sul diff finale secondo `07_QUALITY_AND_RELEASE.md`.

- un bug riproducibile richiede una regressione focalizzata che protegga la causa corretta;
- una modifica dopo un test ne invalida l'evidenza quando cambia uno dei suoi input;
- un check fallito, pending, saltato o eseguito su uno SHA diverso resta non verificato;
- quando PR o push sono nel perimetro, i required check devono risultare verdi sullo SHA finale;
- una failure pertinente non viene trasferita alla task successiva e non viene resa verde indebolendo il gate;
- un impedimento esterno diventa `hard_stop` soltanto dopo i controlli sicuri disponibili, con prova del comando, dell'errore e del perimetro non verificato.

Gli output ordinari dei test sono effimeri. Screenshot, report e cartelle diagnostiche non entrano nel repository; fanno eccezione le baseline visuali canoniche, che sono fixture versionate e richiedono una variazione intenzionale, ispezionata e attestata.


## Database operation impact

Per un task soltanto documentale riportare:

```text
Operazioni aggiunte: 0
Operazioni eliminate: 0
Query per flusso prima: invariato
Query per flusso dopo: invariato
Rischio N+1: invariato
Strategia cache: invariata
Strategia invalidazione: invariata
Impatto tenant isolation: nessuno
Ambienti coinvolti: soli file documentali locali e Brain
Misurazione eseguita: non applicabile; database e Blob non interrogati
```

Ogni task database-sensitive deve invece ricostruire e misurare il flusso reale, preservando autorizzazione e `organizationId` server-derived. Sono obbligatori fresh, upgrade dal baseline storico, drift, presenza delle tabelle correnti, assenza delle tabelle rimosse, FK/unique/enum/orfani e prova dell'head. Non inserire query, token, hash, Blob key, URL firmati, IBAN, IP o user-agent in payload, audit o log.
