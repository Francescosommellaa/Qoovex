# Qoovex — Contratto operativo per agenti

## Protocollo e autorità

Prima di ogni task:

1. usa esclusivamente il server MCP `qoovex_brain` per il vault e chiama `get_task_context` con la task concreta;
2. se la task tocca UI o UX, chiama anche `check_ui_task` prima di modificare file;
3. leggi `docs/HowToUse.md`, `project_brain.json`, `docs/OperationalProtocol.md`, i documenti canonici pertinenti, i README locali, i pattern e il codice reale interessato;
4. ispeziona il diff corrente e preserva il lavoro non pertinente.

L'ordine di autorità è: richiesta corrente; regole business/legal approvate; stato reale del codice; documentazione canonica Qoovex; `project_brain.json`; README e pattern reali; Impeccable come strumento specializzato UI/UX. In caso di conflitto prevale Qoovex.

Al termine, dopo i gate richiesti, appendi tramite MCP un breve riepilogo con data, task completata e file modificati in `00_System/session-log.md`.

## Definition of Done per task

Una task che modifica repository non e conclusa quando il codice "sembra corretto", ma soltanto quando il diff finale e provato contro il suo reale blast radius.

1. ricostruisci la causa o il requisito sul codice reale e identifica prima di modificare quali check locali e remoti possono essere impattati;
2. aggiungi o aggiorna una regressione mirata quando la task corregge un difetto osservabile; la regressione deve fallire per la causa originaria e non limitarsi a fotografare l'output nuovo;
3. esegui prima i test focalizzati, poi tutti i gate richiesti dalla matrice in `docs/07_QUALITY_AND_RELEASE.md` sul diff finale;
4. riesegui un gate se il suo input cambia dopo l'ultima esecuzione: test verdi su un diff precedente non provano la head corrente;
5. ispeziona `git diff --check`, lo stato Git e gli artifact prima della consegna; output ordinari, report, screenshot diagnostici e cartelle temporanee restano fuori dal repository, mentre le baseline visuali canoniche sono fixture versionate e possono cambiare soltanto per una modifica intenzionale verificata;
6. quando la task comprende una PR o un push, verifica i required check sullo stesso SHA finale; un check fallito, pending, non eseguito o relativo a uno SHA precedente non e verde;
7. se un gate pertinente fallisce, correggi causa e regressione nella stessa task. Fermati con `hard_stop` e prova precisa soltanto quando un vincolo esterno o un ambiente non attestabile impedisce realmente la chiusura.

Non disabilitare, indebolire o saltare test per ottenere il verde. Non aggiornare baseline in massa senza ispezionare actual e diff. Non rinviare failure pertinenti come debito per una task successiva.

## Skill Governance System

`config/skills/registry.json` è il contratto machine-readable per disponibilità, ownership, dipendenze, ordine e update policy delle skill governate. Non è una fonte prodotto e non può scavalcare la gerarchia sopra.

Regole:

- una responsabilità primaria ha un solo owner;
- non creare skill concorrenti che possiedono la stessa responsabilità primaria;
- `pnpm skills:doctor` verifica offline registry, skill repository-local, pin e routing contract;
- `pnpm skills:test` verifica routing positivo e negativo; una skill deve essere assente quando non serve;
- `pnpm skills:canary` verifica gli invarianti minimi dell'orchestratore;
- lo stato runtime di governance è locale sotto `.codex-runtime/skill-governance` e non deve contenere contenuti prodotto o segreti;
- le skill Qoovex repository-owned sono canoniche nel repository; copie globali sono installazioni derivate e possono essere sincronizzate solo tramite `pnpm skills:sync -- <destinazione-esplicita>`;
- il catalogo UI Skills resta on-demand: il normale gate non usa rete;
- soltanto `Skill Auto Update` può interrogare upstream, e ogni update usa candidate branch/PR, provenance, test, canary e CI prima del merge;
- candidate incompatibili vengono messe in quarantena; un failure post-merge genera una PR di rollback/quarantena, mai una correzione diretta silenziosa di `master`.

La CI non può osservare magicamente una skill che l'agent runtime non espone come evento. Per questo il sistema distingue contratto/routing verificabile da evidence runtime: non dichiarare “skill eseguita” senza evidence disponibile.

## Mobile and Responsive Experience gate

`config/mobile-experience.json` e il contratto machine-readable delle superfici, delle route, dei viewport canonici e degli scenari adattivi. Ogni modifica UI, route, layout, navigazione, overlay, controllo condiviso o CSS deve mantenere verde `pnpm mobile:doctor`; le modifiche runtime pertinenti devono inoltre eseguire `pnpm mobile:test`. `pnpm mobile:impact` rende esplicito il blast radius, ma fallisce sempre verso copertura piu ampia quando non riconosce un path.

Non sostituire questi gate con resize manuale o user-agent sniffing. Touch e shortcut derivano dalle capability di input; i fixed surface rispettano safe area e viewport dinamica; il minimo touch condiviso e 44 px. La CI indipendente `mobile-responsive` esegue doctor prima di Playwright e non muta database persistenti, auth, Blob o target remoti.

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
