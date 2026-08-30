# @qoovex/ui

Unica sorgente di verita del design system canonico Qoovex.

## Foundation

- shadcn `base-nova` con primitive open code;
- Base UI per comportamenti accessibili;
- Tabler Icons;
- Tailwind CSS v4 CSS-first;
- General Sans per la tipografia principale e Array come accento controllato, con fallback di sistema;
- tema Vercel light/dark/system con token OKLCH;
- ruoli semantici `info`, `success`, `warning` e `destructive`;
- supporto a focus visibile, forced colors e reduced motion.

## Contratto tipografico

General Sans e il default per display, headline, title, body, controlli e lettura prolungata. La scala condivisa e `36/40 600` per display, `30/36 600` per headline, `20/28 600` per title, `16/28 400` per body, `14/20 500` per compact/control e `12/16 600` con tracking `0.08em` per label/metadata Array. Non servono token tipografici aggiuntivi: questi passi corrispondono alla scala Tailwind v4 gia consumata dal package.

Array resta un accento raro per ID, timestamp, counter, metadata brevi, status e valori numerici focali. Fontshare espone realmente `400`, `600` e `700`, non `500`; `base.css` disabilita la sintesi del peso e il package non richiede `font-medium` insieme a `font-accent`. General Sans carica `400`, `500`, `600` e `700`. `font-mono` e riservato a codice, shortcut e diagnostica tecnica, non sostituisce Array per dati prodotto.

Il default e il wrap. `truncate`, `line-clamp` e `whitespace-nowrap` si usano soltanto in composizioni realmente vincolate, mantenendo il valore completo nel DOM e un modo appropriato per recuperarlo quando l'informazione e importante. Email, URL, filename e identificatori senza spazi possono usare `overflow-wrap: anywhere` sul singolo valore; `word-break: break-all` e vietato come correzione generale. `text-wrap: balance` e ammesso soltanto per heading corti e stabili.

Le cifre restano proporzionali nel copy e nei valori isolati. `tabular-nums` appartiene a timestamp, counter, colonne e valori che cambiano in-place. La typography non anima `font-size`, peso, line-height o tracking; fallback e reduced motion conservano la stessa gerarchia.

## Contratto icone

Tabler resta la famiglia canonica e usa `currentColor` con stroke standard `2`. SVG custom sono riservati a brand, contenuto o grafici procedurali gia giustificati; non si aggiungono icon set paralleli e non esiste un wrapper `Icon` generico.

La scala condivisa e semantica: `qv-icon-compact` / `--icon-compact` = 14px per metadata e contesti densi; `qv-icon-default` / `--icon` = 16px per controlli e testo ordinario; `qv-icon-emphasized` / `--icon-emphasized` = 20px per leading status; `qv-icon-illustrative` / `--icon-illustrative` = 28px per empty state e marker focali. Le classi impostano soltanto il box SVG. Misure da 12px restano eccezioni interne dei controlli micro; 24px non e promosso senza un ruolo reale e 32px resta component-specific per container illustrativi.

Icona e testo usano normalmente un allineamento centrato sulla line box. Un icon-only control centra il glyph nel proprio box, mantiene nome accessibile e hit target P004 sul controllo, e riceve il focus P003 sul controllo stesso. Un leading icon con testo multilinea puo usare un offset locale calcolato sulla prima line box; non esiste un offset universale. Selector come `[&_svg]` sono ammessi per struttura o size di default con opt-out esplicito, non per motion, colore, traslazione o scale indiscriminate su tutti i discendenti.

ToggleButton usa Base UI Toggle per uno stato `pressed` persistente con significato stabile. `pressedContent` permette al consumer una copy di stato intenzionale: contenuto visibile, nome accessibile e `aria-pressed` restano allineati e condividono una geometria intrinseca stabile. Ha una sola presentation quiet; le size testuali derivano da Button e quelle `icon-*` da IconButton. Switch, disclosure, ToggleGroup e command che descrivono l'azione opposta restano separati.

CloseButton e la specialization quiet per chiudere o dismissare una surface. Possiede IconX e geometria icon-only canoniche, ma non behavior di Dialog, placement o testo localizzato; il consumer compone il behavioral owner e fornisce `aria-label` o `aria-labelledby` contestuale.

Le icone decorative usano `aria-hidden="true"`; il nome di un'azione icon-only appartiene a button/link. Soltanto un grafico standalone informativo usa `role="img"` e un nome accessibile. Icone status ereditano il colore semantico del parent e forced colors tramite `currentColor`; gli override di stroke sono eccezioni locali provate, non una seconda grammatica.

Motion segue il lifecycle reale: disclosure/open, continuita direzionale, replacement di conferma e loading possono usare `motion/react` quando interruption e reversal migliorano. Rapid input retargetta dalla posizione corrente; nessuna trasformazione cambia hit area o focus geometry. Reduced motion usa replacement o stato istantaneo e conserva copy/ARIA. Spinner mantiene una famiglia intenzionale ridotta (`ring`, `track`, `hexagon`, `pulse`): `hexagon` usa una track fissa e anima soltanto il segmento di progresso lungo il perimetro. Spinner e loader sono `aria-hidden` quando il parent comunica `aria-busy`/status e fermano il movimento continuo in reduced motion senza rimuovere il feedback comprensibile.

