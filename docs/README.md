# Contratto canonico Qoovex

Ordine: `HowToUse.md`, `project_brain.json`, Brain MCP, `OperationalProtocol.md`, quindi `00`–`08`.

Tassonomia obbligatoria:

- `verified_current_state`: esistenza provata da codice, schema, migration o runtime verificato;
- `implemented_decision`: scelta realizzata e protetta da contratti verificabili;
- `approved_product_direction`: direzione prodotto approvata;
- `conceptual_not_implemented`: capacità futura non disponibile;
- `open_decision` e `hard_stop`: decisioni mancanti o condizioni che interrompono l'esecuzione.

La history Prisma contiene otto migration canoniche. Le prime cinque sono il baseline storico immutabile; le tre migration forward successive introducono il dominio corrente, `AccountRole`, gli allegati contestuali e il vincolo di una sola membership Azienda attiva. Local, Preview e database Production sono allineati alla head; i rilasci remoti restano manuali, verificabili e separati dalla CI ordinaria.
