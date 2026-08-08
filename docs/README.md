# Contratto canonico Qoovex

Ordine: `HowToUse.md`, `project_brain.json`, Brain MCP, `OperationalProtocol.md`, quindi `00`â€“`08`.

Tassonomia obbligatoria:

- `verified_current_state`: Qoovex MVP implementato localmente;
- `approved_product_direction`: spazio condiviso Azienda-cliente;
- `conceptual_not_implemented`: esclusioni future dichiarate nei documenti 00â€“08;
- `open_decision` e `hard_stop`: decisioni non autorizzate.

Le prime 5 migration sono il baseline Production immutabile. la sesta migration pubblicata nel migration ledger azzera il baseline e introduce attuale senza compatibilitÃ  precedente. Fresh e upgrade sono verificati localmente; i target remoti restano invariati fino al push e vengono gestiti solo dai workflow guarded.