## Contratto surface ed elevation

Qoovex distingue `surface` (tono/background), `elevation` (separazione percettiva) e `stacking` (ordine tecnico). I ruoli condivisi sono pochi e deliberatamente accoppiati: `qv-surface-base` usa `background` senza ombra; `qv-surface-contained` usa `card` + bordo senza ombra; `qv-surface-raised` aggiunge `--elevation-raised`; `qv-surface-floating` usa `popover`, bordo più netto e `--elevation-floating`; `qv-surface-modal` usa `card`, bordo più netto e `--elevation-modal`. Nessuna classe assegna `position` o `z-index`, e non esiste una matrice libera surface × shadow.

`shadow-2xs` e `shadow-xs` hanno lo stesso valore dalla loro introduzione: restano alias di compatibilità, non due livelli percettivi. I nuovi consumer non scelgono fra i due per simulare profondità. Le superfici statiche devono essere leggibili tramite shape, tono, bordo e spacing; un lift è riservato a interazione reale o sovrapposizione.

`qv-backdrop-modal` usa `--backdrop-modal` e un blur minimo tokenizzato. Il dimming comunica il cambio di contesto anche senza blur; reduced transparency lo rimuove. In forced colors le ombre vengono eliminate esplicitamente, i piani importanti mantengono un bordo `CanvasText` e il backdrop usa colori di sistema senza bloccare l'adattamento del browser.

Ogni modal root usa un solo backdrop. Popup e menu annidati diventano floating sopra il modal senza accumulare dimming; un secondo modal reale conserva il proprio portal e lifecycle, mentre l'ordine numerico dei layer resta fuori P007 e appartiene al futuro contratto stacking.

Motion può accompagnare un cambio reale di piano con transform e opacity usando la durata `surface`, mentre tono, bordo e shadow restano segnali statici del livello raggiunto. Non si anima una sequenza di box-shadow pesanti come effetto principale. Rapid open/close e reversal retargettano dalla posizione corrente; reduced motion applica immediatamente la gerarchia finale senza movimento spaziale.

## Contratto curvature e nesting

`--radius: 0.625rem` (10px alla root standard) e l'unico default Qoovex. I token derivati sono `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 10px` e `--radius-xl: 14px`; componenti e app non ridefiniscono una copia locale del default. Le geometrie semanticamente pill continuano a usare `rounded-full`.

Quando due bordi arrotondati nidificati condividono un angolo percettivo, la relazione e sempre `R esterno = R interno + inset reale`, quindi `R interno = max(0px, R esterno - padding)`. La formula si valuta per ogni angolo e usa la distanza effettiva tra i bordi, anche con padding asimmetrico; scegliere due step della scala “a occhio” non e equivalente. Un discendente lontano dagli angoli del parent non forma una coppia concentrica. Popup con item edge-adjacent, frame inset e surface concentriche devono invece rispettare la formula senza eccezioni.

Il package contiene primitive presentazionali, `PasswordInput`, `OtpInput`, `ThemeProvider`, `ThemeToggle`, `FloatingNavigation`, `MarketingCursor`, `BrandMark`, `cn` e `useIsMobile`. I controlli password e OTP gestiscono soltanto presentazione, accessibilita e valore form: non contengono auth, Prisma, ruoli, permessi, servizi o copy normativo.

`MarketingCursor` e un enhancement opt-in per le sole superfici marketing. Mantiene il punto di precisione, aggiunge un alone elastico e accetta micro-label dichiarative con `data-cursor-label`. Non viene attivato su touch, penna, reduced motion o forced colors e ripristina il cursore nativo su campi e contenuti editabili.

## Contratto interaction state

Gli alias `qv-*` dichiarati in `styles/base.css` rendono interrogabili con la stessa grammatica gli stati nativi, ARIA e Base UI. Sono esclusivamente selector variant semantiche: non applicano globalmente colore, opacity, bordo, scale, motion o altro stile. Ogni componente decide la propria presentazione usando lo stato reale che possiede.

| Alias | Stato reale riconosciuto | Famiglia |
| --- | --- | --- |
| `qv-selected` | `data-selected`, `data-state="selected"`, `aria-selected="true"` e `data-pressed` soltanto sullo slot Toggle | persistent |
| `qv-checked` | `:checked`, `data-checked`, `aria-checked="true"` | persistent |
| `qv-indeterminate` | `:indeterminate`, `data-indeterminate`, `aria-checked="mixed"` | persistent |
| `qv-open` | `data-open`, `data-panel-open`, `data-popup-open`, `aria-expanded="true"` | persistent |
| `qv-invalid` | `:user-invalid`, `data-invalid`, `aria-invalid="true"` | validation |
| `qv-loading` | `data-loading="true"`, `data-pending="true"`, `aria-busy="true"` | system |
| `qv-readonly` | `readonly`, `data-readonly`, `aria-readonly="true"` | availability constraint |
| `qv-disabled` | `disabled`, `data-disabled`, `aria-disabled="true"` | availability constraint |

