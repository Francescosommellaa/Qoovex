# Design System Recovery — Audit e piano enterprise

Data audit: 20 giugno 2026  
Repository: `A:\Qoovex`  
Stato: piano operativo; nessun refactor incluso in questo documento.

## Executive summary

Qoovex possiede una direzione visiva riconoscibile e alcune buone regole di base — colori semantici, tre famiglie tipografiche, target minimo di 48 px, focus globale e reduced motion — ma non possiede ancora un design system enterprise. `packages/ui` contiene 36 export React concentrati in due file, 15 dei quali sono semplici alias dello stesso `OperationalPanel`. Sirio presenta 32 voci come componenti canonici, ma almeno due voci documentano primitive che non esistono e vari specimen non corrispondono al componente dichiarato.

La recovery deve mantenere `packages/ui` come fonte canonica web, usare token TypeScript platform-neutral come unica fonte e generare da essi le variabili CSS. L'adapter native futuro consumerà gli stessi token ma avrà rendering separato. La strategia scelta è una ripartenza netta: gli export deboli possono essere rimossi senza adapter di compatibilità, aggiornando Sirio nello stesso ciclo.

Evidenze principali:

- `/components` a viewport 390 px produce `scrollWidth: 918px` su `clientWidth: 375px`;
- il menu mobile lascia `<main>` nel tree accessibile e `body { overflow: visible }`;
- la voce “Sheet, Dialog e Popover” renderizza `ProductionCompletionSheet`;
- `apps/sirio/src/app/globals.css` contiene 104 classi, almeno 44 senza riferimento TS/TSX corrente;
- `packages/ui` ha 5 test complessivi e nessuna integrazione axe, pur avendo `axe-core` installato;
- type-check, lint, test correnti e repo guard passano: il problema è di architettura, completezza e qualità, non di compilazione.

---

## 1. Stato attuale

### 1.1 Superfici e responsabilità reali

| Area | Stato reale | Valutazione |
|---|---|---|
| `packages/ui/src/tokens.ts` | Token TypeScript platform-neutral | Buona intenzione, ma duplicato manualmente in CSS e incompleto |
| `packages/ui/styles/*` | Token, reset minimo e 14 righe minificate di stili componenti | Canonico ma non scalabile, difficile da revisionare e privo di molti stati |
| `packages/ui/src/web/primitives.tsx` | 9 primitive/form/feedback | API troppo semplici, ref e contratti accessibili incompleti |
| `packages/ui/src/web/product.tsx` | 27 export prodotto/layout | Mescola primitive, shell e composizioni di dominio; 15 export sono alias nominali |
| `apps/sirio` | Direzione visuale, catalogo e fixture | È il solo consumer UI reale, ma duplica stili e sovradichiara capacità |
| `apps/workspace` | Runtime API/auth; root UI restituisce `notFound()` | Nessuna shell prodotto da migrare oggi |
| `apps/web` | Placeholder marketing e pagine legali non stilizzate | Cinque inline style nella home; nessuna fondazione condivisa |
| `apps/mobile` | Scaffold documentale | Nessun runtime o adapter native da implementare in questa recovery |
| `packages/brand` | SVG canonici in `logo-Icon` | Da mantenere come package asset-only; nessun adapter React del logo |

### 1.2 Inventario CSS e utilizzo

- `tokens.css` espone 39 token `--qv-*` e 13 alias globali generici (`--ink`, `--panel`, ecc.).
- `base.css` copre box sizing, font inheritance, focus-visible, visually-hidden, numeri tabulari, reduced motion e forced colors.
- `components.css` concentra tutti i componenti su 18 righe fisiche; contiene colori, spacing, radius e font-size hardcoded.
- `globals.css` di Sirio è contemporaneamente shell editoriale, marketing page, catalogo, specimen legacy e override dei componenti condivisi.
- La classe package `sample-trace` dipende semanticamente dal CSS app-local di Sirio.
- Almeno 44 classi Sirio risultano senza riferimento corrente, tra cui `sample-overlay`, `sample-table` equivalenti legacy, `sample-form`, `sample-run-sheet`, `event-sheet`, `assistant-surface` e altre fixture precedenti.
- `apps/web/src/app/page.tsx` usa cinque oggetti `style` inline con colori e misure duplicati.

### 1.3 Stato di test e documentazione

- `packages/ui/src/web/components.test.tsx`: 3 casi, limitati a visibilità nav, label quantità e toggle task.
- `packages/ui/src/tokens.test.ts`: 2 casi, limitati a target minimo e distinzione di tre colori.
- Nessun test per Button, form, error association, focus, dialog, responsive, axe o contrasto.
- Il catalogo contiene descrizioni aspirazionali non collegate a test o manifest degli export.
- Il README definisce `@qoovex/ui/web` canonico, ma non documenta versioning, support matrix, API, varianti o deprecazioni.

---

## 2. Problemi principali ordinati per gravità

### P0 — Bloccanti

