# Visual Reference Analysis

## Scopo

Registrare ciò che è stato osservato nelle quattro reference fornite e
distinguere l’evidenza dalla direzione inferita per Qoovex.

Gli screenshot non vengono copiati nel repository perché sono reference
esterne e i file originari sono temporanei.

## Metodo

- `osservato`: caratteristica direttamente visibile.
- `inferito`: regola proposta a partire da più evidenze.
- `escluso`: elemento visibile ma incoerente con target o UX Qoovex.

Non sono disponibili file sorgente o computed style: geometria e intensità non
sono considerate misure esatte.

## Evidence table

| Reference         | Evidenza                                                                      | Stato     | Uso Qoovex                           |
| ----------------- | ----------------------------------------------------------------------------- | --------- | ------------------------------------ |
| Amplify / Clarify | Archi concentrici attraversano il testo e ne alterano localmente la nitidezza | Osservato | Firma marketing, mai testo operativo |
| Amplify / Clarify | Grande campo bianco con contrasto nero e atmosfera quasi monocromatica        | Osservato | Base cromatica canonica              |
| Login glass       | Pannello satinato sopra immagine complessa, con input più opachi              | Osservato | Lens e form focali                   |
| Login glass       | Copy piccolo sopra background instabile perde chiarezza                       | Osservato | Anti-pattern esplicito               |
| Mobile lens       | Contenuto centrale nitido mentre il contesto superiore è attenuato            | Osservato | Focus mode e onboarding              |
| Mobile lens       | Gradienti freddi e rosa molto saturi dominano l’inquadratura                  | Osservato | Intensità da ridurre per Qoovex      |
| Archi ciano       | Archi larghi, feathered e tagliati dal bordo costruiscono profondità          | Osservato | Background hero e transizioni        |
| Archi ciano       | Ciano, azzurro e violetto generano una luce continua                          | Osservato | Accento freddo sepolto               |
| Insieme           | Il blur funziona meglio quando esiste una zona chiaramente nitida             | Inferito  | Principio lens: contesto → focus     |
| Insieme           | La firma emerge dalla ripetizione controllata di archi e membrane             | Inferito  | Un solo gesto proprietario           |

## Cosa adottare

### Membrane concentriche

Adottare archi e membrane come visualizzazione di:

- informazioni sparse che convergono;
- passaggio da ricetta a output;
- contesto attenuato attorno a una decisione;
- livelli di profondità senza divisori duri.

### Nitidezza differenziale

Il contrasto tra area sfocata e area nitida è più importante della quantità di
blur. La zona nitida deve contenere l’informazione che dimostra il valore.

### Colore sepolto

Ciano, cobalto, violetto e albicocca possono vivere dietro vetro o membrane.
Non diventano il colore pieno di card operative.

### Superficie satinata

I pannelli focali possono combinare:

- opacità media;
- blur forte;
- highlight interno;
- bordo morbido;
- contenuti interni più opachi.

## Cosa adattare

- Ridurre saturazione e rosa rispetto alla reference mobile.
- Sostituire fotografia wellness con dati professionali realistici.
- Usare copy breve e leggibile sopra vetro.
- Rendere archi e distorsione dipendenti dal flusso ricetta → output.
- Ridurre il raggio dei pannelli nel workspace.
- Evitare device chrome decorativo quando riduce la dimensione della demo.

## Cosa escludere

- Blur applicato direttamente al testo operativo.
- Form sovrapposti a fotografie rumorose.
- Palette rosa/lilla dominante.
- Estetica yoga, social o lifestyle.
- Glow neon e gradienti senza relazione con uno stato.
- Decorazioni a farfalla, blob o simboli non funzionali.
- Contrasto affidato esclusivamente al pannello traslucido.

## Applicazione alla hero

1. Headline e CTA restano su un piano nitido.
2. La lente occupa il punto visuale dominante senza coprire l’intero viewport.
3. Fuori dalla lente compaiono frammenti leggibili solo come contesto:
   documento, foglio, messaggio, allergene duplicato.
4. Dentro la lente compare una ricetta reale e i suoi output collegati.
5. Gli archi indicano il passaggio tra input e output.
6. Il colore resta sotto membrane bianche e non compete con il copy.

## Applicazione al workspace

- `Lens`: onboarding, preview e dettaglio selezionato.
- `Veil`: dialog, drawer e focus mode.
- `Divider`: topbar, bottom bar e pannelli contestuali.
- `Depth`: shell ed empty state, senza blur ripetuto nelle liste.
- `Glow`: focus e successo eccezionale, non stato ordinario.

## Anti-pattern

- Copiare valori visuali senza conoscere il contenuto sottostante.
- Trattare una reference marketing come specifica di una dashboard.
- Derivare token definitivi da screenshot raster.
- Riprodurre marchi, copy o asset delle reference.
- Confondere distorsione con leggibilità ridotta.

## Esempio

Corretto:

> Derivare dagli archi osservati una membrana Qoovex che rende nitida la
> relazione tra ricetta e menu, usando contenuti e proporzioni originali.

Errato:

> Ricostruire lo screenshot mobile con la stessa palette rosa-violetta e
> applicarlo al workspace.

## Impatto sul marketing

Le reference autorizzano una hero più sperimentale, purché la prova di prodotto
rimanga reale e il resto della landing torni sobrio.

## Impatto sul workspace

Le reference forniscono principi di focus e separazione, non un modello per
rendere trasparenti tutte le superfici.

## Rischi tecnici

- Le intensità percepite dipendono dal background.
- Screenshot compressi non permettono di stimare noise e alpha.
- La distorsione reale può richiedere tecniche costose.
- L’effetto può cambiare molto tra browser e display.

## Richiede conferma

- Tecnica finale della rifrazione.
- Quantità di distorsione ammessa nella hero.
- Contenuto realistico usato nel prototipo.
- Eventuale acquisizione di ulteriori reference con licenza chiara.

## Checklist

- [ ] Evidenze e inferenze sono separate.
- [ ] Nessun asset esterno è stato copiato.
- [ ] Gli elementi lifestyle sono esclusi.
- [ ] La firma è collegata al posizionamento.
- [ ] Il workspace adotta principi, non spettacolarità.
- [ ] I valori finali verranno misurati in un prototipo reale.