La composizione procede da `rest` allo stato persistente, poi validation/system e infine availability. Nessuno strato cancella la semantica sottostante: `invalid` puo coesistere con `checked` o `selected`, mentre `loading` puo impedire una nuova activation senza falsificare lo stato corrente. `focus-visible` e sempre additivo quando l'elemento resta focusabile e deve risultare leggibile sopra selected, checked, invalid e readonly. Hover e pressed sono feedback transient, ammessi soltanto quando availability e input modality lo consentono; disabled li sopprime, readonly non equivale a disabled e conserva focus, selezione e copia previsti dalla semantica nativa.

Non esiste un alias globale `qv-pressed`: `data-pressed` rappresenta una selezione persistente sul Toggle, ma puo descrivere una fase transitoria o una semantica diversa in altre primitive. Gli stili component-specific devono quindi usare il contratto reale della primitiva. Gli stati importanti restano comprensibili senza colore, scale, hover o motion e i cambi transient non modificano la geometria.

## Contratto focus

Il lifecycle canonico e `unfocused → keyboard focus-visible → interaction → focus transfer → focus restoration`. L’indicatore primario compare immediatamente: non dipende da transizioni, Motion o reduced-motion. `focus-visible` si aggiunge sempre agli strati P002 e non sostituisce selected, checked, invalid, readonly, destructive o open.

La geometria condivisa usa `--focus-ring-width: 2px`, `--focus-ring-offset: 2px` e `--focus-ring-color: var(--ring)`. L’outline opaco non modifica il box model e segue il raggio del controllo; un contenitore con overflow deve lasciare almeno lo spazio dell’outline oppure delegare il focus a un owner visibile. Durante `:focus-visible`, `base.css` neutralizza i soli canali ring Tailwind per impedire che ring/offset locali si sommino all’outline; bordi, background, stato semantico e ombre non-ring restano intatti. In forced colors l’outline usa il system color `Highlight`, senza dipendere da shadow o alpha.

Il controllo direttamente focusabile possiede normalmente l’indicatore. Un field composite puo dichiarare `data-focus-owner="composite"`; soltanto i discendenti marcati `data-focus-target="composite"` delegano l’outline al parent. Gli altri controlli interni conservano il proprio focus, così toolbar e action multiple restano localizzabili. `:focus-within` o `data-focused` non sono scorciatoie generiche: si usano soltanto quando la percezione appartiene davvero al container e la modality resta verificabile.

Base UI possiede apertura, focus iniziale, trap, Escape/dismiss e ritorno al trigger. Si mantengono i default della primitive quando corretti: primo tabbable per keyboard/mouse, popup per touch quando evita una tastiera virtuale involontaria, ritorno al trigger o all’elemento precedentemente focalizzato. `initialFocus` o `finalFocus` si configurano soltanto per un requisito reale; se il trigger viene rimosso, `finalFocus` deve puntare a un elemento stabile e logicamente successivo. Una navigazione/unmount trasferisce il focus alla destinazione o a un heading/fallback programmaticamente focusable, non al `body`.

Topbar e superfici fixed/sticky non devono oscurare il target. Il layout owner applica `scroll-padding` allo scrollport reale e `scroll-margin` ai target quando la geometria lo richiede; offset globali non sostituiscono la verifica del container annidato. Pointer e touch non ricevono un finto keyboard ring, mentre tastiera e forced colors mantengono sempre un indicatore robusto.

## Ordine delle action con testo

Seguire `docs/05_UI_BRAND_AND_SURFACES.md`: testo prima, icona dopo; leading soltanto per un motivo semantico esplicito, come Indietro. Button conserva l'ordine JSX e propaga il gap della size a entrambi i layer interni. Il loader usa Spinner `hexagon`. Le frecce orizzontali condividono l'intent IconAction con IconButton; su/giu non spingono la surface dei Button testuali.

La CTA con `data-cursor-magnetic="true"`, in presenza di MarketingCursor, riceve un offset limitato ai layer visuali: root, hitbox, focus e sibling restano fermi. Nessun magnetismo implicito sui Button normali; touch, reduced motion e forced colors lo disattivano.

## Contratto motion

La grammatica canonica e `instant → feedback → state → surface`. I valori numerici vivono soltanto in `styles/tokens.css`; CSS li usa con `var(...)`, mentre JavaScript e `motion/react` li proiettano tramite `@qoovex/ui/lib/motion` leggendo i custom property computati. Copiare durate o curve in mapping locali crea una seconda source of truth ed e vietato.