1. **Catalogo non affidabile.** “Sheet, Dialog e Popover” mostra un form di produzione; “Table e List adattiva” mostra una lista di Button. Sirio non può essere usato come fonte di verità o acceptance suite.
2. **Responsive rotto nel catalogo.** A 390 px la pagina raggiunge 918 px di larghezza. La combinazione di indice orizzontale, specimen e contenuti a larghezza intrinseca rende la pagina inutilizzabile senza pan laterale.
3. **Overlay non accessibili.** Il menu mobile usa `<dialog open>` invece di `showModal()`: niente inert, focus trap nativo, scroll lock o isolamento del contenuto. Anche l'assistente usa `role="dialog"` senza gestione focus.
4. **Input numerico funzionalmente incoerente.** `NumberField` non imposta `type="number"`, mentre `RuleEditor` legge `valueAsNumber`; per un input text il valore può essere `NaN`.
5. **Contratti form incompleti.** Gli errori non impostano `aria-invalid`, non sono collegati con `aria-describedby`, non hanno ID stabili e lo stile invalid copre solo `input`, non `select`/`textarea`.

### P1 — Architettura e riuso

6. **Componenti nominali senza anatomia.** Quindici export sono lo stesso pannello con un eyebrow diverso; aumentano API e catalogo senza fornire comportamento o riuso reale.
7. **Landmark annidati.** `AdaptiveAppShell` renderizza sempre `<main>` e viene montato dentro il `<main>` di Sirio.
8. **Confine package/app violato.** `CalculationTrace` include `sample-trace`, classe di documentazione appartenente a Sirio.
9. **Token duplicati.** `tokens.ts` e `tokens.css` sono mantenuti manualmente, senza generazione o drift check.
10. **CSS monolitico e ad alta entropia.** Spacing, radius, font-size, colori e z-index sono spesso valori letterali; lo stesso pattern viene riscritto in package e Sirio.
11. **API non conformi alle regole Qoovex.** Badge, Alert e diversi componenti non preservano props HTML, `className` e ref React 19. `IconButton` può perdere `qv-icon-button` se riceve `className` nello spread.

### P2 — Completezza e consistenza

12. Mancano primitive strutturali, form compound, overlay reali, loading/empty/error state e data display responsive.
13. Button ha solo tre varianti, nessuna size e nessuno stato loading; hover è definito solo sul primary e usa colore hardcoded.
14. Status e priorità dipendono spesso da colore e microtesto da 8–10 px; nel catalogo sono stati rilevati 120 elementi sotto 12 px.
15. Breakpoint hardcoded e discordanti: `47.999rem`, `760px`, `1100px`; non esiste un contratto responsive condiviso.
16. `components.css` usa selettori strutturali fragili (`nth-child(3n)`) che non seguono il passaggio da tre a due colonne.
17. Il package impone heading `h3` e larghezza massima 720 px attraverso `OperationalPanel`, impedendo una gerarchia semantica contestuale.

### P3 — Cleanup e debito

18. Sirio conserva almeno 44 classi legacy senza consumer corrente.
19. La home marketing è un placeholder con inline style; contact e legal non hanno layout o tipografia condivisa.
20. Alias globali come `--ink`, `--body` e `--data` aumentano collisioni e rendono meno chiara la provenienza dei token.

---

## 3. Componenti esistenti

Legenda qualità: **Bassa** = contratto non affidabile; **Parziale** = concetto valido ma non production-ready; **Buona base** = mantenibile dopo interventi circoscritti.

