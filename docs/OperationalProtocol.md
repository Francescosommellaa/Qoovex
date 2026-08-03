# Operational protocol

Questo indice rimanda alle fonti canoniche `06_OPERATIONS_AND_ENVIRONMENT.md`, `07_QUALITY_AND_RELEASE.md` e `08_SUPPORT_AND_DATA_CONTROL.md`.

Codice, schema, migration e manifest sono la fonte di `verified_current_state`. Una `approved_product_direction` e una specifica `conceptual_not_implemented` non autorizzano operazioni runtime, schema, provider, retention, frequenze, permessi, route o UI.

## Task documentale canonico

Un task esclusivamente documentale:

1. valida JSON, riferimenti, link, terminologia e classificazioni;
2. aggiorna i documenti canonici e il Qoovex-Brain tramite MCP;
3. aggiorna la Memory solo se richiesto esplicitamente, tramite nota ad hoc;
4. esegue `pnpm check:fast` e `git diff --check`;
5. appende il session log soltanto dopo i gate.

Non interrogare database o Blob per provare una specifica concettuale. Non eseguire reset, seed, `db push`, migration, deploy, cancellazioni Azienda o cleanup Blob.

Un contratto tecnico documentale non autorizza implementazione. D-VNEXT-46 ha autorizzato la rimozione legacy e D-VNEXT-48 il runtime vNext. Il task vNext-from-zero del 2026-08-03 autorizza il reset di database e Blob privi di dati reali; Preview e Production possono essere mutate soltanto dai workflow con target identity, isolamento e head esatto.

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

Ogni task database-sensitive deve invece ricostruire e misurare il flusso reale, preservando autorizzazione e `organizationId` server-derived. Per vNext sono obbligatori fresh, upgrade dal baseline a 5 migration, drift, presenza delle tabelle vNext, assenza delle tabelle legacy, FK/unique/enum/orfani e prova dell'head. Non inserire query, token, hash, Blob key, URL firmati, IBAN, IP o user-agent in payload, audit o log.