| Ruolo | Token | Uso appropriato | Non usare per |
| --- | --- | --- | --- |
| `instant` | `--motion-duration-instant: 100ms` | comparsa percettiva immediata, opacity breve, affordance che non deve sembrare latenza | movimento spaziale o lifecycle di una superficie |
| `feedback` | `--motion-duration-feedback: 160ms` | hover fine-pointer, press/tap e risposta tattile locale | stato persistente, loading o conferma asincrona |
| `state` | `--motion-duration-state: 200ms` | continuita tra checked, selected, expanded e altri stati persistenti reali | entrata/uscita di overlay o decorazione ripetuta |
| `surface` | `--motion-duration-surface: 300ms` | presenza e movimento spaziale di dialog, sheet, popover o layout quando orientano l'utente | input frequente o feedback di controllo |

`--ease-standard` governa feedback e cambi di stato ordinari. `--ease-emphasized` e riservato a entrate, uscite o distanza spaziale che richiedono una decelerazione piu leggibile. `transition-all` non appartiene al contratto: ogni transizione elenca le proprieta intenzionali, per evitare effetti collaterali e layout shift. Spring, inertia, bounce, wobble e overshoot non sono token globali; una spring si definisce soltanto nel componente che prova una necessita fisica reale, senza promuoverla a default Qoovex.

Ogni interazione pertinente segue `rest → interaction → transition → settled`. Interruzione, inversione e rapid repeated input retargettano dalla posizione corrente, senza coda e senza disallineare stato visuale e stato reale. Gli input restano disponibili durante la transizione. Unmount e navigazione non aspettano animazioni decorative; presence/exit puo sopravvivere al DOM soltanto quando Base UI o Motion ne gestiscono lifecycle, focus e dismissal. Lo stato asincrono resta esplicito tramite semantica e copy: motion non sostituisce pending, successo, errore, rollback o retry.

Con `prefers-reduced-motion: reduce`, il movimento spaziale non essenziale diventa immediato o viene rimosso, preservando lifecycle Base UI. Feedback statici e transizioni di opacity, colore o bordo possono restare quando chiariscono causa e stato. Nessuna informazione dipende soltanto dal movimento. Hover e cursor enhancement sono ammessi solo con `(hover: hover) and (pointer: fine)`; touch e coarse pointer mantengono lo stesso stato e la stessa azione senza hover essenziale.

La scelta tecnologica separa responsabilita, non impone una scala di fallback. Base UI possiede comportamento, semantica, ARIA, tastiera, focus e state machine; CSS/Tailwind possiedono styling statico e transizioni visuali realmente banali; `motion/react` e first-class per interaction feedback, state transition, continuita spaziale, enter/exit, layout, gesture, indicator movement, interruption/reversal e microinterazioni che beneficiano di variants o controllo dichiarativo del lifecycle. Quando questa qualita o questo controllo sono percepibili, Motion e preferibile anche se CSS potrebbe approssimare l'effetto. Nessuna animazione resta corretta quando non produce beneficio UX.

`@qoovex/ui/lib/motion` proietta i token CSS canonici nelle `Transition` usate da Motion e centralizza la query reduced-motion senza duplicare valori numerici. Lo `Switch` condiviso e il benchmark interno per integrazione tramite `render`, stato Base UI reale, variants state-driven, `whileTap`, transizioni feedback/state separate, interruzione naturale e reduced motion esplicito. Non esiste un `MotionConfig` globale: una sua eventuale adozione richiede una decisione separata e prove su tutti i consumer. Non si importa `framer-motion` direttamente.

## Link e sottolineatura

Il ruolo del collegamento viene dichiarato con `data-link`: `inline` per link dentro testo sempre sottolineati, `quiet` per link autonomi sottolineati in hover e focus, `plain` per navigazione, card e CTA mai sottolineate. `data-link-scope="inline"` applica il contratto ai link non marcati dentro un contenitore di testo. Button e badge neutralizzano sempre la sottolineatura.

Il testo editoriale resta copiabile con un highlight neutro tokenizzato. Immagini e `BrandMark` non sono selezionabili; i mockup UI possono dichiarare `data-selection="none"` senza modificare la selezione delle superfici prodotto reali. Forced colors conserva l'highlight di sistema.

`ScrollbarController` rende attiva per un tempo breve la scrollbar nativa durante lo scroll e vicino ai bordi della viewport. `styles/base.css` è l'unico owner dello stile scrollbar: la stessa scrollbar approvata per la sidebar viene ereditata da pagine, contenitori annidati, tabelle, dropdown e textarea, senza classi opt-in né skin locali. Nei motori WebKit/Chromium desktop il segno visivo da 4 px sta in una corsia nativa trascinabile da 8 px (`--scrollbar-size`), trasparente e senza frecce; hover/focus/scroll cambiano solo il tono, non la geometria. Gli altri motori desktop usano `thin` con gli stessi token; touch e forced colors conservano la scrollbar del browser. I componenti possono possedere solo la geometria locale (gutter stabile della sidebar, track rientrata negli angoli del textarea), non un secondo stile.

