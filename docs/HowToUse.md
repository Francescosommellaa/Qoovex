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

Una stessa direzione puo essere approvata e contemporaneamente non implementata. Usare formule esplicite, per esempio: â€œNella direzione attuale approvata... Questa capacita non e implementata nello stato corrente.â€

## Stato implementato


Il modello mantiene `OWNER`/`COLLABORATOR` e usa lâ€™unicitÃ  membership `(organizationId,userId)`. `CLIENT` Ã¨ un participant del singolo JobSite, mai un ruolo Azienda. Non sono stati reintrodotti `JobSite.clientName`, `JobSiteOperationalPhase`, deadline, checklist, pacchetti o share link.


## Modifiche tecniche e memoria

Schema, autorizzazioni, storage, API, servizi, UI e operazioni richiedono un task esplicitamente approvato. Aggiornare documenti e Brain quando il contratto cambia. La Qoovex-Memory si aggiorna soltanto su richiesta esplicita, tramite nota ad hoc, senza modificare direttamente la memoria consolidata.

La direzione grafica resta quella canonica: Geist/Geist Mono, Tabler, tema light/dark/system e primitive `@qoovex/ui`.

## Database operation impact

Per un task esclusivamente documentale dichiarare zero operazioni aggiunte/eliminate e non interrogare database o Blob. Per route, servizi, query, runner, audit, ricerca, export, retention o workflow applicare `OperationalProtocol.md` prima di qualunque modifica.
