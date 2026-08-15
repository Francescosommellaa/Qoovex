---
name: qoovex-ux-motion
description: Use when planning, implementing, reviewing, or debugging Qoovex interaction behavior, motion, microinteractions, transitions, gestures, async feedback, reduced-motion behavior, or interruption handling across packages/ui, apps/workspace, apps/web, and apps/sirio.
---

# Qoovex UX Motion

Progetta interaction design, motion UX e qualità comportamentale per Qoovex. Questa skill non è una libreria di animazioni e non rende Motion obbligatorio.

## Autorità e ruolo

Prima di agire, applica il protocollo repository-local: Brain MCP, `check_ui_task` per UI/UX, fonti canoniche, `AGENTS.md`, README della superficie, codice e diff reali. Classifica lo stato senza trasformare proposte o capability concettuali in implementazione.

Usa questa gerarchia:

1. richiesta corrente e regole business/legal approvate;
2. stato reale del codice e confini architetturali;
3. documentazione canonica, Brain, `project_brain.json` e README;
4. Impeccable come detector, critique e disciplina generale di qualità UI;
5. questa skill come guida specialistica per interaction e motion Qoovex;
6. eventuale UI Skills specialist selezionato on-demand per un sotto-problema circoscritto.

In caso di conflitto, questa skill è subordinata alle fonti superiori. Impeccable e `qoovex-ux-motion` sono complementari: Impeccable rileva problemi e valuta la qualità generale; questa skill decide se, perché e come un comportamento animato è appropriato per Qoovex. UI Skills non sostituisce nessuno dei due: può soltanto approfondire un problema specialistico già identificato.

## UI Skills specialist escalation

Usa `.agents/skills/ui-skills-root/SKILL.md` soltanto quando, dopo aver applicato il contratto Qoovex, resta una domanda specialistica che può migliorare concretamente la soluzione. Esempi appropriati includono performance di animazioni, accessibilità motion-specifica, presence/exit complessi, scelta tra spring ed easing o review mirata di una sequenza.

Regole:

- usa esclusivamente i comandi `pnpm ui-skills:*` definiti dal repository;
- preferisci uno specialista esterno e mantieni il suo scope stretto;
- non caricare la copia UI Skills di Impeccable;
- non lasciare che una skill esterna introduca token, timing, spring, dependency, provider o primitive non autorizzati;
- non usare una skill esterna come giustificazione sufficiente per adottare Motion runtime;
- dopo l'implementazione resta obbligatoria la review Impeccable appropriata.

Ordine operativo:

```text
Qoovex protocol
-> Impeccable context/detector
-> qoovex-ux-motion decision
-> optional UI Skills specialist
-> minimum sufficient implementation technology
-> Impeccable review
-> Qoovex gates
```

## Baseline da verificare

Il repository usa Base UI come behavioral foundation condivisa. `@qoovex/ui` dichiara il package moderno `motion`, ma la sua sola presenza non giustifica un import runtime. Non introdurre `framer-motion` come nuova dipendenza diretta. Prima di affidarti alla baseline, verifica manifest, import, primitive, CSS, token e consumer correnti.

## Regola fondamentale

Ammetti motion soltanto quando migliora concretamente almeno uno di questi aspetti:

- feedback;
- causalità;
- continuità;
- orientamento spaziale;
- comprensione del cambio di stato;
- gerarchia;
- percezione della latenza;
- relazione tra trigger e risultato;
- comprensione di entrata o uscita di una superficie;
- mantenimento del contesto durante un cambiamento.

Se non sai indicare il beneficio UX verificabile, non animare. La disponibilità di una libreria non è una motivazione.

## Valutazione prima dell'implementazione

### Intento

- Identifica l'azione primaria e la risposta attesa dall'utente.
- Verifica che il feedback sia comprensibile anche senza motion.
- Formula in una frase quale problema di feedback, causalità, continuità o orientamento risolverebbe il movimento.
- Se il comportamento statico è già chiaro e immediato, preferiscilo.

### Input

Considera solo quando applicabili: mouse, pointer, touch, tastiera, screen reader, coarse pointer e input ripetuto. Non progettare un'interazione essenziale che dipenda soltanto da hover.

### Stati

Inventaria soltanto gli stati realmente posseduti dal componente o dal flusso:

- default, hover, focus-visible, pressed e active;
- selected, checked, expanded, collapsed, open e closed;
- loading, pending, optimistic, success, error e warning;
- disabled, read-only, empty e destructive confirmation.

Non inventare stati, optimistic update o capability che il flusso non supporta.

### Transizioni

Verifica quando pertinenti: enter, exit, cambio di stato, cambio di layout, interruzione, input rapido ripetuto, inversione, unmount, navigazione e trasferimento del focus.

## Scelta della tecnologia

Scegli il livello minimo sufficiente, in questo ordine.

### Nessuna animazione

Usala quando motion non aggiunge comprensione, feedback o continuità. È una scelta progettuale valida.

### CSS, Tailwind o primitive esistenti

Preferiscili per transizioni semplici, locali, state-driven e facilmente interrompibili. Riusa ciò che il repository possiede già; non creare una seconda foundation.

### Base UI

Usa comportamento e stati esposti dalle primitive Base UI. Non ricostruire manualmente focus management, keyboard navigation, overlay semantics, open/closed behavior, dismissal, ARIA o interaction state quando la primitive li fornisce già. Il movimento deve seguire lo stato reale della primitive, non sostituirlo.

### Motion