`SelectContent` e `DropdownMenuContent` (inclusi i submenu) dimensionano il popup sul contenuto, entro la larghezza disponibile alla surface. Nessun minimo fisso o aggancio automatico alla larghezza del trigger. Una larghezza esplicita del consumer resta possibile quando appartiene alla composizione; non aggiungere override locali per Phone/Currency. La scrollbar è quella globale, non una variante dropdown.

`PhoneInput` mantiene il prefisso selezionato separato dal valore nazionale. Il vero `type="tel"` accetta e invia soltanto cifre, usa tastiera numerica mobile e limita l'inserimento al massimo strutturale di 15 cifre complessive, sottraendo quelle del prefisso; paste con lo stesso prefisso lo elimina. È un controllo sintattico minimo, non valida l'esistenza del numero né regole nazionali complete.

`AdaptiveSidebar` conserva due opt-in, attivi nella shell Sirio: `resizable` permette il drag desktop della larghezza tra 224 e 360 px (default 256), con gap di pagina sincronizzato, frecce da tastiera a passi di 8 px, Home/End e doppio clic per ripristinare; il resize diretto non viene animato. `scrollEdges` applica al solo fondo della lista una fascia da 48 px con blur da 6 px e tint uniforme della surface sidebar: una sola maschera progressiva evita la doppia attenuazione di gradienti sovrapposti. Esclude la scrollbar, scompare raggiungendo l'ultima voce e non intercetta il pointer. Nessun blur in forced colors. Header/footer e mobile Dialog mantengono i propri confini. Il thumb nativo desktop ha un segno da 4 px in un gutter trascinabile da 8 px; la maniglia resize occupa il margine esterno separato e non viene offerta su pointer coarse.

In dark, la stessa maschera dissolve il testo direttamente nella surface opaca, senza backdrop blur: i pixel chiari si attenuano senza generare aloni luminosi.

## Contratto pointer, touch e adattivo

Qoovex distingue sempre `visual size`, `interactive hit area` e `spacing between adjacent targets`. `--touch-target-min` resta il target effettivo minimo di `44px` per i controlli appropriati quando il pointer primario e coarse, manca hover oppure un dispositivo aggiuntivo coarse e disponibile. `qv-touch-target` assegna la misura al box reale; `qv-touch-target-field` preserva la larghezza fluida del field; `qv-touch-target-inline` mantiene l'eccezione dei link dentro testo.

`qv-touch-target-compact` centra una hit area invisibile di `44px` sul controllo visivo senza cambiare layout o focus geometry. Si usa soltanto quando il consumer riserva una cella di almeno `44px` e non esistono sibling target sovrapposti, clipping o attivazioni ambigue. Se quella cella non e disponibile, spacing o geometria reale devono crescere: due hit area invisibili non possono sovrapporsi.

Hover e enhancement hover richiedono `(hover: hover) and (pointer: fine)`. `any-pointer` serve soltanto a conoscere un dispositivo aggiuntivo, per esempio per mantenere target touch adeguati su hardware ibrido; non disabilita l'hover del pointer primario fine. Mouse, touch e pen possono coesistere. Pointer Events possiedono il lifecycle `rest → pointer down → pressed → release inside / release outside / cancellation → settled`; activation, tastiera e ARIA restano native o Base UI. `pointerType` si usa solo per differenze interaction-specific provate e una penna non viene trattata automaticamente come touch.

Motion e first-class per hover/tap/cancel quando variants e lifecycle controllato migliorano davvero feedback, interruption o gesture. Non sostituisce l'activation e non trasforma il box che possiede la hit area: l'eventuale trasformazione appartiene a un child visuale. Reduced motion mantiene feedback immediato tramite colore, opacity o stato statico. `touch-action: none` non e una regola foundation e resta vietato globalmente; un futuro controllo pan/drag deve dichiarare l'asse di scroll che conserva e non bloccare pinch zoom senza necessita.

La matrice `320 / 390 / 768 / 1024 / 1440` e una matrice di prova, non una scala di breakpoint. I componenti partono da layout intrinseco e wrapping; container query per decisioni dipendenti dallo spazio del componente, media query per viewport/shell e JavaScript soltanto per comportamento non esprimibile in CSS. Stesso componente, DOM, semantica, ordine di focus e feature availability restano il default. Il contenuto normale non crea overflow di pagina; scroll orizzontale e ammesso localmente soltanto per contenuti realmente bidimensionali.

`useIsMobile` indica esclusivamente il breakpoint comportamentale usato dalla Sidebar per scegliere disclosure persistente o Dialog Base UI. Osserva `matchMedia`, non descrive device, touch, hover o pointer capability e non deve governare styling o interaction behavior generico. `dvh` segue viewport dinamiche e tastiera software; `svh` stabilizza shell che non devono saltare con il browser chrome; `lvh` non e un default. Overlay e navigazioni fixed consumano i token `--safe-area-*`, definiti una sola volta con `env(safe-area-inset-*)`; i layout root dichiarano `viewport-fit=cover`.

