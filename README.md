# Qoovex

## Stato canonico

- `verified_current_state`: schema, migration, servizi, route e superfici attuale sono presenti nel monorepo; questa presenza non prova un flusso end-to-end funzionante.
- `implemented_but_not_end_to_end_verified`: la prima vertical slice Ã¨ bloccata perchÃ© il creatore viene persistito `PENDING` mentre l'invito richiede un participant `ACTIVE`, e l'accettazione cliente attiva il participant prima della conferma iniziale.
- `approved_product_direction`: lâ€™Azienda documenta il lavoro una volta e usa la stessa storia per cliente, modifiche e richieste di pagamento; il cliente segue i lavori sulle proprie case e conserva quanto condiviso.
- `conceptual_not_implemented`: ruoli cliente ulteriori, pricing/billing, marketplace, pagamenti in-app, IA e cancellazione fisica.
- `hard_stop`: Preview e Production possono essere mutate soltanto da workflow manuali con conferma testuale esatta, target identity e gate ambiente; nessuna cancellazione fisica di cantieri o account.

Qoovex Ã¨ lo spazio condiviso in cui unâ€™impresa gestisce un lavoro edile con il cliente dalla creazione del cantiere alla chiusura. Il prodotto registra timeline append-only, step opzionali, richieste, proposte versionate, deleghe economiche esplicite, pagamenti soltanto documentati, dispute, chiusura reciproca, richieste post-chiusura, riapertura, immobili cliente ed export distinti.

`OrganizationRole` contiene esclusivamente `OWNER` e `COLLABORATOR`. Il cliente usa un account Qoovex e una `JobSiteParticipant` separata dalla membership Azienda. Qoovex non incassa, custodisce, trasferisce o garantisce denaro.

## Applicazioni

- `apps/workspace`: prodotto autenticato con contesti `/org/[organizationId]` e `/client`.
- `apps/web`: sito pubblico orientato alla direzione attuale, senza costituire prova di disponibilitÃ  end-to-end, pricing o promesse legali.
- `apps/sirio`: catalogo della foundation visuale condivisa.
- `packages/db`: Prisma, 6 migration e client generato.
- `packages/types`: contratti platform-neutral; importi serializzati come stringhe minor-unit.
- `packages/ui`: primitive visuali generiche.

## Operazioni

Leggere [HowToUse](docs/HowToUse.md), [OperationalProtocol](docs/OperationalProtocol.md) e i documenti canonici [00â€“08](docs/README.md). La migration attuale Ã¨ la sesta migration pubblicata nel migration ledger: fresh e upgrade 5â†’6 sono verificati localmente. Local Ã¨ alla head attuale; Production Ã¨ stata verificata in sola lettura alla baseline `20260720010000_calendar_events`; la head Preview non Ã¨ verificata. I workflow distruttivi Preview e Production sono esclusivamente manuali e non partono da push o CI.
