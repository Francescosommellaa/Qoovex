# Component Visual Rules

## Scopo

Definire il contratto visuale dei componenti futuri prima che esistano API,
token o implementazioni in `packages/ui`.

Questo documento assegna responsabilità e limiti; non autorizza ancora la
creazione dei componenti.

## Contratto comune degli stati

| Stato          | Regola                                                                        |
| -------------- | ----------------------------------------------------------------------------- |
| Default        | Contrasto completo, gerarchia stabile, nessun effetto non necessario          |
| Hover          | Variazione sottile di superficie o bordo; nessuna informazione esclusiva      |
| Active/pressed | Feedback immediato tramite superficie e spostamento massimo minimo            |
| Focus-visible  | Ring accessibile distinto dal glow e contrasto ≥ 3:1                          |
| Disabled       | Leggibile, non interattivo, senza scomparire; motivo disponibile se rilevante |
| Loading        | Dimensioni stabili, etichetta o stato comprensibile, niente motion aggressiva |
| Open           | Layer e focus chiari; Escape, outside click e focus restoration nel contratto |
| Error          | Testo specifico, icona o struttura e colore danger                            |
| Success        | Conferma breve e prossimo passo, senza celebrazione continua                  |
| Reduced motion | Stato finale immediato o breve dissolvenza                                    |

## Contratto comune del blur

- Il contenuto interno rimane nitido.
- `strong` è consentito solo su overlay, hero e preview isolate.
- Le liste e i componenti ripetuti non usano backdrop blur.
- Uno stato non viene comunicato solo con glow.
- Input dentro un pannello glass usano una superficie paper.
- Mobile usa più opacità e meno blur.

## Primitive operative

### Button

- **Ruolo blur:** nessuno di default; glow sotto superficie solo per CTA
  marketing primaria o focus eccezionale.
- **Massimo:** `glass-subtle`, senza backdrop-filter proprio nel workspace.
- **Default:** primary ink, secondary paper, tertiary trasparente stabile,
  destructive semantico.
- **Hover:** variazione di luminanza o bordo.
- **Active:** lieve compressione visiva, senza bounce.
- **Disabled:** contrasto ridotto e label leggibile.
- **Marketing opt-in:** `interaction="magnetic"` solo su CTA primary o glass
  rare; massimo 6 px entro 32 px di prossimità, disattivato su touch, disabled
  e reduced motion.
- **Error:** non applicabile come stato autonomo; usare variante destructive
  solo per azione realmente distruttiva.
- **Success:** label può cambiare temporaneamente con icona e testo.
- **Anti-pattern:** bottone gradiente, neon, pill per ogni azione, spinner senza
  label accessibile.

### Input

- **Ruolo blur:** nessuno; deve restare paper anche dentro glass.
- **Massimo:** nessun blur proprio.
- **Default:** label persistente, bordo neutro, testo ad alto contrasto.
- **Hover:** bordo leggermente più forte.
- **Active/focus:** ring accessibile, bordo focus, nessun glow diffuso.
- **Disabled:** valore leggibile e superficie distinta.
- **Error:** bordo, messaggio specifico e icona se utile.
- **Success:** usare solo quando la conferma apporta valore, non dopo ogni campo.
- **Anti-pattern:** placeholder come label, input trasparente su immagine,
  validazione solo cromatica.

### Textarea

- Segue Input.
- **Default:** altezza sufficiente a mostrare contesto; resize o espansione
  controllata.
- **Loading:** preserva il testo e segnala salvataggio separatamente.
- **Error/success:** messaggio vicino al campo.
- **Anti-pattern:** blur dietro testo lungo, auto-resize che sposta azioni
  critiche, contatore poco leggibile.

### Select