Il normale browser resize non anima il relayout. Motion e ammesso per transizioni discrete avviate dall'utente quando migliora la continuita, senza nascondere feature o divergere in reduced motion.

Il contratto completo e in `config/mobile-experience.json`. Verifica locale: `pnpm mobile:doctor` per audit deterministico e `pnpm mobile:test` per geometria, input, tastiera, orientation, zoom-equivalent e reduced motion nel browser reale.

## API pubblica

Il barrel root `@qoovex/ui` non esiste. I consumer importano esclusivamente subpath espliciti:

```ts
import { Button } from "@qoovex/ui/components/button";
import { IconAction } from "@qoovex/ui/components/icon-action";
import { IconButton } from "@qoovex/ui/components/icon-button";
import { ToggleButton } from "@qoovex/ui/components/toggle-button";
import { CloseButton } from "@qoovex/ui/components/close-button";
import { CopyButton } from "@qoovex/ui/components/copy-button";
import { Label } from "@qoovex/ui/components/label";
import { Link, linkVariants } from "@qoovex/ui/components/link";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { useIsMobile } from "@qoovex/ui/hooks/use-mobile";
import { cn } from "@qoovex/ui/lib/utils";
```

`Label` è l’unica primitive semantica (`<label>`, `htmlFor`), General Sans `14/20 500`, wrap naturale, senza margin esterni o motion. `required` mostra un piccolo `*` neutro; `optional` mostra `Facoltativo` solo quando utile e mai insieme a required. Entrambi i metadata sono `aria-hidden`: il nome accessibile rimane il testo della Label. Il consumer/form passa lo stesso valore required a Label e control (nativo quando supportato, ARIA per control custom); nessuna inferenza CSS o ispezione DOM. I form helper derivano la presentazione dalle props del control. Required non implica invalid; disabled/readonly non cancellano il requisito. Disabled usa muted opaco; invalid non colora la Label.

`Field` è il container di composizione fluido (`min-width: 0`, nessuna max-width) per Label, control, Description ed Error. Non applica `role="group"`: i gruppi reali usano `FieldSet`/`FieldLegend`. Il default `vertical` e l’orientamento `horizontal`, riservato alle righe compatte realmente usate come Checkbox + Label, possiedono ritmo e reflow; la variante `responsive` e `FieldContent` non fanno parte dell’API perché non avevano consumer né ownership autonoma. Field non rinomina il controllo né replica required, disabled, readonly o invalid; Description ed Error restano informazioni aggiuntive collegate dal consumer tramite `aria-describedby`.

Il test `label-system.test.mjs` verifica via AST le associazioni JSX esplicite `Label htmlFor` / control `id` nelle tre app: un marker perso, un required solo visuale o valori required divergenti fanno fallire `@qoovex/ui test`. Wrapper con spread o associazioni risolte a runtime richiedono test del consumer; il controllo statico non sostituisce la semantica nativa. La presentazione disabled della Label segue il control di valore o lo stato esplicito del Field, mai le azioni ausiliarie disabilitate (per esempio gli stepper NumberInput ai limiti o in readonly).

`Input` è il primitive nativo/Base UI di text entry all'entrypoint `@qoovex/ui/components/input`. Espone direttamente le props HTML senza stato controlled parallelo, alias semantici o API per icon/addon. Possiede una sola geometria base `36px`/`10px`, width fluida nel container, surface opaca, focus immediato e stati readonly, disabled e invalid distinti senza opacity globale o trasformazioni. Label, description ed error message restano fuori da Input; Password/Search/Phone/Currency/Number/OTP e InputGroup possiedono le rispettive composizioni specializzate.

### Prefissi e suffissi statici (P020)

`InputGroup` e `InputAddon` restano export di `@qoovex/ui/components/input`. Il pattern è esplicito: `<InputGroup><InputAddon>https://</InputAddon><Input /></InputGroup>`; il suffisso segue Input nel DOM, senza props nuove sul controllo. Group possiede una sola surface opaca, radius Input (10px), altezza 36px/44px coarse, bordo e focus visuale. Il vero Input diretto conserva focus, ref, native props, valore, selezione e form association. Le dichiarazioni CSS degli stati sono le stesse di Input, selezionate tramite `:has()` sul controllo: nessuna state machine, ring interno, clipping del focus o motion spaziale. Gli addon non possiedono action, tab stop, click-to-focus o IconAction; un glyph puramente decorativo usa Icon/Tabler normale e `aria-hidden`.

Addon possiede padding inline 12px e separatore inset 6px; posizione e ordine derivano dal DOM. `position="left" | "right"` resta compatibilità, non riordina il contenuto. Gli addon statici brevi non si restringono: niente ellissi o max-width implicite; contenuti eccezionalmente lunghi richiedono una composizione esplicita del consumer. Il Group possiede una container query locale sotto 12rem: padding interno 6px (scala rem) per preservare il valore anche al 200%. I selector Phone/Currency usano il wrapper privato `SelectableAddon`, mai `InputAddon`: Select possiede comportamento e focus; Group condivide separatore e allineamento. Nei container stretti il selector conserva il contenuto intrinseco e riduce i gap. Contesti necessari al significato del valore si associano con `aria-describedby`; se già descritti, i simboli visuali possono essere `aria-hidden`. Nessun tooltip automatico o form control aggiuntivo.

