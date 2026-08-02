# Qoovex

## `approved_product_direction`

Qoovex vNext e lo spazio condiviso in cui un'impresa gestisce un lavoro edile con il cliente, documentando avanzamento, step, modifiche, prove e pagamenti dalla creazione del cantiere alla chiusura.

Promessa all'Azienda: documenta il lavoro una volta e usa gli stessi aggiornamenti per informare il cliente, gestire le modifiche e presentare le richieste di pagamento.

Promessa al cliente: segui i lavori sulle tue case, controlla ogni modifica e conserva tutto cio che e stato condiviso.

Nei lavori tra piccole imprese e clienti privati, accordi, avanzamento, modifiche, fotografie, prove, scontrini, richieste, pagamenti e conferme restano spesso distribuiti tra messaggi, telefonate, bonifici, email, file e memoria delle persone. La direzione vNext approvata crea un'unica cronologia condivisa, strutturata, versionata e scaricabile del lavoro.

Questa direzione e `conceptual_not_implemented`: non dichiara attivi account cliente per cantiere, immobili, timeline condivisa, step vNext, negoziazioni, pagamenti documentati, chiusura reciproca o nuove route.

Il contratto tecnico di Fase A D-VNEXT-18-45 e approvato: definisce contesti account, partecipazione, membership multiple, privacy, lifecycle, deleghe economiche, timeline/disclosure, proposte, pagamenti, export, data-control, compatibilita legacy e rollout. Anche questo contratto resta `conceptual_not_implemented` e non autorizza schema o runtime.

## `verified_current_state`

Il Workspace autenticato implementa oggi Aziende, `OWNER` e `COLLABORATOR`, Worker, cantieri, documenti e versioni private, requisiti, scadenze, calendario, checklist, prove, richieste, messaggi interni, timeline contestuale, pacchetti, condivisioni, processi, decisioni, eccezioni, audit, export e data-control.

- `OrganizationRole` contiene soltanto `OWNER` e `COLLABORATOR`; `CLIENT` non e un ruolo Azienda.
- `User`, `Worker`, `OrganizationMembership` e assegnazioni sono distinti. Lo schema corrente consente a un User zero o una sola membership tramite `OrganizationMembership.userId @unique`.
- `JobSite` contiene ancora `clientName` testuale, `JobSiteOperationalPhase` e nessuna partecipazione cliente account.
- `ContextMessage.visibility` e soltanto `INTERNAL`; la timeline contestuale corrente e aziendale, non la timeline Azienda-cliente vNext.
- Il motore persistente usa `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1`, `CONTINUOUS_CONTROL@1` e `DOCUMENT_PACKAGE_SHARING@1`.
- Prisma conserva dati e metadati; Vercel Blob privato conserva i binari.
- Il repository contiene 17 migration canoniche, applicate da zero e verificate senza drift soltanto sul database locale guardato. Nessun ambiente remoto e attestato.

## Modello commerciale approvato

- Azienda: paga Qoovex.
- Collaborator: accesso incluso nell'Azienda.
- Cliente: accesso gratuito ai cantieri in cui e invitato.

Prezzi, piani, limiti, commissioni, trial, entitlement, spazio disponibile e costi per cliente o cantiere restano da definire. Il marketplace e fuori dal nuovo MVP.

## Confini

La direzione vNext non autorizza schema, migration, API, servizi, route, permessi, UI, retention, provider, deploy o operazioni database/Blob. Qoovex documentera il processo di pagamento ma non incassera, custodira, trasferira, tratterra, rimborsera, arbitrera o garantira pagamenti. Non garantisce conformita, non certifica e non sostituisce valutazioni professionali, tecniche o legali.

La documentazione canonica e `docs/00_PRODUCT_AND_SCOPE.md`-`docs/08_SUPPORT_AND_DATA_CONTROL.md`. Il codice, `packages/db/prisma/schema.prisma`, le migration e i manifest restano la fonte dello stato implementato.

Tre hard stop decisionali restano aperti: retention canonica definitiva, protezione IBAN/key management e modello commerciale definitivo. Stato/autorizzazione del database remoto e sicurezza di una sola migration sono gate operativi. L'eventuale implementazione vNext dovra avvenire in un prompt, una branch/PR e una sola migration additiva; non e iniziata in questo repository.

```bash
pnpm install
pnpm dev
pnpm check:fast
pnpm check
```
