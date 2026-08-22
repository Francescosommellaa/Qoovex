# 05 — UI, brand and surfaces

## verified_current_state

La foundation visiva corrente resta invariata: shadcn base-nova, Base UI, Tabler, Tailwind v4, General Sans (principale), ARRAY (accent) e token Qoovex. Le composizioni dominio sono app-local nel Workspace; nessun nuovo design system o brand è stato introdotto.

Impeccable è un layer specializzato obbligatorio di controllo UI/UX, subordinato alle fonti canoniche Qoovex e al codice reale. I context condivisi di Workspace, Web, Sirio e `packages/ui` restano versionati; la distribuzione della skill non è vendorizzata e non costituisce una nuova fonte di verità. Se l'hook automatico non è disponibile, una task UI richiede il detector o la review manuale appropriata prima del completamento.

UI Skills è integrato come registry specialistica on-demand, non come nuova foundation. Il repository versiona soltanto il router `.agents/skills/ui-skills-root`, mentre i comandi `pnpm ui-skills:*` interrogano la CLI pin-nata `ui-skills@0.2.4`. Le skill esterne restano advisory, vengono selezionate nel numero minimo necessario e non possono sostituire le fonti Qoovex, Impeccable o `qoovex-ux-motion`. La copia UI Skills di Impeccable è esplicitamente esclusa per evitare una seconda distribuzione concorrente.

Per interaction e motion il routing resta: protocollo Qoovex -> Impeccable context/detector -> `qoovex-ux-motion` -> eventuale specialista UI Skills circoscritto -> tecnologia minima sufficiente -> review Impeccable -> gate Qoovex. La decisione tecnologica interna separa responsabilita: Base UI possiede comportamento e stato reale, CSS/Tailwind styling statico e transizioni banali, mentre `motion/react` e first-class e preferenziale quando aumenta precisione, continuita, fluidita, interruption handling o controllo del lifecycle. Nessuna animazione e CSS restano esiti validi quando Motion non produce quel beneficio; una skill esterna non rende Motion obbligatorio.

`implemented_decision`. Il contratto motion condiviso usa quattro ruoli semantici in `packages/ui/styles/tokens.css`: `instant` 100 ms, `feedback` 160 ms, `state` 200 ms e `surface` 300 ms, con `ease-standard` ed `ease-emphasized`. `tokens.css` è la sola fonte numerica; `@qoovex/ui/lib/motion` converte i valori CSS computati nel formato richiesto da JavaScript o Motion senza mapping duplicati. Il contratto richiede proprieta esplicite invece di `transition-all`, interruzione e rapid input senza code, stato asincrono visibile, nessun layout shift intenzionale e un percorso reduced-motion che rimuove movimento spaziale non essenziale preservando feedback statici, colore e lifecycle Base UI. Sirio espone la proof canonica in `/foundations/motion` senza un secondo catalogo.

`approved_product_direction`. Per ogni componente interattivo i task dedicati devono valutare esplicitamente elementi candidati a Motion, lifecycle `rest → hover/focus → press → transition → settled`, interruption/reversal, rapid repeated interaction, eventuale layout/shared-element continuity, reduced motion, mouse/touch/keyboard e costo runtime/bundle. Lo `Switch` condiviso e il benchmark qualitativo corrente per integrazione `motion/react` tramite Base UI `render`, variants state-driven, `whileTap` e transizioni feedback/state distinte; e un riferimento di progettazione, non un template da copiare.

`implemented_decision`. Il contratto interaction state condiviso usa selector variant semantiche in `packages/ui/styles/base.css` per mappare stati nativi, ARIA e Base UI senza assegnare loro una presentazione globale. La composizione e `rest → persistent → validation/system → availability`; focus-visible resta additivo, mentre hover e pressed sono feedback transient disponibili soltanto quando stato e input modality lo consentono. Disabled sopprime nuova interazione, readonly conserva focus e selezione nativi, invalid non cancella selected o checked e loading puo proteggere da activation ripetute senza falsificare lo stato sottostante. `data-pressed` non ha un alias globale perche sul Toggle identifica una selezione persistente. Sirio espone combinazioni reali in `/foundations/interaction-states`.