Un prefisso visuale non fa parte di `value` o FormData. Per `https:// | dominio`, `UrlInput` usa `type="text"` con `inputMode="url"`: il valore resta dominio/percorso e il consumer aggiunge esplicitamente `https://`. Il controllo rifiuta soltanto errori sintattici locali evidenti (protocollo duplicato, spazi, dominio incompleto); non normalizza, interroga DNS o naviga. `CurrencyInput` conserva l'importo come stringa esatta, formatta soltanto in uscita dal campo e non converte quando cambia valuta. `CompositeInput`, `PhoneInput`, `CurrencyInput` e `UrlInput` sono provati nella pagina Sirio `/components/composite-input`; il suffix `%` resta composizione statica, senza un PercentageInput pubblico privo di consumer.

### Public Entry Point Rule

`NumberInput` usa esclusivamente `@qoovex/ui/components/number-input`. Base UI NumberField possiede parsing, empty/null, controlled/uncontrolled, min/max/step e form value; il vecchio export da Input e `onChangeValue` non avevano consumer e sono rimossi. API: `value: number | null` + `onValueChange`, oppure `defaultValue`, `onValueCommitted`, `min/max/step/locale` e props native del vero input (incluso `ref`). Nessun default zero, wheel stepping o formatting di dominio. `className` compone width/layout del root.

La presentazione riusa il contratto interno Input e `.qv-input`, senza duplicare i suoi stati. Una grid stabile lascia il bordo al vero input e colloca IconButton/IconAction nei due slot laterali: altezza 44px fine-pointer, 56px coarse, target touch 44px, radius Input invariato. I render prop di NumberField trasferiscono behavior, ref e unavailable state alle Actions senza nested button. Tab segue − / input / +; ai limiti e in readonly/disabled le Actions sono realmente disabled. Pointer, focus restoration e hold nativo restano di Base UI, senza handler o timer paralleli.

- ogni componente espone un solo import path pubblico canonico;
- gli internals restano fuori dall'export map e nessun consumer li importa;
- non esiste un barrel globale del package;
- un facade sottile e ammesso quando stabilizza l'API pubblica sopra responsabilita multi-file reali;
- un componente multi-file mantiene il facade in `components/<nome>.tsx` e colloca gli internals in `components/<nome>/`, con il relativo subpath escluso dall'export map;
- lo split segue un responsibility boundary concreto; se un singolo file resta chiaro, si preferisce il singolo file.

Ogni app importa una sola volta:

```css
@import "@qoovex/ui/styles/base.css";
@source "../**/*.{ts,tsx}";
```

`Button` e riservato esclusivamente alle azioni e il suo modulo esporta soltanto il command component. Link e navigazione usano un `<a>` reale, `Link`, oppure il router Link del consumer con lo styling server-safe di `linkVariants`; non importano API o variant dal modulo Button. L'implementazione Button usa Base UI e `motion/react`; loading conserva label, geometria e focus, blocca activation ripetute e comunica `aria-busy`.

`IconButton` e l'entrypoint icon-only stateless: non e una size del Button testuale. Richiede `aria-label` oppure `aria-labelledby`, espone soltanto `xs`, `sm` e `default`, mantiene il glyph fuori dalla deformazione della surface e separa la size visuale dal target coarse reale da 44 px. Tooltip non viene montato automaticamente. Toggle, close/dismiss e copy restano responsabilita dei rispettivi componenti specializzati; le vecchie size `Button icon*` sono una migration surface temporanea per i consumer specializzati ancora non migrati e non sono ammesse nei nuovi consumer.

`IconAction` e il glyph layer decorativo condiviso dalle Actions. Non renderizza un controllo, non possiede focus, click, hit target o nome accessibile: il parent dichiara l'intent semantico e continua a possedere l'interazione. Gli intent canonici scelgono Tabler glyph, slot stabile, motion recipe e comportamento reduced-motion; `neutral` richiede esplicitamente un glyph e resta statico. Non espone classi geometriche o primitive di animazione.

| Intent | Glyph | Trigger | Motion | Uso |
| --- | --- | --- | --- | --- |
| `forward/back/up/down` | Arrow | hover/press | micro-translate direzionale | progressione e navigazione |
| `disclosure` | ChevronDown | `closed/open` | rotazione controllata | expand/collapse |
| `visibility` | Eye/EyeOff | `hidden/visible` | switch coordinato | visibilita password |
| `clear` / `close` | X | hover/press | microresponse discreta | clear value / dismiss surface |
| `copy` | Copy/Check/Error | lifecycle | switch coordinato | conferma clipboard |
| `increment/decrement` | Plus/Minus | hover/press | micro-scale centrata, nessuna traslazione | numeric stepping |
| `menu` | Menu a due linee / X | hover/press, `closed/open` | lieve apertura delle linee, switch centrato; X coerente con close | apertura/chiusura menu |
| `neutral` | glyph consumer | nessuno | statico intenzionale | command senza moto semantico |

