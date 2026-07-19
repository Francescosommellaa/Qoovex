# UI, brand and surfaces

## Decisione canonica

Qoovex adotta il design system derivato dallo starter pubblico [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter), fissato al commit `0edc5cf631ac7a8280112fd2bcb80312597bafdf`.

La foundation usa shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4 CSS-first, Geist/Geist Mono e il tema Vercel con palette OKLCH light/dark/system. Provenienza e avvisi MIT sono conservati in `packages/ui/THIRD_PARTY_NOTICES.md`.

## Stato promosso

`packages/ui` e l'unica sorgente di verita per token, base CSS, primitive, provider tema, controllo tema, navigazione floating, marchio slottabile, utility e hook condivisi. Sirio, marketing e workspace consumano la stessa implementazione; non esiste una foundation app-local o un layer di compatibilita precedente.

- `apps/sirio`: catalogo e prova integrata su `/`, `/marketing` e `/dashboard`.
- `apps/web`: sito pubblico, cookie banner e pagine legali.
- `apps/workspace`: prodotto, auth, MFA e console, senza modifiche ai contratti funzionali.
- `packages/brand-resources`: esclusivamente SVG proprietari.

Le composizioni di prodotto e la logica di dominio restano nelle app. Componenti, hook e comportamenti realmente condivisi vivono soltanto nel package UI.

## Contratto pubblico

- import espliciti `@qoovex/ui/components/*`, `@qoovex/ui/hooks/*` e `@qoovex/ui/lib/*`;
- nessun barrel root `@qoovex/ui`;
- ogni app importa una sola volta `@qoovex/ui/styles/base.css` e dichiara le proprie sorgenti Tailwind;
- CSS app-local solo per layout e composizioni specifiche;
- `Button` e action-only; la navigazione usa link nativi o Next `Link` con `buttonVariants`;
- package imports interni `#components`, `#hooks` e `#lib` per evitare alias fragili.

## Contratto visivo

- Geist per testo e interfaccia; Geist Mono per dati e riferimenti.
- Token semantici OKLCH per background, superficie, bordo, testo, brand, chart, sidebar e stati `info`, `success`, `warning`, `destructive`.
- Light, dark e system con persistenza, prevenzione del flash e reveal circolare del tema.
- Tabler per le icone funzionali; marchi proprietari da `@qoovex/brand-resources`.
- Focus visibile, tastiera e touch, forced colors, zoom 200% e contenuti lunghi come requisiti di base.
- Copy prudente su stato documentale, elementi presenti, mancanti o da verificare. Nessuna promessa di conformita, certificazione o validita legale.

## Sottolineatura e link

La sottolineatura comunica un collegamento nel contenuto, non un generico stato interattivo. I ruoli condivisi sono dichiarativi e valgono in tutte le app:

- `inline`: link dentro testo, help, alert e contenuti legali; la sottolineatura e sempre visibile;
- `quiet`: link testuali autonomi, azioni secondarie e footer; la sottolineatura compare in hover e focus;
- `plain`: navigazione, tab, breadcrumb, logo, card, badge e link con aspetto CTA; non viene sottolineato.

I button non usano mai la sottolineatura. Colore, spessore e offset provengono dai token condivisi; skip-ink, focus da tastiera e forced colors restano parte del contratto accessibile. I consumer usano `data-link`, mentre `data-link-scope="inline"` copre contenitori di testo controllati come descrizioni, alert e contenuti legali.

## Selezione del contenuto

Titoli, paragrafi e contenuti editoriali restano selezionabili e copiabili con un highlight neutro derivato dai token foreground, al posto del blu nativo del browser. Immagini, marchio e mockup UI dimostrativi non producono evidenziazioni testuali accidentali: le immagini applicano il comportamento condiviso, `BrandMark` e non selezionabile e i preview dichiarano `data-selection="none"`. Forced colors mantiene `Highlight` e `HighlightText` di sistema. La regola non si applica alle dashboard reali, ai dati operativi o ai campi editabili.

## Motion

La motion serve orientamento e feedback: reveal circolare del tema, navbar floating adattiva, transizioni Base UI per menu/select/tooltip/sheet, collasso sidebar, switch, tab, skeleton e spinner. Sulla home, uno scroll verso il basso oltre l'isteresi di 10 px compatta la navbar e sostituisce le destinazioni marketing con le sezioni della pagina; uno scroll verso l'alto ripristina dimensione e navigazione marketing. La navigazione tra sezioni usa una transizione deterministica di 460 ms e termina sulla linea di lettura calcolata dallo `scroll-padding-top`, senza sommare un secondo offset sul target. Nella navbar mobile la sezione corrente resta sempre visibile; precedente e successiva compaiono insieme soltanto quando lo spazio effettivo del contenitore centrale raggiunge 15 rem, senza dipendere dalla sola larghezza del viewport. `prefers-reduced-motion` disabilita le transizioni non essenziali e il cambio tema ha un fallback senza View Transition API.

