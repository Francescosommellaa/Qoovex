# Qoovex vNext

## Stato canonico

- `verified_current_state`: il monorepo implementa Qoovex vNext come prodotto autenticato Azienda-cliente.
- `implemented_decision`: D-VNEXT-18–40, D-VNEXT-46, D-VNEXT-47 e D-VNEXT-48 sono verificabili in schema, migration, servizi, route, manifest e superfici.
- `approved_product_direction`: l’Azienda documenta il lavoro una volta e usa la stessa storia per cliente, modifiche e richieste di pagamento; il cliente segue i lavori sulle proprie case e conserva quanto condiviso.
- `conceptual_not_implemented`: ruoli cliente ulteriori, pricing/billing, marketplace, pagamenti in-app, IA e cancellazione fisica.
- `hard_stop`: nessuna migration o operazione Blob remota; nessuna cancellazione fisica di cantieri o account.

Qoovex è lo spazio condiviso in cui un’impresa gestisce un lavoro edile con il cliente dalla creazione del cantiere alla chiusura. Il prodotto registra timeline append-only, step opzionali, richieste, proposte versionate, deleghe economiche esplicite, pagamenti soltanto documentati, dispute, chiusura reciproca, richieste post-chiusura, riapertura, immobili cliente ed export distinti.

`OrganizationRole` contiene esclusivamente `OWNER` e `COLLABORATOR`. Il cliente usa un account Qoovex e una `JobSiteParticipant` separata dalla membership Azienda. Qoovex non incassa, custodisce, trasferisce o garantisce denaro.

## Applicazioni

- `apps/workspace`: prodotto autenticato con contesti `/org/[organizationId]` e `/client`.
- `apps/web`: sito pubblico allineato al prodotto disponibile, senza pricing o promesse legali.
- `apps/sirio`: catalogo della foundation visuale condivisa.
- `packages/db`: Prisma, 19 migration e client generato.
- `packages/types`: contratti platform-neutral; importi serializzati come stringhe minor-unit.
- `packages/ui`: primitive visuali generiche.

## Operazioni

Leggere [HowToUse](docs/HowToUse.md), [OperationalProtocol](docs/OperationalProtocol.md) e i documenti canonici [00–08](docs/README.md). La migration vNext è `20260803010000_implement_qoovex_vnext`: è stata provata soltanto su database locali isolati fresh e upgrade. Preview e Production non sono state toccate.