- **Ruolo blur:** trigger paper; menu paper o `glass-soft`.
- **Massimo:** `medium` sul menu flottante.
- **Default:** valore e affordance chiari.
- **Hover/active:** coerenti con Input.
- **Open:** menu separato, opaco su mobile, viewport-safe.
- **Disabled:** valore leggibile.
- **Error/success:** sul trigger e nel messaggio, non sulle option.
- **Anti-pattern:** menu trasparente, option con glow, selezione indicata solo
  dal colore.

## Contenitori

### Card

- **Ruolo blur:** nessuno per card operative; `medium` solo per card focale o
  narrativa isolata.
- **Massimo:** `strong` esclusivamente per preview isolate, mai in liste.
- **Varianti runtime:** `glass` usa medium; `glass-strong` usa strong soltanto
  per preview o focus eccezionali fuori da liste operative.
- **Contesto:** una card glass deve avere luce, colore o contenuto sottostante
  percepibile; su un canvas uniforme va usata una card paper.
- **Default:** paper, bordo sottile o ombra minima.
- **Hover:** solo se tutta la card è interattiva.
- **Active:** evidenza strutturale, non glow.
- **Disabled:** mantenere contenuto leggibile.
- **Error/success:** segnale locale con testo e stato.
- **Anti-pattern:** tutte le card glass, raggio enorme, icona colorata
  decorativa.

### Dialog

- **Ruolo blur:** Lens + Veil.
- **Massimo:** `glass-modal` strong.
- **Default/closed:** non presente nel tree interattivo.
- **Open:** veil attenua il canvas; pannello quasi opaco.
- **Focus:** trap e primo focus prevedibile.
- **Loading:** azioni stabili, chiusura gestita secondo rischio.
- **Error:** vicino all’azione o al campo responsabile.
- **Success:** chiusura o stato conclusivo con prossimo passo.
- **Anti-pattern:** dialog trasparente, più modali annidate, overlay nero duro.

### Drawer

- Segue Dialog, ma conserva una relazione spaziale con il contenuto.
- **Massimo:** `glass-modal`.
- **Open:** entra dal bordo coerente con navigazione e lingua; mobile preferisce
  sheet inferiore per azioni brevi.
- **Active:** handle e area di trascinamento accessibili quando presenti.
- **Anti-pattern:** drawer glass sopra sidebar glass sopra canvas glass.

### Popover

- **Ruolo blur:** separazione locale.
- **Massimo:** `glass-medium`, preferibilmente paper.
- **Open:** ancoraggio evidente e collision handling.
- **Hover:** non deve essere l’unico modo per aprirlo.
- **Error/success:** solo se contiene un piccolo flusso, con messaggio locale.
- **Anti-pattern:** copy essenziale disponibile solo nel popover, superficie
  troppo trasparente.

### Dropdown

- **Ruolo blur:** come Popover.
- **Massimo:** `soft/medium`.
- **Default:** trigger distinto dal menu.
- **Open:** item con altezza touch adeguata.
- **Active:** check o icona più testo.
- **Disabled:** item leggibile e non selezionabile.
- **Error/success:** non applicabili agli item ordinari.
- **Anti-pattern:** menu con categorie decorative, hover esclusivo, clipping.

## Navigazione

### Tabs

- **Ruolo blur:** nessuno sul singolo tab; container può usare Divider.
- **Massimo:** `glass-subtle` sul container sticky.
- **Default:** label leggibile.
- **Hover:** superficie lieve.
- **Active:** posizione, peso e indicatore; non solo colore.
- **Disabled:** raro e motivato.
- **Error/success:** badge semantico solo se il tab contiene uno stato reale.
- **Anti-pattern:** capsule glass per ogni tab, scroll orizzontale senza indizi.

### Sidebar

- **Ruolo blur:** Divider stabile.
- **Massimo:** `glass-navigation` soft.
- **Default:** neutra, più quieta del canvas.
- **Hover:** item con superficie sottile.
- **Active:** contrasto e indicatore strutturale.
- **Disabled:** voce nascosta se inutilizzabile, disabilitata solo se serve
  spiegare un limite.