| Componente | Percorso | Categoria | Qualità | Varianti presenti / mancanti | Stati, riuso, responsive e accessibilità | Decisione |
|---|---|---|---|---|---|---|
| Button | `packages/ui/src/web/primitives.tsx` | Primitive/action | Parziale | primary, secondary, danger; mancano ghost, quiet/link, size, full-width | HTML props parziali; niente ref/loading; hover non completo; type implicito; riuso medio | **Refactor** |
| IconButton | `packages/ui/src/web/primitives.tsx` | Primitive/action | Bassa | eredita Button; manca size e shape | aria-label obbligatoria positiva; `className` può sovrascrivere la classe base; accetta children impropri; niente loading | **Replace** con API dedicata |
| TextField | `packages/ui/src/web/primitives.tsx` | Form | Bassa | default/hint/error nominali; mancano prefix/suffix | label implicita valida; error non associato; niente ref outer/control, required marker, disabled/read-only styling | **Replace** |
| NumberField | `packages/ui/src/web/primitives.tsx` | Form | Bassa | identico a TextField | non imposta `type=number`; unità/min/max/step assenti; rischio `NaN`; responsive neutro | **Replace prioritario** |
| TextAreaField | `packages/ui/src/web/primitives.tsx` | Form | Bassa | default/hint/error | non presente nel catalogo; invalid CSS non applicato; error association assente | **Replace** |
| SelectField | `packages/ui/src/web/primitives.tsx` | Form | Bassa | native select soltanto | invalid CSS non applicato; placeholder/empty state assenti; nessun ref composto | **Replace** |
| FieldFrame | `packages/ui/src/web/primitives.tsx` | Form/private | Bassa | hint oppure error | struttura rigida e non esportata; nessun ID/aria-describedby; non supporta legend/group | **Delete**, sostituire con Field compound |
| Badge | `packages/ui/src/web/primitives.tsx` | Feedback/data display | Parziale | neutral, ready, attention, critical | niente HTML props/className/ref/size; testo 9 px; nessuna gestione overflow/icona; riuso medio | **Improve** |
| InlineAlert | `packages/ui/src/web/primitives.tsx` | Feedback | Parziale | attention, critical | manca info/success, action, dismiss; `role=status` su contenuto statico può annunciare troppo; no props HTML | **Refactor** |
| StatusControl | `packages/ui/src/web/primitives.tsx` | Form/state | Bassa | booleano | usa `qv-team-row`, semantica e layout accoppiati; manca disabled/indeterminate; non è mostrato dal proprio specimen | **Replace** con Checkbox/Switch |
| OperationalPanel | `packages/ui/src/web/product.tsx` | Layout | Bassa | eyebrow/action/className | impone section, h3 e max-width 720; niente props HTML/ref; base di 15 alias vuoti | **Replace** con Surface/Card/SectionHeader |
| CalculationTrace | `packages/ui/src/web/product.tsx` | Data display/domain | Parziale | una sola modalità; catalogo promette compatta/estesa | classe `sample-trace` app-local; operatori con aria-label su `<i>`; layout mobile comprime ma non modella rounding/unità | **Refactor**, mantenere il concetto |
| QuantityStatus | `packages/ui/src/web/product.tsx` | Data display/domain | Parziale | theoretical/verified | markup non semantico; key su label; bordo `nth-child(3n)` errato a due colonne; manca empty/loading/critical | **Refactor** |
| CrewTaskCard | `packages/ui/src/web/product.tsx` | Product/task | Parziale | priorità alta/media/bassa; done | solo alta ha tono distinto; manca due/in-progress/blocked/loading/disabled; h3 fisso; buona base concettuale | **Refactor prioritario** |
| FreeTextEventIntake | `packages/ui/src/web/product.tsx` | Product/intake | Parziale | submitLabel/status | manca processing, error, disabled, character guidance e example; status vuoto sempre montato; layout rigido | **Refactor prioritario** |
| RuleEditor | `packages/ui/src/web/product.tsx` | Product/forms | Bassa | margine 10/15 hardcoded | NumberField errato; nessuna unità, rounding, formula preview, validation o pending state | **Replace prioritario** |
| SupportSessionBanner | `packages/ui/src/web/product.tsx` | Product/access | Parziale | una sola | sticky valido ma niente countdown semantico, expiry/ending/error; mobile impila senza policy; azione non modellata | **Refactor** |
| TeamAccessPanel | `packages/ui/src/web/product.tsx` | Product/access | Parziale | canRevoke callback | nessun empty/loading/error/confirm; ruoli raw; layout mobile fragile; autorizzazione deve restare server-derived | **Refactor** |
| InvitationComposer | `packages/ui/src/web/product.tsx` | Product/access | Parziale | tre ruoli | manca pending/success/error, expiry, permission help; cast del ruolo non validato | **Refactor** |
| SupportAccessPanel | `packages/ui/src/web/product.tsx` | Product/access | Bassa | nessuna | catalogo promette MFA ma UI non lo contiene; motivo dovrebbe supportare testo lungo; required/error/loading assenti | **Replace** |
| AdaptiveAppShell | `packages/ui/src/web/product.tsx` | Navigation/layout | Bassa | filtro visible/current | crea `<main>` annidato; nessuna sidebar/mobile nav; anchor raw; client visibility non è autorizzazione | **Replace** con AppShell |
| OperationalAssistantLauncher | `packages/ui/src/web/product.tsx` | Assistant/action | Parziale | solo Button esteso | catalogo promette icona/shortcut; manca expanded/controls/unread; buona composizione potenziale | **Improve** |
| AssistantPanel | `packages/ui/src/web/product.tsx` | Assistant/overlay | Bassa | eredita OperationalPanel | non è panel assistente né overlay; nessun focus management, history o streaming state | **Delete current**, ricreare dopo Dialog/Drawer |
| ExtractionReview | `packages/ui/src/web/product.tsx` | Product/intake | Bassa | eyebrow soltanto | nessun modello confirmed/uncertain/missing, editing o state announcement | **Delete current**, ricreare composizione reale |
| MissingDataPrompt | `packages/ui/src/web/product.tsx` | Product/intake | Bassa | eyebrow soltanto | nessun field linkage, consequence o focus behavior | **Delete current**, ricreare composizione reale |
| RuleLibrary | `packages/ui/src/web/product.tsx` | Product/rules | Bassa | eyebrow soltanto | nessuna ricerca, lista, versione, empty/loading o keyboard model | **Delete current**, ricreare composizione reale |
| PreServiceDashboard | `packages/ui/src/web/product.tsx` | Product/dashboard | Bassa | eyebrow soltanto | nessun layout dashboard, horizon o responsive contract | **Delete current**, ricreare composizione reale |
| KitchenBriefing | `packages/ui/src/web/product.tsx` | Product/briefing | Bassa | eyebrow soltanto | nessuna anatomia, stampa, stati o data contract | **Delete current**, ricreare composizione reale |
| ServiceBriefing | `packages/ui/src/web/product.tsx` | Product/briefing | Bassa | eyebrow soltanto | identico a KitchenBriefing; nessuna semantica sala | **Delete current**, ricreare composizione reale |
| CriticalIssues | `packages/ui/src/web/product.tsx` | Product/feedback | Bassa | eyebrow soltanto | nessun ordinamento/severità/action/empty state | **Delete current**, ricreare composizione reale |
| FutureEventPlanner | `packages/ui/src/web/product.tsx` | Product/planning | Bassa | eyebrow soltanto | nessuna timeline/calendar/list mode o keyboard alternative | **Delete current**, ricreare composizione reale |
| PreparationPlan | `packages/ui/src/web/product.tsx` | Product/production | Bassa | eyebrow soltanto | nessun grouping, owner, batch action o stato | **Delete current**, ricreare composizione reale |
| PreparationProposal | `packages/ui/src/web/product.tsx` | Product/production | Bassa | eyebrow soltanto | nessun contratto per requested/rule/consequence/status | **Delete current**, ricreare composizione reale |
| ChefApprovalPanel | `packages/ui/src/web/product.tsx` | Product/approval | Bassa | eyebrow soltanto | nessun decision model, confirmation, validation o audit cue | **Delete current**, ricreare composizione reale |
| PhysicalVerification | `packages/ui/src/web/product.tsx` | Product/verification | Bassa | eyebrow soltanto | nessuna separazione strutturale theoretical/physical, author/time/delta | **Delete current**, ricreare composizione reale |
| ProductionCompletionSheet | `packages/ui/src/web/product.tsx` | Product/production | Bassa | eyebrow soltanto | non è uno sheet; viene usato falsamente come overlay; manca modal behavior | **Delete current**, ricreare dopo Drawer/Dialog |
| MinimalServiceReference | `packages/ui/src/web/product.tsx` | Product/service | Bassa | eyebrow soltanto | nessun contratto high-contrast/always-on/read-only; solo panel nominale | **Delete current**, ricreare composizione reale |
| Asset logo Qoovex | `packages/brand/logo-Icon/*.svg` | Brand asset | Buona base | nero/bianco, trasparente, sfondo pieno/quadrato/arrotondato | non va wrappato in adapter React; scegliere la variante SVG reale in base al contesto | **Keep**, package asset-only |
| SirioShell | `apps/sirio/src/app/sirio-shell.tsx` | Navigation/layout | Parziale | desktop/mobile | skip link e focus restore presenti; dialog non modale, niente inert/scroll lock/focus trap | **Refactor prioritario** |
| ComponentCatalog | `apps/sirio/src/app/components/component-catalog.tsx` | Documentation/workbench | Bassa | filter e viewport simulator | 32 voci non allineate agli export; pagina 31k px; overflow mobile; specimen falsi; un unico enorme conditional | **Replace** |
| DirectionPage | `apps/sirio/src/app/page.tsx` | Marketing/documentation | Parziale | responsive app-local | sezioni inline, classi duplicate e CTA raw; buona direzione visiva, scarso riuso | **Refactor dopo foundations** |
| Web RootPage | `apps/web/src/app/page.tsx` | Marketing | Bassa | nessuna | cinque inline style, token duplicati, nessuna responsive system API | **Replace con composizioni app-local** |
| ContactPage | `apps/web/src/app/contact/page.tsx` | Marketing/content | Bassa | nessuna | semantica minima corretta, nessun Container/typography/layout | **Refactor** |
| LegalPage | `apps/web/src/app/legal/page.tsx` | Marketing/content | Bassa | nessuna | struttura semantica di base, nessun reading layout o token | **Refactor** |
| LegalDocumentPage | `apps/web/src/app/legal/[document]/page.tsx` | Marketing/content | Parziale | contenuto dinamico | heading corretti, ma mancano prose styles, container, focus/reading width | **Refactor** |