La navbar marketing estesa espone `Prodotto`, `Pricing`, `Contattaci` e il menu `Risorse`. Il menu Base UI si apre con hover, click o tastiera e include Manuale utente, Community, Storie operative e Novita; lo stato mobile conserva le stesse destinazioni nello Sheet. Un indicatore condiviso si sposta tra link e voci del dropdown con easing elastico `cubic-bezier(0.16, 1, 0.3, 1)`, ispirato alla continuita del cursore ma senza inseguire il puntatore. Il focus semantico resta nativo e visibile; reduced motion e forced colors mantengono fallback accessibili.

Le superfici marketing possono attivare il `MarketingCursor` condiviso: punto di precisione immediato, alone con inseguimento elastico e deformazione proporzionale alla velocita, stato interattivo, pressione e micro-label opt-in tramite `data-cursor-label`. Quando il puntatore entra nella soglia netta di 16 px attorno a una CTA primaria, il solo cursore visivo scatta nel punto di attivazione stabile dell'azione, cioe il centro del pulsante; non viene applicata alcuna attrazione progressiva alla traiettoria. Lo snap richiede che la CTA sia realmente esposta: header, menu, dialog, sheet, popover, altre azioni o superfici sovrapposte impediscono l'attivazione. Nello stesso frame il cursore eredita anche lo stato `action` o la micro-label della CTA magnetica, senza attendere un ulteriore movimento fisico del puntatore. Pulsante, area cliccabile e hit testing restano immobili. I target espliciti usano `data-cursor-magnetic="true"` e un'azione puo disattivare il comportamento con `data-cursor-magnetic="false"`. Il comportamento non sostituisce focus o semantica e viene disattivato integralmente su touch, penna, `prefers-reduced-motion`, forced colors e dispositivi senza puntatore fine; input, select, textarea e contenuti editabili mantengono il cursore nativo. In Web e attivo su home, Pricing, Contattaci, Community, Manuale operativo, Storie operative e Novita; in Sirio resta attivo soltanto su `/marketing`. Pagine legali, catalogo Sirio, workspace e dashboard restano esclusi.

Non viene introdotta una libreria di animazione separata. Animazioni legate a feature escluse dello starter non fanno parte della foundation.

## Scrollbar

Web, Sirio e workspace montano lo stesso `ScrollbarController` e usano esclusivamente la scrollbar nativa ridisegnata dalla foundation. Su mouse e puntatori fini il canale resta trasparente, lo spessore occupato e 8 px e il thumb visivo e circa 4 px; colore e intensita derivano dai token foreground per light e dark.

La scrollbar principale appare durante lo scroll o quando il puntatore raggiunge gli ultimi 20 px del bordo destro o inferiore. Le scrollbar annidate appaiono durante scroll, hover o focus del relativo contenitore e tornano trasparenti dopo 900 ms di inattivita. Hover e trascinamento aumentano progressivamente il contrasto. Su touch, pointer coarse e forced colors resta il comportamento nativo del sistema. Sidebar, tabelle, menu, select e ogni nuovo contenitore overflow ereditano automaticamente il contratto.

## Adozione esterna

Codice pubblico esterno puo essere adottato soltanto con licenza compatibile, provenienza, versione o commit fissato e mantenimento degli avvisi. La CLI shadcn e ammessa per componenti approvati dopo `info`, `docs`, `view`, `--dry-run` e `--diff`; non si usa `--overwrite` sulle varianti Qoovex approvate.

