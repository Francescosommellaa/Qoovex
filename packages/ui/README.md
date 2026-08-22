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

Le icone decorative usano `aria-hidden="true"`; il nome di un'azione icon-only appartiene a button/link. Soltanto un grafico standalone informativo usa `role="img"` e un nome accessibile. Icone status ereditano il colore semantico del parent e forced colors tramite `currentColor`; gli override di stroke sono eccezioni locali provate, non una seconda grammatica.

Motion segue il lifecycle reale: disclosure/open, continuita direzionale, replacement di conferma e loading possono usare `motion/react` quando interruption e reversal migliorano. Rapid input retargetta dalla posizione corrente; nessuna trasformazione cambia hit area o focus geometry. Reduced motion usa replacement o stato istantaneo e conserva copy/ARIA. Spinner e loader sono `aria-hidden` quando il parent comunica `aria-busy`/status e fermano il movimento continuo in reduced motion senza rimuovere il feedback comprensibile.

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

`ScrollbarController` rende attiva per un tempo breve la scrollbar nativa durante lo scroll e vicino ai bordi della viewport. Il CSS condiviso gestisce anche contenitori annidati, tabelle, menu e sidebar con thumb sottile tokenizzato; touch, pointer coarse e forced colors mantengono il comportamento nativo.

## Contratto pointer, touch e adattivo

Qoovex distingue sempre `visual size`, `interactive hit area` e `spacing between adjacent targets`. `--touch-target-min` resta il target effettivo minimo di `44px` per i controlli appropriati quando il pointer primario e coarse, manca hover oppure un dispositivo aggiuntivo coarse e disponibile. `qv-touch-target` assegna la misura al box reale; `qv-touch-target-field` preserva la larghezza fluida del field; `qv-touch-target-inline` mantiene l'eccezione dei link dentro testo.

`qv-touch-target-compact` centra una hit area invisibile di `44px` sul controllo visivo senza cambiare layout o focus geometry. Si usa soltanto quando il consumer riserva una cella di almeno `44px` e non esistono sibling target sovrapposti, clipping o attivazioni ambigue. Se quella cella non e disponibile, spacing o geometria reale devono crescere: due hit area invisibili non possono sovrapporsi.

Hover e enhancement hover richiedono `(hover: hover) and (pointer: fine)`. `any-pointer` serve soltanto a conoscere un dispositivo aggiuntivo, per esempio per mantenere target touch adeguati su hardware ibrido; non disabilita l'hover del pointer primario fine. Mouse, touch e pen possono coesistere. Pointer Events possiedono il lifecycle `rest → pointer down → pressed → release inside / release outside / cancellation → settled`; activation, tastiera e ARIA restano native o Base UI. `pointerType` si usa solo per differenze interaction-specific provate e una penna non viene trattata automaticamente come touch.

Motion e first-class per hover/tap/cancel quando variants e lifecycle controllato migliorano davvero feedback, interruption o gesture. Non sostituisce l'activation e non trasforma il box che possiede la hit area: l'eventuale trasformazione appartiene a un child visuale. Reduced motion mantiene feedback immediato tramite colore, opacity o stato statico. `touch-action: none` non e una regola foundation e resta vietato globalmente; un futuro controllo pan/drag deve dichiarare l'asse di scroll che conserva e non bloccare pinch zoom senza necessita.

`useIsMobile` indica esclusivamente il breakpoint di layout responsive usato dalla Sidebar. Non descrive touch, hover o pointer capability e non deve governare interaction behavior. Gli overlay e le navigazioni fixed usano `dvh` e i token `--safe-area-*`, definiti con `env(safe-area-inset-*)`; i layout root delle app dichiarano `viewport-fit=cover`.

Il contratto completo e in `config/mobile-experience.json`. Verifica locale: `pnpm mobile:doctor` per audit deterministico e `pnpm mobile:test` per geometria, input, tastiera, orientation, zoom-equivalent e reduced motion nel browser reale.

## API pubblica

Il barrel root `@qoovex/ui` non esiste. I consumer importano esclusivamente subpath espliciti:

```ts
import { Button } from "@qoovex/ui/components/button";
import { ThemeProvider } from "@qoovex/ui/components/theme-provider";
import { useIsMobile } from "@qoovex/ui/hooks/use-mobile";
import { cn } from "@qoovex/ui/lib/utils";
```

Ogni app importa una sola volta:

```css
@import "@qoovex/ui/styles/base.css";
@source "../**/*.{ts,tsx}";
```

`Button` e riservato alle azioni. Link e navigazione usano `<a>` o `Link` reali, eventualmente con `buttonVariants` per l'aspetto.

## Confini

- nessun import da `apps/*`, `@qoovex/db`, Auth.js o tipi di dominio;
- nessun componente condiviso duplicato nelle app;
- CSS app-local ammesso solo per layout o composizioni specifiche;
- provenienza e licenze in `THIRD_PARTY_NOTICES.md`;
- il guardrail `pnpm --filter @qoovex/ui test` controlla package e consumer.