### 3.1 Componenti dichiarati ma non esistenti

| Dichiarazione Sirio | Rendering corrente | Decisione |
|---|---|---|
| Sheet, Dialog e Popover | `ProductionCompletionSheet`, cioè un OperationalPanel con form | Rimuovere la voce finché Dialog/Drawer/Popover reali non esistono |
| Table e List adattiva | `OperationalPanel` + lista di Button | Rimuovere la voce; implementare Table/List con semantica e responsive contract |
| StatusControl | `CrewTaskCard` a causa della condizione `crew-task || status` | Correggere catalogo; sostituire StatusControl con Checkbox/Switch |
| Badge e InlineAlert | Wrapper `CriticalIssues` con due alert | Documentare separatamente primitive e composizione |
| TextField e NumberField | Intero `RuleEditor` | Creare specimen atomici per ogni control e stato |

---

## 4. Componenti mancanti

| Componente | Categoria | Priorità | Motivo | Dipendenze |
|---|---|---:|---|---|
| Text | Primitive | Subito | Tipografia semantica e consistente | type tokens |
| Heading | Primitive | Subito | Evitare h3 hardcoded e mantenere hierarchy | Text, type tokens |
| Divider | Primitive | Subito | Sostituire border ripetuti | color/border tokens |
| Surface | Layout | Subito | Fondazione neutra per pannelli | color, radius, shadow |
| Card | Data display/layout | Subito | Anatomia header/body/footer riusabile | Surface |
| Container | Layout | Subito | Page width/gutter responsive | layout/breakpoint tokens |
| Section | Layout | Subito | Spaziatura verticale coerente | Container, spacing |
| Stack | Layout | Subito | Eliminare grid/flex ripetuti | spacing tokens |
| Grid | Layout | Subito | Layout responsive dichiarativo | spacing/breakpoints |
| Label | Form | Subito | Contratto label persistente | type tokens |
| Field | Form | Subito | ID, description, error e required centralizzati | Label |
| FieldError | Form | Subito | aria-describedby/live policy coerente | Field |
| Input | Form | Subito | Controllo base con ref e states | Field, control tokens |
| Textarea | Form | Subito | Intake e motivi supporto | Field, Input styles |
| Select | Form | Subito | Ruoli/margini/owner | Field, control tokens |
| Checkbox | Form | Subito | Sostituire StatusControl | Field, control tokens |
| SearchInput | Form | Subito | Catalogo e future rule library | Input, IconButton |
| Alert | Feedback | Subito | Success/info/warning/error persistenti | semantic colors |
| Spinner | Feedback | Subito | Pending breve e action loading | motion tokens |
| Skeleton | Feedback | Subito | Loading strutturale | Surface, reduced motion |
| EmptyState | Feedback | Subito | Liste e dashboard senza dati | Heading, Text, Button |
| ErrorState | Feedback | Subito | Errori recuperabili di pagina/panel | Alert, Button |
| LoadingState | Feedback | Subito | Pattern consistente di caricamento | Spinner/Skeleton |
| Progress | Feedback | Subito | Intake e preparazione | semantic colors, reduced motion |
| AppShell | Navigation/layout | Subito | Workspace responsive senza main annidato | Container, MobileNav |
| PageHeader | Layout | Subito | Titolo, meta e azioni coerenti | Heading, Stack |
| SectionHeader | Layout | Subito | Sostituire header OperationalPanel | Heading, Text |
| Toolbar | Navigation/layout | Subito | Filtri e azioni responsive | Button, SearchInput |
| MobileNav | Navigation | Subito | Correggere menu Sirio e futuro workspace | Dialog/Drawer |
| Dialog/Modal | Overlay | Subito | Assistant, conferme e focus management | Portal/focus primitive |
| Drawer | Overlay | Subito | Assistant e completion sheet su phone | Dialog foundation |
| List | Data display | Subito | Regole, eventi, preparazioni | Text, Stack |
| Table responsive | Data display | Subito | Dati densi desktop con alternativa phone | List, breakpoint tokens |
| MetricCard | Data display | Subito | Quantità operative | Card, numeric typography |
| TaskItem | Product/data display | Subito | Base riusabile per CrewTaskCard | Checkbox/Button, Badge |
| Radio | Form | Presto | Scelte esclusive future | Field, control tokens |
| Switch | Form | Presto | Preferenze binarie, non task completion | Field, control tokens |
| Tooltip | Feedback/overlay | Presto | Icon action e spiegazioni brevi | Popover positioning |
| Toast | Feedback/overlay | Presto | Esito azioni non bloccante | live-region policy |
| Sidebar | Navigation | Presto | Workspace desktop | AppShell |
| Tabs | Navigation | Presto | Viste correlate | roving tabindex |
| Breadcrumb | Navigation | Presto | Gerarchie workspace | Link/Text |
| Stepper | Navigation/feedback | Presto | Intake e setup multi-step | Progress, navigation |
| Dropdown | Overlay | Presto | Azioni contestuali | Popover/menu semantics |
| Popover | Overlay | Presto | Contenuto contestuale non modale | positioning/focus |
| StatCard | Data display | Presto | KPI direzionali | MetricCard |
| Timeline | Data display | Presto | Eventi e Calculation Trace estesa | List |
| ActivityItem | Data display | Presto | Audit e attività | List, Avatar opzionale |
| UserCard | Data display | Presto | Team access | Card, Badge, Avatar opzionale |
| WorkspacePanel | Product | Presto | Composizione app shell | Surface, SectionHeader |
| ActionPanel | Product | Presto | Decisioni chef/supporto | Card, form, Alert |
| NotificationItem | Product | Presto | Notifiche pertinenti per ruolo | List, Badge |
| HeroSection | Marketing | Presto, quando riparte web | Home marketing coerente | Container, Heading, Button |
| FeatureCard | Marketing | Presto, quando riparte web | Feature presentation | Card |
| FeatureGrid | Marketing | Presto, quando riparte web | Layout feature responsive | Grid, FeatureCard |
| CTASection | Marketing | Presto, quando riparte web | Conversion section | Section, Button |
| Avatar | Data display | Opzionale/presto | Serve quando account UI usa avatar reale | image handling/fallback |
| Pagination | Navigation | Opzionale | Nessun dataset paginato corrente | Button, List/Table |
| CommandMenu | Overlay/navigation | Inutile per ora | Nessun set di command globali stabile | Dialog, SearchInput |
| CommandBar | Product/navigation | Inutile per ora | Stesso limite del CommandMenu | CommandMenu |
| PricingCard | Marketing | Bloccato | Nessuna decisione pricing autorizzata | pricing/product decision |
| FAQItem | Marketing | Opzionale app-local | Crearlo solo con contenuto reale | disclosure primitive |
| TestimonialCard | Marketing | Inutile per ora | Nessuna testimonianza reale | Card |
| ProductPreview | Marketing | Inutile per ora | Prodotto ancora fixture/API-only | media/demo strategy |
| DemoPanel | Marketing/docs | Inutile come public API | Sirio può comporre specimen locali | Surface/Card |