- **Error/success:** badge locali, non tinta dell’intera sidebar.
- **Anti-pattern:** glow continuo, trasparenza su contenuti rumorosi, nove aree
  equivalenti.

### Topbar

- **Ruolo blur:** Divider.
- **Massimo:** `glass-navigation` soft.
- **Default:** paper o trasparente su background stabile.
- **Scrolled:** blur e bordo inferiore progressivi.
- **Active:** azioni con contratto Button.
- **Error/success:** indicatori puntuali.
- **Anti-pattern:** header molto alto, colore decorativo, blur forte fisso su
  mobile.

### Command menu

- **Ruolo blur:** Lens + Veil.
- **Massimo:** `glass-modal`.
- **Open:** input paper, risultati opachi, focus tastiera evidente.
- **Loading:** risultati stabili e stato annunciato.
- **Empty:** suggerisce query o azione.
- **Error:** messaggio recuperabile.
- **Success:** esegue, chiude e ripristina focus.
- **Anti-pattern:** risultati glass individuali, scorciatoie illeggibili,
  dipendenza dal mouse.

## Feedback

### Toast

- **Ruolo blur:** separazione locale; non obbligatorio.
- **Massimo:** `glass-soft`.
- **Default/open:** paper ad alto contrasto, durata sufficiente.
- **Hover/focus:** pausa dismiss quando appropriato.
- **Error:** persistente finché serve un’azione.
- **Success:** breve, specifico, con prossimo passo se utile.
- **Loading:** evitare; usare stato nel contesto originario.
- **Anti-pattern:** stack rumoroso, toast come unica conferma critica, glow per
  ogni successo.

### Empty state

- **Ruolo blur:** Depth ambientale opzionale.
- **Massimo:** `glass-soft`.
- **Default:** spiega perché l’area è vuota e propone un’azione.
- **Hover/active:** sul CTA, non sull’intero pannello.
- **Disabled:** mostra il requisito o limite.
- **Error:** distinto da vuoto.
- **Success:** non applicabile.
- **Anti-pattern:** illustrazione decorativa dominante, tono celebrativo,
  nessun prossimo passo.

## Marketing

### Pricing card

- **Ruolo blur:** nessuno di default.
- **Massimo:** `glass-subtle` per evidenza locale.
- **Default:** paper, confronto leggibile.
- **Hover:** non cambia il piano raccomandato.
- **Active:** selezione strutturale se interattiva.
- **Disabled:** feature non inclusa spiegata senza opacità estrema.
- **Error:** prezzi o dati mancanti non vengono inventati.
- **Success:** CTA segue Button.
- **Anti-pattern:** Pro con glow neon, piani color-coded, limiti duplicati.

### Hero visual

- **Ruolo blur:** Lens, Depth e Motion trail.
- **Massimo:** `glass-deep`.
- **Default:** trasformazione comprensibile staticamente.
- **Hover/active:** eventuale esplorazione non necessaria alla comprensione.
- **Loading:** placeholder statico che conserva layout.
- **Error/fallback:** gradienti e paper senza distorsione.
- **Success:** non applicabile.
- **Anti-pattern:** orb AI, headline sfocata, animazione obbligatoria.

### Feature section

- **Ruolo blur:** focus su una prova, non su tutte le feature.
- **Massimo:** `glass-medium`.
- **Default:** copy e proof nitidi.
- **Hover/active:** solo se esiste interazione reale.
- **Disabled/error/success:** non applicabili salvo demo incorporata.
- **Anti-pattern:** griglia di card glass identiche, icone decorative colorate.

### Product preview

- **Ruolo blur:** Lens attorno a UI reale.
- **Massimo:** `glass-strong` nel frame, nessun blur sul dato mostrato.
- **Default:** stato reale e leggibile.
- **Hover/active:** possono guidare tra passaggi.
- **Loading:** skeleton opaco.
- **Error:** fallback statico e messaggio.
- **Success:** mostra il risultato senza confetti.
- **Anti-pattern:** mockup finto, dati minuscoli, UI marketing non
  implementabile.

