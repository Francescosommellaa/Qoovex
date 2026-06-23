export const preparationFixture = {
  event: 'Comunione Rossi',
  date: 'Domani · 12:30',
  children: 22,
  item: 'Cotolette bambini',
  rule: '1 cotoletta per bambino + 10% margine',
  formula: '22 × 1,10 = 24,2 → 25',
  required: 25,
  approved: 35,
  produced: 38,
  assigned: 35,
  theoretical: 3,
  verified: null,
  location: 'Frigo 2'
} as const;

export const futureEvents = [
  ['Oggi', 'Matrimonio Russo', '198 ospiti', '2 criticità'],
  ['Domani', 'Comunione Rossi', '22 bambini', '3 preparazioni'],
  ['Domani', 'Comunione Crespi', '14 bambini', '1 dato mancante'],
  ['Lun 29', 'Battesimo De Luca', '65 ospiti', 'Regole complete']
] as const;

export type CatalogGroup =
  | 'Accessi'
  | 'Intake'
  | 'Regole'
  | 'Produzione'
  | 'Assistente'
  | 'Primitive'
  | 'Forms'
  | 'Feedback'
  | 'Overlay'
  | 'Navigation'
  | 'Layout'
  | 'Data display'
  | 'Marketing';

export interface CatalogItem {
  id: string;
  name: string;
  group: CatalogGroup;
  purpose: string;
  anatomy: string;
  variants: string;
  accessibility: string;
}