---

## 5. Token audit

### 5.1 Modello target

La gerarchia deve essere: **primitive/brand → semantic → component**. `src/tokens` è la fonte unica platform-neutral; `styles/tokens.css` viene generato e committato per i consumer CSS, con controllo CI che fallisce in caso di drift. I token web non devono essere dedotti dalle utility Tailwind e il futuro native adapter non deve dipendere dal CSS.

### 5.2 Audit per dominio

| Dominio | Stato attuale | Problema | Target |
|---|---|---|---|
| Colori | 11 colori principali | mancano foreground/on-color, hover/pressed/subtle, disabled, overlay/scrim; sfondi status hardcoded | palette primitive + semantic surface/text/border/action/status |
| Typography | 3 famiglie | nessuna scale type, line-height, weight o tracking; molti 8–11 px | ruoli display/title/body/label/caption/data con minimi leggibili |
| Spacing | scala 4–48 incompleta | valori 6, 9, 10, 14, 15, 18, 22, 28, 30, 32 ricorrenti hardcoded | scala coerente 4-based con eccezioni dichiarate |
| Radius | xs 3, sm 7, md 10, lg 14, full | Sirio usa 2, 4, 5, 6, 8, 9, 12, 18, 99 | scala razionalizzata e semantic control/card/overlay |
| Shadow | low/high | ombre hardcoded aggiuntive; nessun focus/elevation model | elevation 0–3 + focus ring + overlay |
| Blur | assente | backdrop blur 14/16 hardcoded | token backdrop-sm/md, solo se supportato |
| Motion | fast 140, normal 200 | nessun easing, slow, enter/exit; transizioni generiche | duration + easing + pattern; reduced motion obbligatorio |
| Z-index | sticky 30, overlay 50, toast 80 | Sirio usa 20/30/50/100 raw | scala layer documentata: base/sticky/nav/overlay/toast/skip-link |
| Breakpoint | assenti | 47.999rem, 760 e 1100 incoerenti | phone/tablet/desktop condivisi e testati |
| Layout | pageMax, readingMax | gutter e panel width hardcoded | container widths, gutters e reading measure |
| Target | 48 px | alcune azioni Sirio sono 40/44/46 px | mantenere 48 px per Qoovex, inclusi icon button |
| Opacity | assente | disabled `.48`, borders alpha e overlays raw | disabled/subtle/scrim tokens |

