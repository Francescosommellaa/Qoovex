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


Il modello mantiene `OWNER`/`COLLABORATOR`, con al massimo una membership Azienda attiva per account. `CLIENT` Ã¨ un participant del singolo JobSite, mai un ruolo Azienda. La history Prisma conserva soltanto prove tecniche immutabili delle superfici rimosse.


## Modifiche tecniche e memoria

Schema, autorizzazioni, storage, API, servizi, UI e operazioni richiedono un task esplicitamente approvato. Aggiornare documenti e Brain quando il contratto cambia. La Qoovex-Memory si aggiorna soltanto su richiesta esplicita, tramite nota ad hoc, senza modificare direttamente la memoria consolidata.

La direzione grafica resta quella canonica: General Sans (font principale) e ARRAY (accent), Tabler, tema light/dark/system e primitive `@qoovex/ui`.

## Chiusura completa di una task

Prima di intervenire, classificare il blast radius del diff e annotare i gate pertinenti usando `07_QUALITY_AND_RELEASE.md`. Una correzione deve includere, quando il difetto e riproducibile, una regressione minima che provi la causa originaria.

La sequenza obbligatoria e:

1. prova focalizzata della modifica;
2. gate completi richiesti dal tipo di superficie sul diff finale;
3. `git diff --check`, stato Git e controllo degli artifact;
4. se esiste una PR o il task richiede push, required check remoti verdi sul medesimo SHA finale.

Qualunque modifica successiva invalida i gate i cui input sono cambiati. Un gate non eseguito, fallito, pending o riferito a uno SHA precedente non puo essere dichiarato verde. Le failure pertinenti si risolvono nella task corrente; se un ambiente o un servizio esterno impedisce la prova, riportare un `hard_stop` con comando, errore e perimetro non verificato.

Non ottenere il verde disabilitando o indebolendo test. Report, screenshot diagnostici e output ordinari sono temporanei e non si versionano; le baseline visuali canoniche sono fixture deliberate e si aggiornano solo dopo aver verificato che il cambiamento visuale sia intenzionale.

## Database operation impact

Per un task esclusivamente documentale dichiarare zero operazioni aggiunte/eliminate e non interrogare database o Blob. Per route, servizi, query, runner, audit, ricerca, export, retention o workflow applicare `OperationalProtocol.md` prima di qualunque modifica.