Per il dropdown Risorse e stato usato come riferimento visivo [Navbar Menu su 21st.dev](https://21st.dev/@manuarora700/components/navbar-menu), pubblicato il 3 dicembre 2024 e attribuito ad [Aceternity UI](https://ui.aceternity.com/components/navbar-menu). L'implementazione Qoovex e una trasformazione di principio: il sorgente 21st e bloccato e la fonte originale dichiara All Rights Reserved, quindi non e stato copiato codice, non e stata installata la relativa registry entry e non e stata aggiunta Framer Motion. Sono stati riusati esclusivamente Base UI, Tabler e CSS gia approvati nel repository.

La pagina Web `/storie` usa [Vercel Customers](https://vercel.com/customers), ispezionata il 18 luglio 2026, soltanto come riferimento di gerarchia editoriale: apertura, storia in evidenza e griglia di approfondimenti. Non copia codice, asset, marchi, testimonianze o metriche. Finche non esistono casi cliente validati, Qoovex pubblica esclusivamente scenari operativi dichiarati come illustrativi.

La pagina Web `/novita` usa [Vercel Changelog](https://vercel.com/changelog), ispezionata il 18 luglio 2026, soltanto come riferimento di architettura informativa: intestazione essenziale, aggiornamento in evidenza e archivio cronologico per categoria. Non copia codice, asset o contenuti; pubblica soltanto modifiche Qoovex riscontrabili nel repository e nel Brain operativo.

## Verifica

Il gate statico impedisce primitive duplicate, import root, token o classi visuali precedenti, provider tipografici rimossi e dipendenze icona non canoniche. Le superfici vanno verificate a 320, 390, 768, 1024 e 1440 px, light/dark/system, zoom 200%, tastiera, touch, focus, contrasto, reduced motion, hydration, console e overflow.

## Auth e identita

Le superfici `/sign-in`, `/sign-up`, `/reset-password` e `/invite` usano una composizione auth unica app-local nel workspace, costruita esclusivamente con primitive `@qoovex/ui`. La stessa gerarchia copre invito non disponibile, accesso richiesto, accettazione, successo, configurazione Azienda e configurazione dati non pronta. Route, callback, nomi campo, payload, Auth.js, MFA, inviti, permessi e Prisma restano invariati.

`packages/ui` espone due controlli presentazionali condivisi:

- `PasswordInput`, che compone `Input` e `Button` con reveal accessibile e stato `aria-pressed`;
- `OtpInput`, che compone il `OTPField` stabile di Base UI 1.6.0 con sei slot, incolla, autofill, tastiera numerica e un unico valore form.

`Dialog` e la primitiva modale centrata condivisa basata su Base UI: blocca l'interazione con il contenuto sottostante, gestisce focus, Esc e restituzione del focus al trigger. `Sheet` resta riservato ai pannelli laterali e alla navigazione mobile.

Il focus degli slot OTP resta interno al controllo: bordo tokenizzato e ring inset a basso contrasto evitano tagli sui bordi del gruppo e mantengono una destinazione tastiera nitida in light, dark e forced colors.

I codici a slot sono usati solo dove il contratto e numerico: verifica email, reset, autorizzazione enrollment e conferma del nuovo TOTP. Challenge MFA e prove del fattore corrente restano campi liberi per accettare anche backup code. Tutti i flussi compongono `Field`, `Alert`, `Spinner`, `Button`, `Input`, `Card` e Tabler Icons; Sirio ne mostra una prova statica nel catalogo.

La motion auth comunica ingresso e cambio di passaggio con transizioni di 220-260 ms, easing `cubic-bezier(0.23, 1, 0.32, 1)`, sole proprieta `opacity` e `transform` e fallback completo `prefers-reduced-motion`. I controlli frequenti non introducono ritardi: pressione, focus, riempimento OTP, loading e reveal password forniscono feedback immediato. Forced colors rimuove sfondi e maschere decorative.

Come riferimento esterno e stato ispezionato il blocco ufficiale shadcn `base-nova` `login-04` tramite CLI 4.13.1 (`info`, `docs`, `view`, `--dry-run`, `--diff`). Il blocco non e stato applicato perche avrebbe sovrascritto primitive Qoovex approvate; e stata riusata soltanto la gerarchia responsiva split-card. Provenienza e versioni sono registrate in `packages/ui/THIRD_PARTY_NOTICES.md`.

## Workspace shell e Da fare

La shell Workspace usa la variante `inset` della sidebar condivisa, mantiene il marchio leggibile nelle modalita mobile, estesa e collassata e mostra nella topbar il titolo della route corrente. Notifiche, tema e stato operatore restano controlli separati dalla navigazione primaria. Le destinazioni e la loro visibilita continuano a derivare da `buildWorkspaceNavigation`; la shell non introduce policy client-side.

Nel Workspace il cambio tra menu esteso e compatto usa un pulsante iconico esplicito nella topbar (`Riduci menu` / `Espandi menu` tramite nome accessibile e tooltip), non il `SidebarRail`: l'azione non puo essere confusa con il trascinamento del bordo o con l'aggiunta di elementi. Lo stato viene persistito nel cookie condiviso e riletto dalla shell server-side a ogni navigazione. Su mobile il controllo desktop scompare e la topbar espone `Apri navigazione`; la scorciatoia `Ctrl/Cmd+B` resta disponibile.

La sidebar segue una gerarchia task-first: `Ricerca`, `Da fare` e l'eventuale `Analisi` precedono il gruppo `Workspace`; Documenti, Calendario, Persone e Cantieri usano esclusivamente route e visibilita derivate dalla policy server-side. `Persone` e espandibile per rendere leggibili Lavoratori, ruoli come il capocantiere e accessi operativi senza appiattire tutte le destinazioni. Ricerca e Analisi sono marcate `Presto` e non simulano funzioni non implementate; Calendario apre per ora le scadenze registrate, senza promettere eventi o collegamenti Google.

La creazione globale usa l'action tray `Azioni rapide`, ancorato nel footer subito sopra `Azienda e account`: la posizione lo toglie dal flusso Workspace/Collegamenti rapidi e una superficie `sidebar-accent` con ring tokenizzato comunica un comportamento operativo distinto dalla navigazione. Tutte le creazioni consentite dalla policy restano one-click. Su desktop aperto sono una sola riga iconica, nella rail diventano una colonna raccolta e nel drawer touch una griglia a due colonne con etichette. Documento e Cantiere usano le icone Tabler composte `FilePlus` e `BuildingPlus`; lavoratore, prova, checklist e condivisione mantengono simboli specifici. Tooltip, nome accessibile e focus spiegano ogni destinazione, senza un generico `+` ambiguo. Ogni destinazione, incluse navigazione e scorciatoie, chiude il drawer mobile dopo il cambio route. `Personalizza collegamenti rapidi` resta invece una group action distinta dai link pinnati. La sezione consente di fissare fino a quattro route tramite checkbox; Calendario non viene duplicato tra i rapidi. I candidati provengono dalla policy di ruolo, mentre la preferenza resta locale al browser e non modifica permessi o navigazione canonica.

Sidebar e topbar occupano il viewport e non scorrono con la pagina: soltanto il contenuto centrale usa overflow verticale. Il toggle desktop sposta solo la propria icona insieme alla transizione canonica della sidebar. Il breadcrumb desktop e anche una cronologia di navigazione session-scoped: conserva al massimo tre route distinte, mantiene la pagina corrente come ultimo elemento e rende cliccabili le precedenti. Su mobile il logo viene rimosso dalla topbar e il breadcrumb fisso `Da fare` resta il ritorno rapido alla dashboard.

Come riferimento di gerarchia e stato e stato usato il componente React allegato dall'owner il 19 luglio 2026. Non e stato copiato codice, non e stata introdotta Lucide e non sono stati importati workspace multipli, piani, mock data o route estranee: la trasformazione usa la Sidebar shadcn `base-nova` gia approvata, Base UI, Tabler e policy Qoovex.

La campanella notifiche non naviga direttamente: apre uno `Sheet` modale app-local con titolo e descrizione accessibili, cinque aggiornamenti recenti, stato loading/vuoto/errore, severita, stato letto e azione contestuale. `Vedi tutte le notifiche` e una scelta secondaria esplicita verso `/notifications`, cosi l'apertura della campanella conserva il contesto di lavoro corrente.

La route `/dashboard` conserva il contratto situation-centric e il titolo prodotto `Da fare`. La composizione app-local usa `Card`, `Badge`, `Alert`, `Empty` e i controlli condivisi per mostrare riepilogo per stato, coda prioritaria, pacchetti pronti, prossime scadenze e contesti. Primo uso, vuoto, errore di sezione, errore completo, feedback di ritorno e varianti per ruolo usano gli stessi dati e gate server-side precedenti.

`Assegna` non porta piu direttamente alla pagina Accessi operativi: per risorse lavoratore o cantiere senza responsabile apre un `Dialog` contestuale con responsabile attuale, scelta della persona, loading, vuoto, errore e conferma. Il salvataggio aggiorna la dashboard; `Gestisci tutti gli accessi` resta una destinazione secondaria esplicita.

La motion della pagina serve orientamento e feedback: ingresso di 240 ms con sole `opacity` e `transform`, lieve sollevamento delle card filtro soltanto su puntatore fine, indicazione direzionale dell'azione e highlight dell'elemento appena aggiornato. `prefers-reduced-motion` e forced colors disattivano gli ingressi e le transizioni non essenziali. La pagina non usa una libreria motion separata e non anima il layout.