### 5.3 Regole token

- Nessun colore letterale fuori dai file token, eccetto asset brand approvati.
- Nessun alias globale non prefissato; rimuovere `--ink`, `--panel`, `--body` e simili.
- I component token devono referenziare semantic token, mai palette raw.
- Contrast gate: 4.5:1 testo normale, 3:1 testo grande e component boundaries/focus.
- Le tre font restano: Barlow Condensed per titoli operativi, Source Sans 3 per testo, IBM Plex Mono per dati; il fallback deve essere definito in un solo posto.

---

## 6. Base CSS audit

### Da mantenere

- box sizing globale;
- font inheritance sui controlli;
- focus-visible globale ad alto contrasto;
- utility visually-hidden;
- numeri tabulari;
- reduced motion e forced colors.

### Da correggere o aggiungere

| Area | Intervento richiesto |
|---|---|
| Reset | margin coerenti, media responsive, img/svg display, list/button/form normalization controllata |
| `html`/`body` | min-height, background e foreground su body, text rendering, overflow policy, color-scheme esplicito |
| Tipografia | default per heading, paragraph, small, code, strong; evitare scale implicite browser |
| Focus | ring semantic token; scroll-margin per sticky header; non rimuovere outline localmente |
| Selection | colori `::selection` con contrasto verificato |
| Reduced motion | una sola policy canonica; eliminare duplicato Sirio |
| Button reset | border/background/appearance controllati; cursor solo se enabled |
| Input reset | appearance, placeholder, disabled/read-only, autofill, invalid e forced-colors |
| Scrollbar | solo utility opt-in; non imporre skin globale senza necessità |
| Accessibilità | `[hidden]`, visually-hidden completo, skip-link primitive/app pattern, target size |
| Responsive | gutter e font fluidi tramite token; nessuna regola che nasconda contenuto essenziale |
| Print | briefing e legal devono avere una base stampabile minima |

`base.css` non deve contenere stili di componente. `utilities.css` deve restare piccolo e documentato: visually-hidden, numeric, truncate/wrap-safe, focus target e layout helpers realmente trasversali.

---

## 7. Nuova architettura proposta

```text
packages/ui/
  src/
    tokens/
      definitions.ts
      index.ts
    web/
      primitives/
      forms/
      feedback/
      navigation/
      overlays/
      data-display/
      layout/
      product/
      index.ts
  styles/
    tokens.css              # generato dai token TS
    base.css
    utilities.css
    components/
      primitives.css
      forms.css
      feedback.css
      navigation.css
      overlays.css
      data-display.css
      layout.css
      product.css
    index.css
```

### Responsabilità

- **tokens:** valori senza dipendenze React/DOM; consumabili dal futuro adapter native.
- **primitives:** Text, Heading, Button, IconButton, Divider e primitive senza dominio.
- **forms:** Field compound e controlli nativi accessibili.
- **feedback:** feedback persistente, asincrono e transient.
- **navigation:** pattern di navigazione, senza autorizzazione client-side come fonte di verità.
- **overlays:** portal, focus management, inert e dismiss policy.
- **data-display:** dati generici; nessuna conoscenza Event Operations.
- **layout:** Container, Stack, Grid, Surface, Card e shell strutturali.
- **product:** solo componenti Qoovex con anatomia reale e riuso dimostrato tra Sirio e workspace.

