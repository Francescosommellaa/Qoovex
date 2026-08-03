# Contratto canonico Qoovex

Ordine: `HowToUse.md`, `project_brain.json`, Brain MCP, `OperationalProtocol.md`, quindi `00`–`08`.

Tassonomia obbligatoria:

- `verified_current_state`: Qoovex vNext MVP implementato localmente;
- `implemented_decision`: D-VNEXT-18–40, 46–48 verificabili nel repository;
- `approved_product_direction`: spazio condiviso Azienda-cliente;
- `conceptual_not_implemented`: esclusioni future dichiarate nei documenti 00–08;
- `open_decision` e `hard_stop`: decisioni non autorizzate.

Le prime 5 migration sono il baseline Production immutabile. `20260803230000_qoovex_vnext_from_zero` azzera il baseline e introduce vNext senza compatibilità legacy. Fresh e upgrade sono verificati localmente; i target remoti restano invariati fino al push e vengono gestiti solo dai workflow guarded.