`ToggleButton` e l'entrypoint standalone per una proprieta o modalita persistente di un button. Espone direttamente `pressed`, `defaultPressed`, `onPressedChange`, `disabled`, `render`, `nativeButton` e `value` di Base UI Toggle: non introduce alias come `active`, `selected` o `checked`, ne stato React parallelo. `pressedContent` e l'unica estensione per una rappresentazione ON distinta: i due layer condividono la stessa cella grid, il layer inattivo e `aria-hidden` e copy/icon/surface transizionano insieme senza reflow. Ha una sola presentation quiet; `sm/default/lg` riusano la geometria Button e `icon-xs/icon-sm/icon` quella IconButton, con nome accessibile obbligatorio per l'uso icon-only. Il layer di contatto fisico e quello `aria-pressed` persistente restano distinti. Switch conserva `checked` per setting on/off; disclosure usa `aria-expanded`; un command che rinomina l'azione opposta non e un ToggleButton; ToggleGroup resta separato.

`CloseButton` e l'entrypoint specializzato per close/dismiss. Espone normali button props compatibili, `className`, disabled e il naming accessibile obbligatorio, ma non espone children, icon, variant, size, inline geometry style o loading. Usa una sola geometria quiet da 28px/radius 8px, con target coarse reale da 44px e Action Motion icon-only. Positioning e dismissal appartengono al consumer o alla primitive comportamentale: `Dialog.Close` lo compone senza nested button e conserva la focus restoration Base UI. Quando il close automatico e visibile, `DialogContent` richiede `closeButtonProps` con un nome contestuale e la composizione riserva spazio per target coarse piu offset, non soltanto per la X visuale.

`CopyButton` e il command icon-only specializzato per copiare una stringa. Possiede Clipboard API, stati interni `idle → copying → success/error → idle`, IconCopy/Check/Error sovrapposte nello stesso slot, una sola presentazione quiet e un hold success di 1000ms; il nome accessibile resta stabile e un unico status live comunica esito o retry. Non espone stato controlled, icon, variant, size, timeout o callback generiche, non usa `aria-pressed` e non serializza mai il valore copiato nel DOM o nei metadata. Flussi sensibili e azioni testuali restano composizioni consumer dedicate.

## Confini

`SearchResults` mantiene il contenuto dei risultati sotto il controllo del consumer. `empty` dichiara esplicitamente una ricerca conclusa senza corrispondenze (mai la query iniziale vuota) e mostra la stessa composizione `Empty` in inline e modal. `onReset`, quando disponibile, espone “Ricomincia la ricerca”: il consumer svuota la query e ripristina il focus nell'Input. Solo il messaggio vuoto è uno status; la lista non diventa automaticamente una live region. `SearchField` non acquisisce logica di ricerca o risultati.

Textarea mantiene il vero elemento nativo come owner di ref, props, focus, valore, selezione e tre esiti di altezza: auto-grow (default), fissa, verticale manuale. Un frame privato non interattivo posiziona una dissolvenza del contenuto sui soli bordi con testo fuori vista; copre la larghezza interna esclusa la scrollbar reale, senza mascherare border o focus. La dissolvenza usa la stessa surface opaca dello stato corrente tramite `--qv-field-surface`, non filtri backdrop: fondo e angoli restano nitidi, senza diffondere la luminosità dei glyph in dark. La rampa di 1.5rem si attenua al 60% durante il focus editabile, senza scomparire: caret e selezione restano visibili e lo scroll-to-caret resta nativo. Opacity e surface seguono i timing Fields; reduced motion rende il cambio immediato. ResizeObserver, scroll/input e aggiornamenti React sincronizzano gli indicatori senza un secondo value state o un algoritmo di scroll/resize. Il frame non viene montato/smontato al cambiare dell'overflow. Forced colors rimuove la dissolvenza.

Il resize manuale stilizza la vera `::-webkit-resizer` con un segno orizzontale 8 x 2 px, indipendente dalla hit area nativa: nessun grip finto o pointer handler. Con fine pointer e supporto WebKit, Textarea usa il thumb e i token scrollbar esistenti, senza i pulsanti freccia nativi. I motori senza quel pseudo-elemento e forced colors mantengono la maniglia nativa funzionale; touch e forced colors mantengono la scrollbar del browser. Lo styling non promette un resize custom uniforme tra motori.

- nessun import da `apps/*`, `@qoovex/db`, Auth.js o tipi di dominio;
- nessun componente condiviso duplicato nelle app;
- CSS app-local ammesso solo per layout o composizioni specifiche;
- provenienza e licenze in `THIRD_PARTY_NOTICES.md`;
- il guardrail `pnpm --filter @qoovex/ui test` controlla package e consumer.
