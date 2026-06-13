# Landing Page UX Brief

## Scopo

Definire contenuto, ordine e criteri della landing Qoovex senza imporre layout,
componenti o stile visuale.

## Obiettivo dei cinque secondi

**Decisione proposta**

Un chef deve capire:

1. che Qoovex è uno strumento professionale per il suo lavoro;
2. che parte dalle ricette;
3. che crea menu, liste e operatività;
4. che riduce riscritture e strumenti separati;
5. che può iniziare gratis o guardare una demo.

## Decisioni

**Decisione proposta**

- La landing vende chiarezza operativa, non software generico.
- La hero usa una promessa, una prova visiva e due CTA.
- L’ordine delle sezioni è vincolante finché i test non giustificano modifiche.
- Piani e feature vengono presentati solo dopo comprensione e proof.

## Above the fold obbligatorio

### Headline

> Trasforma le tue ricette in menu, liste e lavoro operativo.

### Subheadline

> Qoovex è il workspace professionale per chef e cuochi che collega ricette,
> allergeni, menu, lista della spesa e piano di lavoro.

### CTA

- Primaria: **Inizia gratis**
- Secondaria: **Guarda come funziona**

### Contenuto visivo

**Decisione proposta**

Mostrare un solo esempio coerente:

> ricetta reale → menu con allergeni → lista o task operativo.

Il visual deve dimostrare relazione e trasformazione. Non deve essere:

- dashboard generica;
- collage di schermate;
- mockup privo di dati leggibili;
- animazione astratta;
- immagine stock di uno chef.

### Formato della demo

**Decisione proposta**

- Prima scelta: video guidato di 60-90 secondi con dati reali.
- Fallback prima che la UI esista: storyboard statico dichiarato come
  anteprima, senza fingere schermate funzionanti.
- Screenshot: solo reali, aggiornati e accompagnati da un risultato.
- Interazione guidata: dopo che il flusso core è stabile e verificabile.

## Ordine vincolante delle sezioni

### 1. Hero

Risponde a “cos’è, per chi è, cosa ottengo e cosa faccio ora”.

### 2. Problema degli strumenti frammentati

**Decisione proposta**

Usare un esempio concreto:

> La stessa modifica vive in ricetta, foglio allergeni, menu, lista e messaggi.

Non aprire con statistiche generiche non verificate.

### 3. Una ricetta, più output

È la dimostrazione della differenza di Qoovex. Deve mostrare continuità, non
solo feature.

### 4. Tre casi d’uso

1. Archivio professionale riusabile.
2. Menu e informazioni alimentari.
3. Lista e lavoro operativo.

Ogni caso deve contenere problema, azione, risultato e prova.

### 5. Demo concreta

Percorso raccomandato:

1. apri una ricetta;
2. usa ingredienti e dati strutturati;
3. inseriscila in un menu;
4. genera lista o task;
5. mostra l’output finale.

### 6. Proof

Ordine di preferenza:

1. testimonianza verificata con ruolo e contesto;
2. caso d’uso misurato;
3. dati da test utente;
4. esempio reale completo;
5. claim di prodotto dimostrato.

Non inventare loghi, numeri, recensioni o clienti.

### 7. Piani per livello d’uso

**Fatto confermato**

Limiti e gating arrivano solo da `packages/config/plan_rules.json`.

**Decisione proposta**

- Free: prova il flusso ricette → menu e partecipa ai piani altrui.
- Start: uso professionale ricorrente individuale e prima collaborazione.
- Pro: volumi elevati, più piani e output avanzati già confermati.
- Enterprise: percorso commerciale custom, senza dominare la landing iniziale.

Non pubblicare prezzi approssimativi come definitivi.

### 8. Obiezioni e confini

Gestire:

- “Ho già Excel/Sheets.”
- “Ho già un gestionale.”
- “Quanto tempo serve per inserire le ricette?”
- “Posso verificare allergeni e dati?”
- “Il mio team deve pagare?”
- “È un’app per ricette?”

Confini:

- non POS;
- non ERP;
- non contabilità;
- non magazzino o food cost;
- non app consumer;
- non AI che gestisce tutto.

### 9. CTA finale

Ripetere **Inizia gratis** e collegarla al primo risultato:

> Crea la prima ricetta e trasformala in un output utile.

## Cosa vede ogni piano

### Free

**Decisione proposta**

Mostrare:

- ingresso senza rischio;
- ricette e menu come primo valore;
- partecipazione gratuita ai piani altrui;
- percorso chiaro verso Start.

Non mostrare come leva primaria:

- collaborazione creata dall’utente;
- QR personalizzato;
- export avanzati.

### Start

Mostrare:

- uso professionale continuativo;
- maggiore capacità di archivio e menu;
- primo Piano di lavoro creato;
- collaborazione con piccolo team.

### Pro

Mostrare:

- uso intensivo;
- volumi senza limiti numerici per ricette e menu secondo fonte canonica;
- più piani e membri;
- feature Pro confermate da `plan_rules.json`.

## Feature nella landing

| Priorità | Feature |
| --- | --- |
| Comunicare subito | Ricette, menu, allergeni, lista, collegamento al Piano di lavoro. |
| Mostrare dopo | Nutrizione, QR, collaborazione e notifiche. |
| Non mettere in hero | Explore, activity log, API, supporto SLA, dettagli Enterprise. |
| Escludere | AI chat, PrepStock, scheduling avanzato, prezzi lista, POS e magazzino. |

## Materiali necessari prima della UI

**Decisione proposta**

- Dataset italiano con almeno 8 ricette, 2 menu e ingredienti realistici.
- Caso principale di un consulente con due clienti.
- Caso secondario ristorante o catering.
- Storyboard ricetta → menu → lista/Piano.
- Video demo di 60-90 secondi.
- Screenshot reali dei passaggi core.
- Nota pubblica su fonti, limiti e verifica di allergeni/nutrizione.
- Testimonianze verificate.
- Metriche di test dei cinque secondi.
- Tabella piani derivata dalla fonte canonica.

## Regole

- Una sezione deve rispondere a una domanda dell’utente.
- Ogni feature deve essere collegata a un risultato.
- Il primo scroll non contiene una lista completa del prodotto.
- Proof prima del pricing.
- La demo viene aggiornata insieme al prodotto.
- I piani descrivono livelli d’uso, non personas rigide.

## Esempi

Corretto:

> Parti da una ricetta. Riusa ingredienti e allergeni nel menu e genera la
> lista senza riscrivere tutto.

Errato:

> Nove potenti moduli per digitalizzare il tuo business food.

## Anti-pattern

- Hero con “gestisci tutto”.
- CTA “Scopri di più” come azione primaria.
- Screenshot illeggibili dentro device mockup.
- Pricing prima della comprensione.
- Testimonianze senza identità verificabile.
- Roadmap presentata in demo.
- Claim normativi assoluti sugli allergeni.

## Punti da validare

- Variante hero per consulenti contro variante ristorante.
- Video contro sequenza statica.
- Presenza della parola “workspace”.
- Ordine lista/Piano come quarto output.
- Quantità di dettaglio necessaria sui piani.

## Checklist finale

- [ ] La hero supera il test dei cinque secondi.
- [ ] Il visual dimostra una trasformazione reale.
- [ ] Le sezioni seguono l’ordine stabilito.
- [ ] Ogni claim ha una proof.
- [ ] Free, Start e Pro sono distinguibili.
- [ ] Nessuna roadmap o feature esclusa appare come disponibile.
- [ ] Sono chiari i confini rispetto a POS, ERP e app consumer.