Sirio conserva fixture, catalog metadata, chrome editoriale e test visuali. `apps/web` conserva i componenti marketing app-local finché non emerge un secondo consumer. Le app non si importano tra loro.

### Public API

- `@qoovex/ui`: token platform-neutral.
- `@qoovex/ui/tokens.css`: variabili generate.
- `@qoovex/ui/styles.css`: token + base + utilities + component styles.
- `@qoovex/ui/web`: export React DOM espliciti e minimali.
- Ogni componente pubblico preserva props HTML appropriate, `className` e ref React 19.
- Nessuna API React Native viene dedotta dalle props DOM.

---

## 8. Piano di lavoro per fasi

### Fase 0 — Baseline e catalog truth

- Congelare export e consumer correnti.
- Rimuovere dal catalogo le capacità non implementate.
- Definire manifest di componenti/stati usato sia dal catalogo sia dai test.
- Acquisire screenshot baseline 390/768/1440.

### Fase 1 — Foundation

- Rendere i token TS fonte unica e generare CSS.
- Introdurre semantic token completi e drift test.
- Riscrivere `base.css`; aggiungere `utilities.css`.
- Separare CSS per categoria e rimuovere alias globali.

### Fase 2 — Primitive e layout

- Implementare Text, Heading, Divider, Surface, Card, Container, Section, Stack e Grid.
- Rifare Button/IconButton con size, variant e loading.
- Sostituire OperationalPanel con composizioni layout.

### Fase 3 — Forms

- Implementare Field, Label, FieldError e description linkage.
- Implementare Input, NumberInput, Textarea, Select, Checkbox e SearchInput.
- Migrare RuleEditor e form access/supporto; validare NaN, required e async state.

### Fase 4 — Feedback

- Alert, Spinner, Skeleton, EmptyState, ErrorState, LoadingState e Progress.
- Separare live-region transient da contenuto persistente.
- Aggiungere Toast solo dopo una policy di durata/dismiss.

### Fase 5 — Overlay

- Implementare Dialog e Drawer con focus trap, restore, inert, Escape e scroll lock.
- Migrare menu Sirio e AssistantPanel.
- Aggiungere Dropdown/Popover successivamente.

### Fase 6 — Navigation

- Implementare AppShell, MobileNav, Toolbar e Page/SectionHeader.
- Aggiungere Sidebar/Tabs/Breadcrumb/Stepper quando richiesti dai flussi.
- Eliminare `<main>` annidati e client-side permission theater.

### Fase 7 — Data display

- List e Table responsive con equivalente lineare phone.
- MetricCard e TaskItem.
- Rifare QuantityStatus e CalculationTrace con markup e responsive contract reali.

### Fase 8 — Product

- Rifare CrewTaskCard, FreeTextEventIntake e RuleEditor.
- Ricreare una composizione di dominio solo quando possiede props, stati e test propri.
- Mantenere distinto richiesto/approvato/prodotto/assegnato/teorico/verificato.

### Fase 9 — Marketing

- Migrare il placeholder web a Container/Section/Heading/Button.
- Creare HeroSection, FeatureCard/Grid e CTA solo in `apps/web`.
- Non creare PricingCard senza decisione pricing.

### Fase 10 — Refactor pagine e cleanup

- Migrare Sirio, poi workspace quando acquisirà UI, infine web/legal.
- Eliminare wrapper nominali, classi legacy, inline style e CSS duplicato.
- Spezzare `ComponentCatalog` in catalog shell, controls, specimen e metadata.

### Fase 11 — QA finale

- Unit, interaction, axe e visual regression.
- Keyboard, screen reader, 200% zoom, forced colors e reduced motion.
- Viewport 390, 768, 1024 e 1440; nessun overflow non intenzionale.
- Build, lint, type-check, repo guard e audit dipendenze.

---

## 9. Criteri qualità per ogni componente

Un componente può essere marcato Approved solo se tutti i criteri applicabili sono soddisfatti.

### API e composizione

- [ ] Ha una responsabilità singola e un'anatomia documentata.
- [ ] Preserva props HTML, `className` e ref React 19.
- [ ] Non espone props legate a un singolo specimen.
- [ ] Non duplica un componente esistente; composition-first verificata.
- [ ] Non importa CSS o fixture da un'app.
- [ ] Usa solo Phosphor per le icone e `@qoovex/brand` per il logo.

### Visual e token

- [ ] Nessun colore, spacing, radius, shadow, motion o z-index hardcoded.
- [ ] Tipografia legata a ruoli token, non a misure casuali.
- [ ] Varianti e size formano una matrice limitata e coerente.
- [ ] Hover, active, focus-visible e disabled sono distinti e contrastati.
- [ ] Loading non causa layout shift e impedisce submit duplicati quando necessario.

### Accessibilità