`implemented_decision`. Il focus condiviso segue `unfocused → keyboard focus-visible → interaction → focus transfer → focus restoration`. `packages/ui/styles/tokens.css` definisce outline opaco `2px`, offset `2px` e colore `ring`; `base.css` lo applica immediatamente, neutralizza i soli canali ring Tailwind durante focus-visible e usa `Highlight` in forced colors. Selected, checked, invalid, readonly, destructive e open restano sottostanti e leggibili. I field composite delegano esplicitamente child/owner; Base UI resta responsabile di focus iniziale, trap, Escape e restoration, con `finalFocus` esplicito se il trigger viene rimosso. Scroll padding/margin appartengono allo scrollport e alle sticky/fixed surface reali. Sirio prova il contratto con tastiera DOM reale in `/foundations/focus`.

`implemented_decision`. Il contratto pointer/touch distingue dimensione visuale, hit area interattiva e spacing. `--touch-target-min` resta `44px`: box e field reali crescono per primary coarse/no-hover e per hardware ibrido con un coarse pointer aggiuntivo; i controlli compatti possono usare una hit area centrata solo dentro una cella allocata di pari misura, senza overlap, clipping o cambi di focus geometry. I link inline restano l'eccezione. Hover richiede primary fine + hover; `any-pointer` non sostituisce la modality primaria. Pointer Events possiedono press, release inside, release outside/cancel e settled, mentre Base UI/native mantengono activation, keyboard e ARIA. Motion puo controllare hover/tap/cancel quando migliora interruption, ma non trasforma il box della hit area. Sirio prova il contratto in `/foundations/pointer-touch`.

## Onboarding e destinazione

Dopo autenticazione l'account sceglie una sola volta `BUSINESS`, `PROFESSIONAL` o `CLIENT`. Senza ruolo non può entrare in un contesto tenant o participant. Un account `BUSINESS` crea e usa una sola Azienda attiva; non esiste una vista per scegliere tra più Aziende. `PROFESSIONAL` attende o accetta un invito Collaborator compatibile; `CLIENT` accede soltanto ai cantieri a cui partecipa.

In sviluppo il selettore controllato espone cinque viste: Azienda, Professionista, Cliente, Support Agent e Platform Admin. Il selettore non concede permessi né dati e non è disponibile come escalation nel runtime Production.

## Superficie Azienda

Home, lista cantieri e dettaglio sono presenti e raggiungibili nel routing con Riepilogo, Timeline, Step, Richieste, Modifiche, Pagamenti, Persone, File, Chiusura e Impostazioni. La prima vertical slice lifecycle è verificata: la creazione registra atomicamente il responsabile come participant Azienda `ACTIVE`, consentendo subito le operazioni autorizzate e l'invito del cliente.

## Superficie cliente

Home separata e dettaglio cliente sono presenti. Le query del dettaglio filtrano timeline e allegati condivisi. L'accettazione dell'invito crea il participant cliente `PENDING`; l'attivazione avviene soltanto dopo la conferma del riepilogo iniziale. I test lifecycle dedicati verificano questo passaggio e il relativo isolamento.

## Form e stati

La validazione server-side e diversi stati UI sono presenti. Errori field-level, focus, prevenzione double-submit e completezza degli stati devono continuare a essere provati per la capability interessata: la sola presenza di route, componenti o `testId` nel registry non basta a dichiararla verificata.

## Copy prudente

Il prodotto usa “confermato dalle parti”, “invio dichiarato”, “ricezione confermata dall’Azienda”, “conclusione stimata” e “IBAN indicato dall’Azienda”. Non promette conformità, collaudo, assenza difetti, pagamento garantito o validità legale.

## Marketing (apps/web) — polish microinterazioni

`verified_current_state`. Il sito marketing usa la stessa foundation (token Qoovex, General Sans / ARRAY, Tabler) senza nuovi design system. Le microinterazioni sono sobrie e basate solo su `transform`/`opacity`:

- Scroll reveal (`components/reveal.tsx` + `[data-reveal]` in `globals.css`): entrata unica con `--ease-standard`, stagger via `--reveal-delay`, rete di sicurezza a 700ms, disattivato con `prefers-reduced-motion` e nessun contenuto nascosto senza JavaScript.
- Card di contenuto: lift discreto in hover (`-translate-y-0.5`, ombra e ring del token `foreground`).
- Frecce inline e dei bottoni primari: micro-spostamento in hover tramite `group`/`group-hover/button`.
- FAQ (Base UI Collapsible): trigger con transizione colore e chevron ruotato su `data-panel-open`.

Verifica: `apps/web` compila come 16 route statiche, `verify-foundation` passa, Web Vitals su `/` con CLS 0.0. Nessuna modifica a `packages/ui`, schema, auth o confini app/package. Il perimetro resta la vetrina pubblica: nessuna capability non verificata è presentata come disponibile.