## Componenti di dominio

### Recipe card

- **Ruolo blur:** nessuno in lista.
- **Massimo:** `glass-subtle` solo come card selezionata isolata.
- **Default:** titolo, stato, porzioni e metadati necessari.
- **Hover:** azioni contestuali senza spostare il layout.
- **Active:** selezione con bordo e superficie.
- **Disabled:** raro; spiegare permesso o limite.
- **Error:** dato incompleto o non disponibile con testo.
- **Success:** stato “pronta” o “verificata” solo se semanticamente corretto.
- **Anti-pattern:** immagine dominante, gradienti per categoria, blur per card.

### Menu card

- **Ruolo blur:** nessuno; preview pubblica può essere una lens separata.
- **Massimo:** `soft` sulla preview, non sulla card.
- **Default:** nome, stato pubblicazione, ricette e azione principale.
- **Hover/active:** come Card.
- **Disabled:** limite piano spiegato al momento dell’azione.
- **Error:** pubblicazione o dati mancanti.
- **Success:** pubblicato con data o stato leggibile.
- **Anti-pattern:** trattare il menu come poster decorativo, stato solo a colore.

### Work plan task card

- **Ruolo blur:** nessuno nella board/lista.
- **Massimo:** `glass-focus` sul dettaglio selezionato, non sulla card ripetuta.
- **Default:** task, responsabile o contesto, stato e recipe snapshot se
  presente.
- **Hover:** azioni consentite dal ruolo.
- **Active:** selezione strutturale.
- **Disabled:** azioni non consentite non sembrano disponibili.
- **Error:** completamento fallito con riprova e contesto.
- **Success:** completato con check, testo e feedback breve.
- **Anti-pattern:** ogni stato con glow, task modificabile da membro, snapshot
  ambiguo, blur su testo.

## Matrice responsive obbligatoria

Ogni componente deve essere verificato a:

- 375 px;
- 768 px;
- 1024 px;
- 1440 px.

Per ogni viewport registrare geometria, superficie, tipo, motion, focus,
overflow e livello di evidenza: `measured`, `observed` o `inferred`.

## Esempio

Corretto:

> Una recipe card resta paper nella lista; quando selezionata apre un dettaglio
> `glass-focus` separato, senza aggiungere blur alle altre card.

Errato:

> Ogni card usa il proprio backdrop-filter per rendere la lista “premium”.

## Anti-pattern

- Varianti visuali senza differenza semantica.
- Stato disponibile solo su hover.
- Glow usato al posto del focus ring.
- Componenti di dominio che ignorano le primitive.
- Overlay senza focus management.
- Consumer override che duplica un comportamento condiviso.

## Impatto sul marketing

Hero, feature e product preview possono usare la firma ad alta intensità. I
componenti operativi mostrati al loro interno rispettano comunque le regole
workspace.

## Impatto sul workspace

Paper è il default. Glass è un’eccezione di focus, navigazione o overlay. I
componenti di dominio non diventano varianti decorative delle primitive.

## Rischi tecnici

- API componenti definite prima degli use case reali.
- Stati mancanti nei componenti complessi.
- Preset applicati localmente invece che via token.
- Overlay e focus management incompleti.
- Regressioni responsive da override consumer.

## Richiede conferma

- Breaking change alle API delle primitive Stable v0.1.
- Librerie primitive o dipendenze.
- Nuove primitive oltre la prima milestone.
- Eccezioni al composition-first.

## Checklist

- [ ] Default, hover, active, focus e disabled sono coperti.
- [ ] Loading, open, error e success sono coperti dove pertinenti.
- [ ] Reduced motion ha un comportamento equivalente.
- [ ] Il limite blur è dichiarato.
- [ ] Gli stati di dominio rispettano business rule e UX.
- [ ] Nessun componente è autorizzato all’implementazione da questo file solo.
