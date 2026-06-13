# UX Research Brief

## Scopo

Definire ciò che è già deciso, ciò che non può essere rimesso in discussione e
le evidenze necessarie prima di investire nella landing e nella futura UI.

## Audit del contesto

### Decisioni già confermate

| Stato | Elemento | Implicazione UX |
| --- | --- | --- |
| Fatto confermato | Qoovex è un SaaS italiano per chef e cuochi professionisti. | Lingua, esempi e terminologia partono dal lavoro di cucina italiano. |
| Fatto confermato | La promessa è trasformare ricette e dati in operatività reale. | Ogni flusso deve partire da una ricetta o produrre un output operativo. |
| Fatto confermato | Il workspace è personale e indipendente. | L’adozione non richiede l’acquisto da parte di un ristorante. |
| Fatto confermato | Il prodotto include ricette, menu, allergeni, nutrizione, QR, Explore, liste, piani e notifiche. | La comunicazione deve gerarchizzare, non mostrare tutto allo stesso livello. |
| Fatto confermato | Qoovex non è POS, ERP, contabilità, task manager generico o app consumer. | Questi confini devono essere espliciti quando evitano aspettative errate. |
| Fatto confermato | I piani e i relativi limiti provengono solo da `plan_rules.json`. | Il marketing non può inventare prezzi, soglie o entitlement. |
| Fatto confermato | La UI precedente è stata eliminata il 10 giugno 2026. | Nessun pattern visuale precedente costituisce vincolo. |

### Decisioni che non vanno riaperte in questa fase

**Fatto confermato**

- Workspace personale e non dipendente da un’organizzazione.
- Partecipazione gratuita e illimitata ai piani creati da altri.
- Ruoli e permessi del Piano di lavoro.
- Snapshot immutabile della ricetta nei task.
- Esclusione dei prezzi dalla Lista della spesa.
- Separazione tra sito marketing e runtime workspace.

### Parti forti del posizionamento

**Ipotesi ragionata**

- “Ricetta → output → operatività” crea una categoria più specifica di
  “gestionale per ristoranti”.
- Il workspace personale è adatto a professionisti che lavorano tra più
  clienti o contesti.
- La stessa base ricetta che alimenta menu, allergeni, lista e task rende
  dimostrabile la riduzione di duplicazioni.
- Il posizionamento leggero rispetto agli ERP riduce la paura di una
  configurazione complessa.

### Parti deboli o ambigue

| Stato | Debolezza | Rischio |
| --- | --- | --- |
| Ipotesi ragionata | “Workspace professionale” è una categoria poco familiare agli chef. | Può sembrare Notion con un lessico food. |
| Ipotesi ragionata | “Operatività reale” è distintivo ma astratto senza esempio. | L’utente non capisce cosa ottiene nei primi cinque secondi. |
| Fatto confermato | Il backend contiene capacità senza una UI attuale. | Screenshot e demo non possono essere promessi finché non esistono. |
| Fatto confermato | La specifica avanzata del Piano di lavoro descrive capacità non canoniche. | AI, stock e scheduling potrebbero entrare impropriamente nel marketing. |
| Punto da validare | Il valore relativo di menu, allergeni, liste e piani non è misurato. | La landing potrebbe dare priorità alla feature sbagliata. |

### Rischi di confusione

- Qoovex percepito come archivio ricette.
- Qoovex percepito come generatore di menu QR.
- Qoovex percepito come gestionale completo con cassa e magazzino.
- Qoovex percepito come task manager per brigate.
- Allergeni e nutrizione interpretati come garanzia normativa.
- Explore interpretato come social consumer.
- Roadmap AI interpretata come funzionalità disponibile.

## Decisioni

**Decisione proposta**

- La prima comunicazione parte da un professionista autonomo con più clienti o
  progetti, non da un’organizzazione complessa.
- Il valore viene dimostrato con un oggetto reale: una ricetta che diventa menu,
  allergeni, lista e lavoro.
- La landing deve superare il test dei cinque secondi prima di ottimizzare
  estetica, SEO o quantità di feature.
- Nessun claim “automatico” viene pubblicato senza descrivere input, controllo
  umano e limiti.

## Piano di ricerca

### Campione

**Decisione proposta**

- 8-12 chef consulenti o freelance.
- Almeno 4 chef di ristoranti indipendenti.
- Almeno 4 professionisti catering/eventi.
- 4 membri di brigata per verificare il ruolo di partecipante, non il buyer.

### Interviste

Indagare:

- dove vivono oggi le ricette;
- quante volte lo stesso dato viene riscritto;
- come vengono prodotti menu, allergeni e liste;
- chi decide e chi usa gli strumenti;
- evento che fa cercare una soluzione;
- costo percepito del caos attuale;
- disponibilità a importare dati iniziali;
- linguaggio spontaneo usato per descrivere il problema;
- feature che crea il primo valore e feature che crea retention.

### Test

| Metodo | Criterio di successo |
| --- | --- |
| Test dei cinque secondi | Almeno 80% identifica prodotto, target, problema, risultato e CTA senza aiuto. |
| Smoke test di nicchia | La variante consulenti/freelance produce maggiore intent qualificato della variante ristorante indipendente. |
| Concept test | Almeno 7 su 10 comprendono il flusso ricetta → output senza spiegazione orale. |
| Test di onboarding | L’utente crea o importa una prima ricetta e genera un output utile nella prima sessione. |
| Test di pricing comprehension | L’utente distingue chiaramente Free, Start e Pro senza attribuire funzioni inesistenti. |

## Regole

- Ricercare comportamenti passati prima delle preferenze future.
- Non usare il founder o il team interno come sostituti degli utenti.
- Conservare citazioni e osservazioni separate dalle interpretazioni.
- Collegare ogni insight a una decisione che potrebbe cambiare.
- Dichiarare campione, data, metodo e limiti di ogni studio.

## Esempi

Domanda corretta:

> Raccontami l’ultima volta in cui hai aggiornato una ricetta e hai dovuto
> riportare la modifica altrove.

Domanda da evitare:

> Ti sarebbe utile una piattaforma che automatizza tutto il lavoro?

## Anti-pattern

- Chiedere opinioni generiche su feature ipotetiche.
- Intervistare solo amici o utenti consumer.
- Usare intenzione dichiarata come prova di acquisto.
- Testare una landing piena di feature senza una promessa dominante.
- Validare la soluzione senza osservare il workflow attuale.

## Punti da validare

- Il segmento consulenti/freelance ha frequenza d’uso sufficiente per un SaaS.
- Il costo di importazione dell’archivio non annulla il valore percepito.
- Menu e allergeni sono un trigger più forte del Piano di lavoro.
- Il professionista autonomo può coinvolgere il team senza vendita
  organizzativa.
- “Workspace” è comprensibile o richiede una formulazione più concreta.

## Checklist finale

- [ ] Nessuna ipotesi è presentata come ricerca conclusa.
- [ ] Il campione include buyer e utenti operativi.
- [ ] Le domande partono da comportamenti passati.
- [ ] Ogni test ha una soglia di successo.
- [ ] La roadmap non entra nei concept v1.
- [ ] I risultati possono cambiare nicchia, messaggi o priorità.