- [ ] Nome, ruolo e stato accessibili sono corretti.
- [ ] Tutte le azioni funzionano da tastiera senza trap.
- [ ] Target interattivo Qoovex minimo 48×48 px.
- [ ] Focus non è nascosto da sticky surface.
- [ ] Errori sono collegati al controllo e annunciati una sola volta.
- [ ] Lo stato non dipende solo dal colore.
- [ ] Supporta zoom 200%, forced colors e reduced motion.

### Responsive e contenuto

- [ ] Nessun overflow a 390, 768 e 1440 px, salvo regioni scroll dichiarate.
- [ ] Testo lungo, traduzione, valori numerici estremi e contenuto vuoto non rompono il layout.
- [ ] Phone concentra, tablet coordina, desktop confronta senza cambiare semantica.
- [ ] Le informazioni essenziali non vengono nascoste su mobile.

### Test e documentazione

- [ ] Unit test per variant/state logic.
- [ ] Interaction test per keyboard e state transition.
- [ ] axe test senza violazioni.
- [ ] Specimen Sirio per stati reali, non aspirazionali.
- [ ] Visual baseline per almeno phone e desktop.
- [ ] Public API, dipendenze, limiti e decisione Approved documentati.

---

## 10. Rischi

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Breaking export durante ripartenza netta | Sirio non compila temporaneamente | migrare package e Sirio nello stesso changeset; nessun adapter legacy |
| Regressioni da CSS globale | selector leakage e differenze visuali | CSS layers, component namespace, screenshot baseline e migrazione per slice |
| Drift token TS/CSS | web e futuro native divergono | generazione deterministica + CI drift test |
| Catalogo torna aspirazionale | falsa sicurezza | manifest derivato dagli export e specimen richiesto prima della voce |
| Overlay regressivi | keyboard trap o background accessibile | primitive centralizzata, axe e test focus/escape/restore |
| Responsive regressivo | overflow o perdita di dati | matrice 390/768/1024/1440 e long-content fixtures |
| Componenti di dominio troppo generici | API grandi e poco riusabili | primitive prima, composizioni solo con secondo uso o forte semantica Qoovex |
| Autorizzazione confusa con visibilità | dati esposti lato client | mantenere default deny e permessi server-side; UI solo proiezione |
| Scope creep prodotto | introduzione Event backend, pricing o KDS | rispettare decisioni Brain; questa recovery è esclusivamente UI |
| Mobile premature abstraction | API web imposte al native | token condivisi, adapter native separato, nessuna prop DOM nel core |

---

## 11. Ordine preciso di implementazione

1. Salvare baseline export, import e screenshot correnti.
2. Correggere il catalog metadata eliminando Sheet/Popover/Table/Status falsi.
3. Creare il manifest verificabile di componenti e stati.
4. Spostare i token in `src/tokens/definitions.ts` come fonte unica.
5. Implementare generazione di `tokens.css` e drift test.
6. Completare color, typography, spacing, radius, shadow, blur, motion, z-index, breakpoint e layout token.
7. Riscrivere `base.css` e creare `utilities.css`.
8. Suddividere `components.css` per categoria senza cambiare ancora rendering.
9. Implementare Text, Heading, Divider, Surface, Card, Container, Section, Stack e Grid.
10. Rifare Button e IconButton; migrare tutte le azioni Sirio raw.
11. Implementare Field, Label, FieldError, Input, NumberInput, Textarea, Select e Checkbox.
12. Migrare RuleEditor; aggiungere validation e test contro `NaN`.
13. Migrare InvitationComposer, SupportAccessPanel e FreeTextEventIntake.
14. Implementare Alert, Spinner, Skeleton, Empty/Error/LoadingState e Progress.
15. Implementare Dialog e Drawer con test focus completi.
16. Migrare menu Sirio e AssistantPanel; eliminare i dialog simulati.
17. Implementare AppShell, MobileNav, Toolbar, PageHeader e SectionHeader.
18. Sostituire AdaptiveAppShell ed eliminare il `<main>` annidato.
19. Implementare List, Table responsive, MetricCard e TaskItem.
20. Rifare CalculationTrace, QuantityStatus e CrewTaskCard.
21. Eliminare i 15 alias OperationalPanel; ricreare solo composizioni supportate da requisiti e test.
22. Ricostruire ComponentCatalog da manifest, con pagine/specimen più piccoli e truthful.
23. Correggere overflow Sirio e verificare 390/768/1024/1440.
24. Migrare DirectionPage e rimuovere le 44+ classi legacy.
25. Migrare `apps/web` rimuovendo tutti gli inline style; applicare layout legal/contact.
26. Eseguire unit, interaction, axe, keyboard, zoom, forced colors, reduced motion e visual regression.
27. Eseguire `pnpm check` completo e documentare gli eventuali debiti residui.
28. Marcare Approved solo i componenti che superano integralmente il quality gate.

## Assunzioni vincolanti

- La recovery non implementa backend Event, AI, sync o runtime Expo.
- Workspace rimane API-only finché una decisione successiva non introduce il prodotto UI reale.
- Nessun pricing, CRM, POS, KDS, payroll, HACCP completo o magazzino contabile viene dedotto.
- Il sistema propone; lo chef decide. Gli stati quantitativi restano distinti.
- Il solo consumer UI reale corrente è Sirio, quindi la ripartenza netta è accettabile.
- CSS canonico per il web; token platform-neutral per web e futuro native.
- Marketing components rimangono app-local finché non esiste un riuso reale.