const items: Array<[string, string, CatalogGroup, string, string, string, string]> = [
  ['button', 'Button', 'Primitive', 'Avvia azioni con gerarchia e stati coerenti.', 'Label, icone opzionali, superficie, stato', '6 varianti · 3 size · Loading · Disabled', 'Target minimo 48 px, focus visibile e stato busy annunciato.'],
  ['icon-button', 'IconButton', 'Primitive', 'Espone azioni compatte senza perdere il nome accessibile.', 'Icona, superficie, nome accessibile', '6 varianti · 3 size · Loading', 'aria-label obbligatoria e target minimo 48 px.'],
  ['typography', 'Text e Heading', 'Primitive', 'Separa semantica HTML e gerarchia tipografica.', 'Elemento, size, weight, tone', 'Body · Label · Data · Display · Heading', 'Heading level e stile visivo restano indipendenti.'],
  ['badge', 'Badge', 'Primitive', 'Comunica stato o metadato persistente in forma compatta.', 'Label, tone, size', 'Neutral · Accent · Success · Warning · Danger · Info', 'Lo stato mantiene sempre una label testuale.'],
  ['tag', 'Tag', 'Primitive', 'Etichetta categorie senza simulare un controllo interattivo.', 'Icona opzionale, label, tone', '6 tone · 2 size', 'Elemento non interattivo e leggibile senza dipendere dal colore.'],
  ['surfaces', 'Surface e Card', 'Primitive', 'Fornisce superfici componibili senza card ad hoc.', 'Surface, padding, radius, elevation, stato', 'Default · Subtle · Elevated · Glass · Selected', 'Interactive reagisce a hover e focus-within.'],
  ['layout-primitives', 'Container, Section, Stack e Grid', 'Primitive', 'Riduce layout e spacing improvvisati.', 'Width, section spacing, gap, direzione, colonne', 'Phone · Tablet · Desktop', 'Ordine DOM invariato durante gli adattamenti responsive.'],
  ['divider-avatar', 'Divider e Avatar', 'Primitive', 'Separa contenuti e rappresenta persone con fallback robusti.', 'Orientamento, tone, immagine o iniziali', 'Divider 2 orientamenti · Avatar 3 size', 'Separator espone orientamento; Avatar ha nome o modalità decorativa.'],

  ['field', 'Field, Label e messaggi', 'Forms', 'Collega controllo, istruzioni ed errore con un contratto unico.', 'Label, controllo, hint, errore, indicatori', 'Stacked · Choice · Required · Invalid', 'ID e descrizioni vengono associati automaticamente.'],
  ['input', 'Input', 'Forms', 'Raccoglie testo e dati brevi con icone decorative opzionali.', 'Start icon, controllo, end icon', '3 size · Default · Error · Disabled', 'Props HTML, ref e focus-visible restano sul controllo nativo.'],
  ['number-input', 'NumberInput', 'Forms', 'Raccoglie quantità senza propagare NaN ai consumer.', 'Label, controllo numerico, hint', 'Vuoto · Valido · Required', 'Il valore vuoto produce null e mantiene type number.'],
  ['textarea', 'Textarea', 'Forms', 'Raccoglie descrizioni estese con altezza e resize controllati.', 'Label, area testo, hint', '3 size · Vertical resize · Fixed', 'Label persistente e descrizione associata.'],
  ['select', 'Select', 'Forms', 'Mantiene la selezione nativa coerente con gli altri controlli.', 'Label, select nativo, opzioni', 'Placeholder · Selected · Disabled', 'Tastiera e semantica native non vengono sostituite.'],
  ['checkbox', 'Checkbox', 'Forms', 'Gestisce scelte indipendenti con target mobile leggibile.', 'Controllo, label, descrizione', 'Checked · Unchecked · Disabled · Error', 'Label cliccabile e attivazione nativa con Space.'],
  ['radio', 'Radio', 'Forms', 'Gestisce scelte esclusive usando name e navigazione nativa.', 'Gruppo, opzione, label', 'Selected · Unselected · Disabled', 'Frecce e selezione seguono il comportamento HTML nativo.'],
  ['switch', 'Switch', 'Forms', 'Gestisce preferenze binarie.', 'Track, stato, label, descrizione', 'On · Off · Disabled', 'Checkbox nativa con role switch e stato annunciato.'],
  ['search-input', 'SearchInput', 'Forms', 'Compone Input, ricerca e cancellazione.', 'Search icon, input, clear action', 'Vuoto · Compilato', 'Nome accessibile obbligatorio e clear action nominata.'],

  ['alert', 'Alert', 'Feedback', 'Comunica stati persistenti senza annunciare automaticamente contenuto statico.', 'Tone, icona, titolo, descrizione, azione, dismiss', 'Neutral · Info · Success · Warning · Danger', 'Live region esplicita: off, polite o assertive.'],
  ['toast', 'Toast', 'Feedback', 'Conferma esiti transitori senza sottrarre il focus.', 'Titolo, descrizione, dismiss, viewport', 'Info · Success · Warning · Danger · Loading', 'Durata controllata, pausa hover/focus e chiusura disponibile.'],
  ['tooltip', 'Tooltip', 'Feedback', 'Spiega controlli compatti su hover e focus.', 'Trigger, contenuto, freccia', '4 lati · 3 allineamenti', 'Nome del trigger persistente; Escape chiude.'],
  ['loading', 'Spinner, Skeleton e LoadingState', 'Feedback', 'Rende espliciti attese brevi e caricamenti strutturali.', 'Indicatore, label, placeholder', 'Spinner · Skeleton · Reduced motion', 'Lo stato possiede una label; gli skeleton sono decorativi.'],
  ['empty-state', 'EmptyState', 'Feedback', 'Spiega assenza di dati e prossima azione utile.', 'Visuale, titolo, descrizione, azioni', 'Compact · Page', 'Gerarchia semantica e azioni con target Qoovex.'],
  ['error-state', 'ErrorState', 'Feedback', 'Presenta errori recuperabili con un percorso d’uscita.', 'Icona, titolo, descrizione, azioni', 'Compact · Page', 'Il problema è espresso con testo e non solo colore.'],
  ['progress', 'Progress', 'Feedback', 'Mostra avanzamento determinato o attività indeterminata.', 'Label, track, valore', 'Determinate · Indeterminate · Value', 'Elemento progress nativo con nome accessibile.'],

  ['modal', 'Modal', 'Overlay', 'Concentra una decisione bloccante mantenendo contesto e focus.', 'Trigger, overlay, header, body, footer', 'Sm · Md · Lg', 'Focus trap, Escape, restore focus, inert e scroll lock.'],
  ['drawer', 'Drawer', 'Overlay', 'Ospita attività contestuali e composizioni operative.', 'Trigger, overlay, panel, header, body, footer', 'Left · Right · Bottom', 'Focus confinato e restituito; contenuto interno scrollabile.'],
  ['popover', 'Popover', 'Overlay', 'Espone contenuto contestuale non modale vicino al trigger.', 'Trigger, content, arrow', '4 lati · 3 allineamenti', 'Outside click, Escape, collision e focus coerenti.'],
  ['dropdown', 'Dropdown', 'Overlay', 'Espone azioni contestuali navigabili da tastiera.', 'Trigger, label, item, separator, shortcut', 'Default · Disabled · Destructive', 'Frecce, Home/End, Enter/Space ed Escape.'],

  ['navbar', 'Navbar', 'Navigation', 'Organizza brand, destinazioni autorizzate, stato e azioni globali.', 'Brand, link attivo, status, azioni, slot mobile', 'Default · Sticky · Responsive', 'Nav nominata, aria-current e ordine coerente.'],
  ['mobile-nav', 'MobileNav', 'Navigation', 'Porta la navigazione primaria in Drawer accessibile.', 'Trigger, Drawer, destinazioni, azione opzionale', 'Controlled · Uncontrolled', 'Focus trap, Escape, restore focus e target 48 px.'],
  ['page-header', 'PageHeader', 'Layout', 'Stabilisce titolo pagina, contesto e azioni.', 'Breadcrumb slot, eyebrow, h1, descrizione, metadata, azioni', 'Start · Split', 'Un solo h1 e ordine lettura stabile su mobile.'],
  ['section-header', 'SectionHeader', 'Layout', 'Rende coerenti intestazioni e azioni delle sezioni operative.', 'Eyebrow, heading, descrizione, metadata, azioni', 'h2 · h3 · h4 · Start · Split', 'Livello heading esplicito e azioni dopo il contenuto.'],
  ['toolbar', 'Toolbar', 'Layout', 'Compone ricerca, filtri e azioni senza overflow pagina.', 'Search, filters, secondary actions, primary actions', 'Default · Sticky · Responsive', 'Region nominata e tab order nativo.'],

  ['metric-card', 'MetricCard', 'Data display', 'Mostra una metrica operativa con valore e contesto.', 'Label, valore, descrizione, trend, azione', 'Neutral · Success · Warning · Danger · Info', 'Valore tabulare e testo persistente oltre al colore.'],
  ['quantity-status', 'QuantityStatus', 'Data display', 'Distingue stati quantitativi senza simulare un magazzino contabile.', 'Richiesto, approvato, prodotto, assegnato, teorico, verificato', 'Default · Theoretical · Verified · Warning · Danger', 'Teorico e verificato hanno etichette persistenti.'],
  ['calculation-trace', 'CalculationTrace', 'Data display', 'Dimostra come un numero è stato calcolato senza nascondere passaggi.', 'Input, regola, risultato, formula, fonte', 'Compact · Detailed', 'Ordine di lettura lineare e formula nominata.'],
  ['task-item', 'TaskItem', 'Produzione', 'Rappresenta un task riusabile con stato, priorità e azione.', 'Checkbox, titolo, descrizione, status, metadata, azione', 'Low · Medium · High · Checked · Disabled', 'Checkbox nativa, target 48 px e stato testuale.'],
  ['crew-task', 'CrewTaskCard', 'Produzione', 'Riduce il lavoro della brigata al prossimo compito approvato.', 'Task, quantità, evento, priorità, scadenza', 'Assegnato · In corso · Fatto', 'Target grandi e nessun dato gestionale superfluo.'],
  ['notification-item', 'NotificationItem', 'Produzione', 'Rende leggibile una notifica operativa.', 'Indicatore, titolo, descrizione, tempo, azione', 'Read · Unread · Tone semantici', 'Lo stato unread non dipende solo dal colore.'],
  ['activity-item', 'ActivityItem', 'Produzione', 'Mostra attività e audit leggeri.', 'Icona, titolo, descrizione, autore, timestamp', 'Neutral · Success · Warning · Danger', 'Ordine di lettura lineare e timestamp testuale.'],
  ['user-card', 'UserCard', 'Accessi', 'Rappresenta una persona o membro reparto con ruolo e azioni.', 'Avatar, nome, email, ruolo, metadata, azioni', 'Default · Con azioni', 'Avatar con nome accessibile e ruolo testuale.'],
  ['data-panel', 'DataPanel', 'Produzione', 'Fornisce un contenitore prodotto con header, body e footer coerenti.', 'Eyebrow, titolo, descrizione, azioni, body, footer', 'Default · Subtle · Elevated · Glass', 'Heading e azioni mantengono ordine DOM stabile.'],
  ['action-panel', 'ActionPanel', 'Produzione', 'Evidenzia una decisione o un blocco azione senza logica business.', 'Header, contenuto, azioni, tono', 'Neutral · Warning · Danger · Success', 'Il tono è accompagnato da testo e struttura.'],
  ['empty-panel', 'EmptyPanel', 'Produzione', 'Mostra assenza di dati in un pannello compatto.', 'Titolo, descrizione, azioni', 'Default', 'Messaggio e azioni restano leggibili su mobile.'],

  ['free-text-intake', 'FreeTextEventIntake', 'Intake', 'Accetta la descrizione naturale di un evento.', 'Testo, esempio, azione struttura', 'Vuoto · Compilato · Elaborazione', 'Label persistente e stato elaborazione testuale.'],
  ['rule-editor', 'RuleEditor', 'Regole', 'Salva formula, unità, margine e arrotondamento come una sola regola.', 'Contesto, base, margine, unità, rounding', 'Nuova · Versione successiva', 'NumberInput produce null, mai NaN.'],
  ['team-access', 'TeamAccessPanel', 'Accessi', 'Mostra persone e ruoli gestibili dall’utente corrente.', 'Membro, reparto, ruolo, revoca', 'Admin · Chef', 'Le azioni derivano dai permessi server-side.'],
  ['invitation-composer', 'InvitationComposer', 'Accessi', 'Invita capi reparto o brigata senza auto-promozioni.', 'Email, ruolo, invia', 'Admin · Chef', 'Email e ruolo hanno label persistenti.'],
  ['support-access', 'SupportAccessPanel', 'Accessi', 'Apre una sessione temporanea usando il codice come identificativo.', 'Codice, motivo, sessione', 'Ricerca · Attiva', 'Motivo obbligatorio e identità supporto visibile.'],
  ['support-banner', 'SupportSessionBanner', 'Accessi', 'Mantiene evidente una sessione Qoovex attiva.', 'Struttura, motivo, scadenza, chiudi', 'Desktop · Mobile', 'Banner persistente e chiusura esplicita.'],
  ['assistant-launcher', 'OperationalAssistantLauncher', 'Assistente', 'Apre l’assistente con un solo gesto.', 'Trigger, stato', 'Pulsante esteso', 'Nome accessibile e target 48 px.'],

  ['marketing-home', 'Marketing home components', 'Marketing', 'Composizioni app-local per la home Qoovex.', 'Hero, feature grid, trust bar, CTA', 'Home placeholder · App-local', 'Usa primitive UI, non componenti pubblici scollegati.']
];

export const catalog: CatalogItem[] = items.map(([id, name, group, purpose, anatomy, variants, accessibility]) => ({
  id,
  name,
  group,
  purpose,
  anatomy,
  variants,
  accessibility
}));

export const groups: CatalogGroup[] = [
  'Accessi',
  'Intake',
  'Regole',
  'Produzione',
  'Assistente',
  'Primitive',
  'Forms',
  'Feedback',
  'Overlay',
  'Navigation',
  'Layout',
  'Data display',
  'Marketing'
];
