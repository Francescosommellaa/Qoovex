# Workspace UI Direction

## Scopo

Applicare la visual language alla futura app operativa con priorità mobile,
massima leggibilità e progressiva disclosure.

## Principio

Il workspace serve a lavorare, non a osservare un effetto. Il blur separa
livelli e guida il focus; canvas, paper e tipografia nitida sostengono il lavoro
quotidiano.

## Mobile-first

Il mobile è il contesto primario per:

- consultare ricette;
- verificare ingredienti e allergeni;
- aprire un piano ricevuto;
- leggere un task;
- segnare un completamento;
- controllare una notifica;
- spuntare una lista.

La creazione complessa può guadagnare densità su desktop, ma deve conservare la
stessa struttura mentale.

## Shell

### Mobile

- Topbar compatta e stabile.
- Navigazione primaria limitata al contesto utile.
- Bottom navigation solo se il test conferma aree persistenti.
- Azione primaria raggiungibile con touch target di almeno 44 × 44 px.
- Drawer e sheet quasi opachi.
- Nessun background animato durante il lavoro.

### Desktop

- Sidebar `glass-navigation` o paper, con contrasto stabile.
- Topbar come divider leggero.
- Canvas ampio e prevalentemente opaco.
- Layout elenco/dettaglio quando riduce passaggi.
- Pannelli contestuali senza trasformare ogni area in una card.

## Materiali

| Area              | Materiale predefinito       | Blur massimo |
| ----------------- | --------------------------- | ------------ |
| Canvas            | Canvas opaco                | Nessuno      |
| Form e dati       | Paper                       | Nessuno      |
| Navigazione       | Glass navigation            | Soft         |
| Popover           | Paper/glass soft            | Medium       |
| Drawer/dialog     | Glass modal + paper interno | Strong       |
| Empty state       | Paper con depth ambientale  | Soft         |
| Lista/task        | Paper o canvas              | Nessuno      |
| Focus selezionato | Glass focus locale          | Medium       |

## Densità e gerarchia

- Una schermata mobile propone una sola azione primaria.
- Le azioni secondarie entrano in menu contestuali.
- Gli stati di verifica restano vicini al dato.
- Empty state orienta al prossimo output utile.
- Dashboard generica non è il primo valore.
- L’utente vede il prossimo passaggio, non tutti i moduli.

## Aree prodotto

### Ricette

- Card lista opache e scansionabili.
- Immagine opzionale, mai dominante sui dati professionali.
- Quantità, porzioni e stato leggibili senza aprire overlay.
- Il dettaglio può usare pannelli per sezioni, non glass ripetuto.
- CTA collega al prossimo output utile.

### Menu

- Composizione e ordine prevalgono sulla decorazione.
- Preview pubblica isolata in una lens.
- Stato pubblicazione e verifica sempre testuali.
- Il workspace non diventa un editor grafico libero.

### Allergeni e nutrizione

- Paper ad alto contrasto.
- Fonte, stato e incertezza visibili.
- Warning e danger non vengono attenuati dal vetro.
- Tooltip non contiene l’unica spiegazione disponibile.

### Lista della spesa

- Righe opache e touch-friendly.
- Stato spuntato distinguibile anche senza colore.
- Nessun blur per riga.
- Azioni batch chiare e reversibili.

### Piano di lavoro

- Creator e membro hanno complessità differenti.
- Task card prevalentemente opache.
- Blur solo per dettaglio selezionato, drawer e focus.
- Snapshot ricetta dichiarato come tale.
- Completamento produce feedback breve e non celebrativo.

### Notifiche

- Evento, contesto e azione in una riga gerarchica chiara.
- Glow solo per evento eccezionale, non per ogni non letto.
- Nessun feed colorato per engagement.

### Explore

- Contenuti professionali, non feed consumer.
- Blur solo su preview o attribuzione contestuale.
- Azione “Usa come base” più importante dei segnali sociali.

## Stati

- Focus ring visibile e indipendente dal glow.
- Hover non è requisito mobile e non contiene informazioni esclusive.
- Active usa variazione di superficie e posizione minima.
- Disabled resta leggibile e spiega il limite quando necessario.
- Loading conserva dimensioni e contesto.
- Success indica il prossimo passo.
- Error spiega cosa è successo e come correggere.

## Responsive matrix

| Viewport | Struttura                                | Densità           | Blur                      |
| -------: | ---------------------------------------- | ----------------- | ------------------------- |
|      375 | Una colonna, sheet e azione contestuale  | Bassa             | Ridotto, superfici opache |
|      768 | Pannelli sequenziali o split selettivo   | Media             | Soft/medium               |
|     1024 | Sidebar e dettaglio                      | Medio-alta        | Navigation + overlay      |
|     1440 | Elenco/dettaglio e strumenti contestuali | Alta ma leggibile | Stesso budget di 1024     |

## Performance

- Massimo due layer `backdrop-filter`.
- Nessun backdrop-filter per elemento ripetuto.
- Preferire pannelli opachi durante scroll lungo.
- Disattivare motion ambientale.
- Fallback statico per hardware debole.
- Misurare frame rate e consumo, non solo screenshot.

## Esempio

Corretto:

> Il membro apre un task in un drawer quasi opaco; il piano dietro viene
> velato, la ricetta snapshot resta nitida e il bottone “Segna come completato”
> è immediato.

Errato:

> Ogni task è una card trasparente con glow colorato e hover animato.

## Anti-pattern

- Dashboard come home obbligatoria.
- Nove moduli equivalenti nella navigazione.
- Glass su liste lunghe.
- Sidebar colorata o animata.
- Dati stimati senza stato.
- CTA fluttuanti che coprono contenuti.
- Desktop ristretto senza riprogettazione mobile.

## Impatto sul workspace

Queste regole governano la futura app: canvas e paper sono i materiali
predefiniti, il blur è limitato a navigazione, overlay e focus, e la
consultazione mobile precede la densità desktop.

## Impatto sul marketing

Le schermate mostrate nel marketing devono usare questa sobrietà. La lente
marketing può incorniciare la UI, ma non alterarne i materiali operativi.

## Rischi tecnici

- Spazio mobile insufficiente per stato, unità e azioni.
- Sticky surfaces con blur costoso.
- Dipendenza da hover.
- Navigazione troppo profonda.
- Contrasto ridotto in condizioni di luce forte.

## Richiede conferma

- Pattern finale della navigazione mobile.
- Priorità dei device dopo ricerca sul campo.
- Layout delle singole aree prodotto.
- Densità desktop e breakpoint finali.
- Metriche prestazionali minime.

## Checklist

- [ ] L’azione primaria è evidente su mobile.
- [ ] Dati e stati sono nitidi.
- [ ] Le liste non usano blur ripetuto.
- [ ] Desktop aggiunge densità senza cambiare il modello mentale.
- [ ] Focus, errori e successi non dipendono dal colore.
- [ ] Il fallback conserva gerarchia e operatività.
