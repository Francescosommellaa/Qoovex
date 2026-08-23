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

## Context Continuity Rule

Un `work block` e una sequenza di task consecutivi nella stessa sessione persistente, sullo stesso dominio o responsabilita, con fonti canoniche e decisioni rilevanti rimaste invariate. Un `micro-task` e un task successivo che resta interamente in questo perimetro; non riduce gli obblighi di ispezione del codice corrente.

All'inizio di ogni `work block` e obbligatorio il preflight canonico completo Qoovex. Nei micro-task successivi dello stesso blocco riusare il contesto gia verificato: non rileggere per rituale `HowToUse`, la sequenza `00`-`08`, `OperationalProtocol`, Brain, README, skill docs o altre fonti rimaste invariate. Leggere invece soltanto i file realmente coinvolti, i consumer impattati, i test pertinenti e il diff/stato corrente prodotto dai task precedenti. Prima di modificare un file gia toccato nel blocco, rileggerne sempre la versione corrente: non lavorare mai su una snapshot mentale precedente.

Ripetere il preflight canonico completo quando inizia un nuovo `work block`, cambia una fonte canonica rilevante o una regola business/legal, emerge un conflitto tra fonti, un `hard_stop` o una `open_decision`, il task entra in un nuovo confine sensibile (schema/migration, auth, permission, privacy, audit, retention, billing, provider, external sharing, deploy o equivalente), oppure il contesto precedente non e piu affidabile o disponibile.

La rilettura deve aumentare la certezza, non consumare token senza aggiungere informazione. La persistenza del contesto non autorizza a saltare l'ispezione dei file reali coinvolti o a inventare lo stato del repository.

Nel medesimo `work block`, gli agenti non ripetono analisi o discovery gia concluse se le premesse non sono cambiate; non creano nuove abstraction, helper, token o file se una soluzione introdotta nel blocco copre gia la responsabilita; applicano i contratti foundation approvati senza ridiscuterli in ogni componente. Se un contratto foundation non funziona, lo correggono alla fonte o segnalano il conflitto: non introducono workaround locali.

### Gate specialistici applicability-aware e Blast-Radius Verification Rule

Prima di eseguire un gate specialistico, determinare dal blast radius se sia applicabile. UI/UX/Impeccable/Motion valgono soltanto per impatto UI, interaction o design-system; mobile per impatto mobile/responsive; database/schema e auth/permission soltanto per i rispettivi confini; un task documentale esegue i soli gate documentali pertinenti. Un gate non applicabile si registra, se uno schema tecnico lo richiede, come `not_applicable` con una ragione breve e deterministica, per esempio `ui_review: not_applicable — documentation-only task`.

`not_applicable` e una classificazione di applicability, non una review specialistica eseguita: non avvia skill o review UI, non produce report specialistici e non indebolisce un controllo richiesto dal blast radius. Non generare session log verbosi per gate non applicabili; se una traccia e richiesta, usare una sola entry strutturata minimale. Se uno schema MCP o una configurazione repository-owned impone un gate senza supportare `not_applicable`, correggere la fonte reale; non fingere una valutazione per soddisfare la checklist.

Per ogni diff, prima dei gate: identificare esattamente i file modificati, determinarne responsabilita e consumer realmente raggiungibili, classificare i gate applicabili ed eseguire soltanto quelli capaci di rilevare una regressione causata dalla modifica corrente. `applicability check != gate execution`: un gate non si esegue per la sola presenza in una checklist, ma quando il diff puo realisticamente invalidarne il contratto. La sequenza e `diff -> blast radius -> applicable gates -> minimum sufficient verification -> reuse previous green evidence when still valid -> broader block/release gate only quando necessario`.

Nello stesso `work block`, `green evidence + unchanged inputs = reusable evidence`: non rieseguire un gate gia verde se il micro-task non modifica file, dependency transitiva, foundation condivisa o consumer che possano invalidarlo. Rieseguirlo quando cambia uno dei suoi input, cambia una dependency rilevante, cambia una foundation, il diff amplia il blast radius oppure l'evidenza non e piu affidabile. Token globali, `base.css`, theme, API pubbliche o primitive molto usate di `@qoovex/ui`, infrastruttura test/gate e altri contratti shared impongono invece un blast radius determinato dalle dipendenze reali, anche broad.

Nei micro-task preferire il check piu piccolo che prova completamente il diff corrente. `pnpm check` e gli altri check aggregati restano necessari alla chiusura di un work block importante, per blast radius shared/broad, quando richiesti da PR/release o quando non esiste una prova mirata sufficiente; non sostituiscono ne sono sostituiti da una prova mirata quando il blast radius reale richiede copertura piu ampia. Questa regola governa l'esecuzione agentica locale e non modifica required check CI o release. Riportare soltanto `gate -> PASS/FAIL -> motivo di applicabilita` e le failure utili.

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