Valutalo soltanto quando esiste una necessità reale di gesture, presence, layout animation, shared-layout continuity, spring motivata, sequencing, animazione complessa guidata dallo stato, gesture-linked interaction o orchestrazione interrompibile difficile da esprimere correttamente con CSS.

Un eventuale import futuro deve usare il package moderno `motion` già coerente con il repository, non una nuova dipendenza diretta da `framer-motion`. Questa skill non autorizza automaticamente l'import, un provider o l'adozione di Motion in primitive fondamentali.

## Carattere Qoovex

Le interazioni devono essere professionali, precise, calme, rapide, operative, affidabili, leggibili, controllate e discrete. Devono comunicare causa ed effetto, stato, conferma, continuità e priorità.

Evita senza una ragione UX verificabile:

- bounce, wobble e overshoot vistosi;
- scale eccessive e spring giocose;
- parallax nelle superfici operative;
- glow animati, loop e animazioni decorative continue;
- stagger gratuiti;
- animazioni che ritardano azioni frequenti;
- fade o slide usati come decorazione predefinita.

Workspace non deve sembrare un portfolio, un videogioco o una demo tecnica. Marketing può avere maggiore intensità, ma condivide disciplina, accessibilità e performance.

## Interruzione e input rapido

Tratta rapid interaction come requisito, non come edge case. Per controlli e superfici frequenti verifica:

- cosa accade se l'utente cambia idea durante la transizione;
- doppio input, apertura e chiusura immediate e inversione di direzione;
- assenza di jump quando il comportamento si interrompe o si inverte;
- sincronizzazione tra stato visuale e stato reale;
- correttezza e ripristino del focus;
- disponibilità continua dell'input;
- comportamento durante unmount o navigazione.

Una bella animazione che rompe rapid interaction è un bug UX.

## Feedback asincrono

Quando un'azione è asincrona, distingui se presenti: input ricevuto, richiesta iniziata, pending, stato optimistic, conferma, errore, rollback e retry. Non usare motion per nascondere incertezza o ritardo dello stato reale. Mantieni disponibili semantica, copy e affordance necessari anche senza animazione.

## Reduced motion

Valuta esplicitamente `prefers-reduced-motion` per CSS e JavaScript.

- Non affidare informazioni essenziali soltanto al movimento.
- Preserva feedback e comprensibilità; non assumere che tutto debba sparire.
- Preferisci alternative meno dinamiche quando opportuno.
- Evita scroll-linked motion e parallax non necessari con reduced motion.
- Non assumere che il reset CSS globale corrente copra automaticamente logica JS, View Transitions o librerie runtime.

Questa skill richiede la valutazione ma non introduce una policy o un provider globale.

## Accessibilità, responsive e touch

Motion è subordinato all'accessibilità. Verifica quando pertinenti:

- keyboard navigation, focus-visible, focus order e focus restoration;
- focus trap quando previsto dalla primitive, semantica screen reader e ARIA;
- hit target, touch, contrasto e stati non comunicati solo con colore o movimento;
- viewport ridotti, coarse pointer, assenza di hover, gesture collision, scroll e overflow;
- safe area e superficie mobile quando rilevanti.

## Performance

- Preferisci proprietà efficienti come `transform` e `opacity` quando soddisfano il comportamento.
- Motiva e valuta proprietà differenti invece di applicare una regola assoluta falsa.
- Evita layout thrashing, aggiornamenti JavaScript continui non necessari e motion che blocca input.
- Verifica con particolare attenzione componenti scroll-linked.
- Considera il bundle cost prima di usare Motion in primitive condivise o fondamentali.
- Non ottimizzare prematuramente senza evidenza misurabile.

## Design system e package boundaries

- Usa token semantici esistenti; non hardcodare se il token esiste.
- Non inventare duration, easing, spring config o motion token mancanti.
- Non creare token casuali per un singolo componente o una foundation parallela.
- Mantieni primitive generiche condivise in `packages/ui` e composizioni specifiche nelle rispettive app.
- Non duplicare primitive o behavior Base UI.
- Per una futura modifica shared UI, usa Sirio come proof quando il protocollo Qoovex lo richiede.

L'assenza di un token o di un contratto condiviso non autorizza a inventarlo: segnala separatamente la decisione necessaria.

## Cosa questa skill non autorizza

Non autorizza automaticamente redesign, dipendenze, cambi di package boundary, provider, token, primitive condivise, librerie runtime, sostituzione di Base UI, modifiche a auth, database, permessi, privacy, security, business logic, capability prodotto o superfici vNext non implementate.

Se la soluzione richiede uno di questi cambiamenti, fermala come proposta separata e chiedi autorizzazione nel task appropriato.

## Verifica prima del completamento

Per la superficie realmente modificata:

1. dichiara il beneficio UX che giustifica motion, oppure conferma che non serve;
2. verifica input, stati e transizioni pertinenti senza inventarne;
3. prova interruzione, inversione e input rapido quando rilevanti;
4. verifica feedback asincrono e sincronizzazione con lo stato reale;
5. verifica tastiera, focus, screen reader, reduced motion, touch, responsive e overflow secondo il rischio;
6. valuta performance e bundle cost in proporzione alla soluzione;
7. esegui detector o review Impeccable appropriati e tratta i finding senza duplicarne il ruolo;
8. esegui i gate Qoovex richiesti e riporta limitazioni o eccezioni con evidenza.

Nel report indica sempre: tecnologia scelta, perché è sufficiente, comportamento reduced-motion, gestione dell'interruzione e placement package/app. Non dichiarare verificato ciò che non è stato provato.
