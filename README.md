# Qoovex

## Stato canonico

- `verified_current_state`: lo schema, le route e i servizi correnti implementano il workspace condiviso Azienda-cliente basato sul cantiere.
- `implemented_but_not_end_to_end_verified`: una capability resta tale finché non dispone della relativa prova comportamentale completa.
- `approved_product_direction`: l'Azienda documenta il lavoro una volta e condivide con il cliente aggiornamenti, richieste, decisioni e allegati contestuali.
- `conceptual_not_implemented`: ruoli cliente ulteriori, pricing/billing, marketplace, pagamenti in-app, automazioni intelligenti e cancellazione fisica.
- `hard_stop`: Preview e Production possono essere rilasciate soltanto dai workflow manuali con SHA e conferma esatti.

Qoovex è lo spazio condiviso in cui un'impresa gestisce un lavoro edile con il cliente dalla creazione del cantiere alla chiusura. Il prodotto registra timeline append-only, step opzionali, richieste, proposte versionate, deleghe economiche esplicite, pagamenti soltanto documentati, dispute, chiusura reciproca, richieste post-chiusura, riapertura, immobili cliente ed export distinti.

`OrganizationRole` contiene esclusivamente `OWNER` e `COLLABORATOR`. Ogni account può avere al massimo una membership Azienda attiva. Il cliente usa un account Qoovex e una `JobSiteParticipant` separata dalla membership Azienda. Qoovex non incassa, custodisce, trasferisce o garantisce denaro.

## Applicazioni

- `apps/workspace`: prodotto autenticato con accesso diretto alla propria Azienda o alla superficie cliente; Support e Platform Admin usano console separate.
- `apps/web`: sito pubblico orientato al prodotto corrente, senza costituire prova di disponibilità end-to-end, pricing o promesse legali.
- `apps/sirio`: catalogo della foundation General Sans + ARRAY e delle primitive condivise.
- `packages/db`: Prisma, nove migration canoniche e client generato.
- `packages/types`: contratti platform-neutral; importi serializzati come stringhe minor-unit.
- `packages/ui`: primitive visuali generiche con icone Tabler.

## Operazioni

Leggere [HowToUse](docs/HowToUse.md), [OperationalProtocol](docs/OperationalProtocol.md) e i documenti canonici [00–08](docs/README.md). La head repository è `20260813010000_direct_workspace_routes`; Preview e Production restano verificate alla precedente `20260809020000_single_active_organization_membership` finché il nuovo rilascio non passa dal workflow manuale guardato dopo CI verde e smoke staged.
