# Qoovex — Contratto operativo per agenti

## Protocollo e autorità

Prima di ogni task:

1. usa esclusivamente il server MCP `qoovex_brain` per il vault e chiama `get_task_context` con la task concreta;
2. se la task tocca UI o UX, chiama anche `check_ui_task` prima di modificare file;
3. leggi `docs/HowToUse.md`, `project_brain.json`, `docs/OperationalProtocol.md`, i documenti canonici pertinenti, i README locali, i pattern e il codice reale interessato;
4. ispeziona il diff corrente e preserva il lavoro non pertinente.

L'ordine di autorità è: richiesta corrente; regole business/legal approvate; stato reale del codice; documentazione canonica Qoovex; `project_brain.json`; README e pattern reali; Impeccable come strumento specializzato UI/UX. In caso di conflitto prevale Qoovex.

Al termine, dopo i gate richiesti, appendi tramite MCP un breve riepilogo con data, task completata e file modificati in `00_System/session-log.md`.

## Impeccable obbligatorio per UI/UX

Impeccable è parte obbligatoria del workflow quando una task crea, modifica, corregge, revisiona o rifattorizza:

- componenti UI, pagine o layout;
- styling, Tailwind o CSS;
- responsive behavior o accessibilità;
- stati interattivi, animazioni o microinterazioni;
- navigazione, UX flow o copy strettamente legata all'interazione;
- `packages/ui`, `apps/sirio` o le superfici UI di `apps/workspace` e `apps/web`.

### Routing interaction e motion

Impeccable resta la disciplina generale per audit e critique UI, qualità visuale, finding di accessibilità, interaction smell, inconsistenze, anti-pattern e polish. Prima di implementare o modificare comportamento UI/interattivo, leggi integralmente e applica anche `.agents/skills/qoovex-ux-motion/SKILL.md`: le due skill sono complementari, non alternative.

Il routing specialistico si attiva per task che toccano componenti o layout UI, UX, responsive, accessibilità, navigazione, feedback o stati visuali e asincroni (`loading`, empty, error), form control e stati interattivi (hover, press/tap, focus), dialog, drawer, popover, tooltip, menu, transizioni di stato o layout, gesture, motion, animazioni e microinterazioni. Non è richiesto per task esclusivamente database, Prisma, migration, backend, CI/deploy, auth server-side, storage o documentazione non UI, salvo che modifichino anche una superficie o interazione UI.

`qoovex-ux-motion` decide se non animare, usare CSS/Tailwind, affidarsi agli stati e al comportamento Base UI oppure valutare Motion soltanto quando realmente giustificato. Base UI resta la behavioral foundation. La skill è subordinata alla richiesta corrente, alle regole business/legal, allo stato runtime verificato, alle fonti canoniche e all'`OperationalProtocol`, ai confini architetturali/package e al design system reale; non autorizza redesign, dipendenze, provider, cambi architetturali, nuove primitive o token, né modifiche a database, auth, permessi, privacy o capability non implementate. Se necessari, questi cambiamenti devono essere segnalati separatamente.

Se l'hook automatico non è disponibile o non risolve la superficie corretta, una task UI non può essere dichiarata completata senza eseguire nel context corretto il detector/review Impeccable manuale appropriato. Se anche la skill, il context o il workflow manuale richiesti non sono disponibili, dichiaralo come `hard_stop`: non sostituirli silenziosamente e non dichiarare conclusa la review.

## UI Skills specialist routing

UI Skills è un catalogo esterno di competenze specialistiche on-demand. Non sostituisce Qoovex, Impeccable, Base UI, `qoovex-ux-motion`, Sirio o i gate repository-local. La root skill versionata è `.agents/skills/ui-skills-root/SKILL.md`.

Per ogni task UI/UX:

1. completa prima il protocollo Qoovex obbligatorio e individua superficie, consumer e confini reali;
2. usa Impeccable come detector/critique generale e `qoovex-ux-motion` quando il task riguarda interaction o motion;
3. se resta un problema specialistico che beneficerebbe di guida esterna, usa `ui-skills-root` per scegliere la categoria più stretta;
4. interroga il catalogo soltanto tramite i comandi repository-local pin-nati: `pnpm ui-skills:start`, `pnpm ui-skills:categories`, `pnpm ui-skills:list -- --category <category>`, `pnpm ui-skills:get -- <skill>`;
5. preferisci una sola skill esterna; usane due soltanto per due angoli distinti e tre soltanto per review/redesign ampi; mai più di tre;
6. non installare o caricare la copia UI Skills di `impeccable`: Qoovex possiede una distribuzione Impeccable pin-nata, verificata e integrata con hook monorepo;
7. non usare UI Skills per introdurre autonomamente design system, font, icone, token, dipendenze, provider, primitive, package boundary, architettura, capability prodotto, permessi o affermazioni legali;
8. dopo l'implementazione esegui comunque la review Impeccable e i gate Qoovex richiesti.

Per motion e microinterazioni l'ordine è vincolante:

```text
Qoovex protocol
-> Impeccable context/detector
-> qoovex-ux-motion decision
-> optional narrow UI Skills specialist
-> minimum sufficient implementation technology
-> Impeccable review
-> Qoovex gates
```

Una skill esterna Motion può approfondire una domanda circoscritta, per esempio performance, accessibility, presence, spring o animation review, ma non può rendere Motion runtime obbligatorio. CSS/Tailwind, Base UI, API native del browser o nessuna animazione restano esiti validi quando sono il livello minimo sufficiente.

### Before implementation

1. completa il protocollo Qoovex obbligatorio;
2. identifica la superficie e i consumer interessati;
3. leggi il `PRODUCT.md` e il `DESIGN.md` Impeccable pertinenti alla superficie, usando un target concreto nel monorepo;
4. ispeziona codice, token, componenti, pattern e confini reali;
5. usa la skill e il workflow Impeccable appropriati alla task;
6. carica un eventuale specialista UI Skills soltanto dopo aver definito il problema specifico che deve risolvere.

### During implementation

- considera e tratta i finding dell'hook;
- usa pattern, token e componenti reali, preservando il design system Qoovex;
- cura tutti gli stati UX pertinenti;
- cura responsive behavior e accessibilità;
- cura feedback, focus, tastiera e motion quando pertinenti;
- considera la guida UI Skills selezionata come advisory e limitata al problema per cui è stata caricata.

Impeccable non è una fonte di verità autonoma e non autorizza redesign, cambi di branding, font, iconografia o token semantici; nuove dipendenze; spostamenti tra package e app; cambi architetturali; modifiche a business logic, auth, permessi, schema/database, privacy o security; nuove feature; oppure la presentazione di feature concettuali come capability implementate. Qualunque azione di questo tipo richiede autorizzazione esplicita e verifica nelle fonti Qoovex.

### Before completion

Per una task UI/UX significativa:

1. esegui una review Impeccable appropriata;
2. verifica, quando pertinenti: default, hover, active/pressed, focus-visible, disabled, loading, empty, error e pending;
3. verifica tastiera e accessibilità;
4. verifica responsive behavior;
5. verifica feedback delle interazioni;
6. verifica motion e reduced-motion quando pertinenti;
7. risolvi i finding rilevanti o motiva le eccezioni con evidenza;
8. esegui i gate Qoovex richiesti.

La profondità è proporzionale alla modifica: una correzione minima di copy richiede controlli mirati; un nuovo componente, una schermata o un flusso complesso richiedono una review approfondita. Non estendere il perimetro senza necessità o autorizzazione.
