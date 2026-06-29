# Qoovex docs

Questa cartella contiene la documentazione di prodotto e lavoro del nuovo Qoovex.

La fonte primaria e il set numerato `00`-`14`. I documenti precedenti non vanno usati come direzione prodotto se contengono riferimenti a chef, cucina, eventi food, menu, allergeni, pre-service o brigata.

## Ordine di lettura

1. `00_PRODUCT_RESET.md`: reset rigido del posizionamento.
2. `01_PRODUCT_BRIEF.md`: definizione del nuovo prodotto.
3. `03_PRODUCT_SCOPE.md`: cosa entra e cosa resta fuori dall'MVP.
4. `04_DOMAIN_GLOSSARY.md`: glossario operativo non legale.
5. `05_RESEARCH_REQUESTS.md`: informazioni da chiedere prima di implementare parti sensibili.
6. `06_CODEX_WORKING_RULES.md`: regole operative per le sessioni future.
7. `07_INITIAL_WORK_PLAN.md`: piano iniziale in blocchi piccoli.
8. `08_REPO_CONTEXT_AUDIT.md`: audit delle tracce legacy nel repository.
9. `09_DOMAIN_NAMING_AND_PERMISSIONS.md`: naming tecnico, ruoli MVP e matrice permessi.
10. `10_LEGACY_REFACTOR_PLAN.md`: ordine controllato di bonifica legacy.
11. `11_STORAGE_AND_DATABASE_DECISIONS.md`: decisioni Prisma e Blob.
12. `12_ORGANIZATION_MIGRATION_PLAN.md`: strategia e stato della migrazione `Structure*` -> `Organization*`.
13. `13_RUNTIME_AUTH_AND_PERMISSIONS.md`: ruoli runtime, permessi e regole default-deny.
14. `14_API_RENAME_REPORT.md`: route legacy, route nuove e compatibilita temporanee.

## Legacy da non usare come fonte prodotto

- `ProductContext.md`: descrive il vecchio Qoovex per strutture eventi e cucina.
- `event-operations.md`: descrive flussi pre-service del vecchio dominio.
- `OperationalProtocol.md`: aggiornato per il nuovo dominio, ma il brain MCP puo ancora restituire note legacy storiche.

Il design system, Sirio, token, font, icone e stile visuale sono stati rimossi dal reset. Nessun documento deve trattarli come vincoli canonici.
