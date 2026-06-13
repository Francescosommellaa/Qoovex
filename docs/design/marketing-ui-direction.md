# Marketing UI Direction

## Scopo

Applicare la visual language al sito pubblico senza alterare la strategia,
l’ordine o il copy definiti in `docs/ux`.

## Obiettivo

In cinque secondi un professionista deve capire:

1. Qoovex è per chef e cuochi professionisti.
2. Parte dalle ricette.
3. Produce menu, liste e lavoro operativo.
4. Riduce strumenti e riscritture.
5. Può iniziare gratis o vedere il flusso.

L’estetica non può ritardare questa comprensione.

## Intensità

- Una hero ad alta intensità.
- Uno o due momenti di trasformazione a media intensità.
- Il resto della landing prevalentemente bianco e nitido.
- Una sezione inversa nera solo se chiarisce un passaggio o concentra una CTA.
- Colore entro l’8–12% delle aree espressive.

## Hero: lente operativa

### Composizione

- Headline e subheadline su piano nitido.
- CTA primaria nera; CTA secondaria testuale o paper.
- Lente visuale adiacente o parzialmente dietro il copy senza attraversare le
  parti necessarie al test dei cinque secondi.
- Fuori dalla lente: frammenti di foglio, documento, messaggio e dato duplicato.
- Dentro la lente: ricetta reale e output collegati.
- Membrane concentriche collegano input e output.
- Ciano/cobalto orientano; albicocca appare vicino all’output.

### Stati

- Default: trasformazione già comprensibile senza motion.
- Motion: la zona nitida si stabilizza una sola volta all’ingresso.
- Reduced motion: composizione statica equivalente.
- Mobile: visual sotto il copy, meno layer e superficie più opaca.

### Vietato

- Dashboard generica.
- Device mockup illeggibile.
- Testo della headline sfocato.
- Gradienti che occupano tutto il viewport.
- AI orb o particelle.

## Sezioni

### Problema

Visualizzare la duplicazione con pochi frammenti concreti. Il caos deve essere
comprensibile, non rumoroso.

### Una ricetta, più output

È il secondo momento più caratteristico. Usare una sequenza lineare o una
preview con dettaglio progressivo:

`ricetta → menu/allergeni → lista/piano`.

### Casi d’uso

- Prevalentemente paper.
- Una relazione visuale per caso.
- Niente griglia di card identiche con icone colorate.
- Blur solo per mettere a fuoco la prova.

### Demo

- Video o storyboard con dati realistici.
- UI reale quando disponibile.
- Nessuna schermata simulata presentata come prodotto funzionante.
- Controlli video accessibili e nessun autoplay con audio.

### Proof

- Superficie sobria.
- Contesto, ruolo e risultato prima della decorazione.
- Nessun logo cliente o numero inventato.

### Pricing

- Card prevalentemente opache.
- Piano raccomandato distinto da bordo, posizione e copy, non da glow.
- Limiti derivati solo da `plan_rules.json`.
- Enterprise non domina la gerarchia.

### CTA finale

Può usare superficie inversa e una luce fredda-calda sepolta. Deve collegare
l’azione al primo risultato.

## Navigazione

- Header `glass-navigation` dopo lo scroll.
- Stato iniziale paper o trasparente solo su background stabile.
- CTA sempre leggibile.
- Menu mobile opaco o `glass-modal`, non un foglio trasparente sopra la hero.

## Motion

- Un momento orchestrato nella hero.
- Reveal di sezione discreti e non obbligatori.
- Nessun parallax necessario alla comprensione.
- Nessun movimento continuo vicino al testo.
- Motion trail solo per mostrare trasformazione.

## Responsive matrix

| Viewport | Hero                                  | Navigazione             | Preview                   |
| -------: | ------------------------------------- | ----------------------- | ------------------------- |
|      375 | Copy prima, lente semplificata sotto  | Bottom sheet/menu opaco | Un output alla volta      |
|      768 | Copy e visual in sequenza ravvicinata | Header glass soft       | Due stati confrontabili   |
|     1024 | Split controllato                     | Header sticky           | Flusso quasi completo     |
|     1440 | Grande respiro e lente profonda       | Header leggero          | Flusso completo leggibile |

## Esempio

Corretto:

> Una ricetta al centro resta nitida mentre tre frammenti esterni convergono in
> menu, allergeni e lista.

Errato:

> Una sfera ciano animata comunica genericamente “innovazione”.

## Anti-pattern

- Hero astratta senza proof.
- Feature grid prima della trasformazione.
- Sezioni tutte glass.
- Copy promozionale sopra atmosfera complessa.
- Numeri grandi senza evidenza.
- Pricing colorato per piano.
- Motion che riparte a ogni scroll.

## Impatto sul marketing

Queste regole rendono la landing il luogo più espressivo del sistema, ma
concentrano la firma nella trasformazione ricetta → output e mantengono proof,
copy e conversione più importanti dell’atmosfera.

## Impatto sul workspace

Le preview marketing devono anticipare materiali e gerarchie realmente
implementabili nel workspace. Non possono inventare un’app più spettacolare.

## Rischi tecnici

- Largest Contentful Paint penalizzato da font e visual.
- Layer hero costosi su mobile.
- Video pesante o non accessibile.
- Layout shift durante il caricamento dei font.
- Demo obsoleta rispetto al prodotto.

## Richiede conferma

- Dataset e storyboard definitivi.
- Tecnologia della hero.
- Formato demo video.
- Numero e posizione delle sezioni inverse.
- Valori finali di motion e blur.

## Checklist

- [ ] La hero supera il test dei cinque secondi.
- [ ] Il visual dimostra una trasformazione reale.
- [ ] Headline e CTA restano nitide.
- [ ] La pagina non diventa una sequenza di effetti.
- [ ] Mobile conserva significato con meno blur.
- [ ] Proof e pricing rispettano le fonti canoniche.
