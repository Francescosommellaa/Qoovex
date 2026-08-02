# How to use the repository

La documentazione canonica e la sequenza continua `00_PRODUCT_AND_SCOPE.md`-`08_SUPPORT_AND_DATA_CONTROL.md`. `README.md` e `project_brain.json` sono punti di ingresso; Qoovex-Brain e la memoria operativa indicizzata.

## Gerarchia delle fonti

1. richiesta corrente e regole legal/business approvate;
2. codice, `schema.prisma`, migration e manifest per lo stato implementato;
3. documentazione canonica per contratti e confini;
4. Qoovex-Brain per routing, decisioni e failure mode;
5. materiale storico soltanto per provenienza.

## Classificazione obbligatoria

Ogni affermazione sostanziale deve essere classificabile come:

- `verified_current_state`: esiste nel codice, schema o runtime verificato;
- `implemented_decision`: scelta approvata e realizzata con contratti verificabili;
- `approved_product_direction`: direzione prodotto approvata che non prova una capability;
- `conceptual_not_implemented`: entita, lifecycle, permesso, route o UI futura;
- `open_decision`: richiede una decisione;
- `hard_stop`: blocca schema o implementazione.

Una stessa direzione puo essere approvata e contemporaneamente non implementata. Usare formule esplicite, per esempio: “Nella direzione vNext approvata... Questa capacita non e implementata nello stato corrente.”

## Stato implementato e vNext

Processi persistenti, Panoramica exception-driven, cinque definizioni deterministiche, ricerca consultiva sui metadati aziendali autorizzati, timeline interne e condivisione revisionata sono implementati. La partecipazione cliente account, gli immobili, la timeline condivisa Azienda-cliente, le negoziazioni, i pagamenti documentati e la chiusura reciproca appartengono a vNext e sono `conceptual_not_implemented`.

Il modello corrente mantiene `OWNER`/`COLLABORATOR`, una sola membership per User, `JobSite.clientName`, `JobSiteOperationalPhase` e messaggi `INTERNAL`. Non reinterpretare questi contratti come se il pivot fosse gia distribuito.

D-VNEXT-18-45 rendono decision-complete la Fase A documentale per contesti, partecipanti, authorization, privacy, lifecycle, compatibilita e rollout. Non rendono implementato lo schema target. Il task tecnico successivo deve rispettare D-VNEXT-45: un prompt coordinato, una branch/PR e una sola migration additiva, salvo hard stop tecnico provato.

## Modifiche tecniche e memoria

Schema, autorizzazioni, storage, API, servizi, UI e operazioni richiedono un task esplicitamente approvato. Aggiornare documenti e Brain quando il contratto cambia. La Qoovex-Memory si aggiorna soltanto su richiesta esplicita, tramite nota ad hoc, senza modificare direttamente la memoria consolidata.

La direzione grafica resta quella canonica: Geist/Geist Mono, Tabler, tema light/dark/system e primitive `@qoovex/ui`.

## Database operation impact

Per un task esclusivamente documentale dichiarare zero operazioni aggiunte/eliminate e non interrogare database o Blob. Per route, servizi, query, runner, audit, ricerca, export, retention o workflow applicare `OperationalProtocol.md` prima di qualunque modifica.
