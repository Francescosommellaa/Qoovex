# Feature Prioritization

## Scopo

Fornire un gate decisionale per comunicare, progettare o sviluppare feature
senza trasformare Qoovex in un gestionale generico.

## Matrice di valutazione

Assegnare a ogni domanda:

- `0`: no o non dimostrato;
- `1`: parzialmente;
- `2`: sì, in modo diretto.

| # | Domanda |
| --- | --- |
| 1 | Aiuta uno chef a lavorare meglio davvero? |
| 2 | Riduce passaggi manuali? |
| 3 | Rafforza ricetta → output → operatività? |
| 4 | È verticale per la cucina? |
| 5 | È comprensibile senza spiegazioni lunghe? |
| 6 | Può generare valore entro i primi minuti? |
| 7 | È coerente con i piani canonici? |
| 8 | Evita di trasformare Qoovex in un gestionale generico? |

## Decisioni

**Decisione proposta**

- Le feature core devono rafforzare ricetta → output → operatività.
- I punteggi sotto 13 richiedono validazione prima dell’implementazione.
- Le penalità bloccanti prevalgono sul punteggio totale.
- Le feature fuori dominio non entrano in roadmap per colmare gap competitivi.

### Interpretazione

- `13-16`: core o forte candidata, salvo vincoli tecnici e ricerca.
- `9-12`: secondaria; richiede un job e una prova chiari.
- `5-8`: da validare prima di progettare o sviluppare.
- `0-4`: evitare.

### Penalità bloccanti

**Decisione proposta**

La feature non procede, indipendentemente dal totale, se:

- la domanda 3 ottiene `0`;
- la domanda 4 ottiene `0`;
- la domanda 8 ottiene `0`;
- richiede nuove business rule, billing, permessi o schema senza decisione
  dedicata;
- viene giustificata solo con “lo fanno i competitor”.

## Valutazione del perimetro

I punteggi sono decisioni strategiche iniziali da rivedere con evidenze.

| Feature | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Totale | Decisione |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Ricette strutturate | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 16 | Core |
| Menu da ricette | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 16 | Core |
| Allergeni assistiti | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 15 | Core con proof |
| Lista da ricetta/menu | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 16 | Core |
| Piano collegato a ricette | 2 | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 14 | Core operativo |
| Nutrizione | 1 | 2 | 2 | 2 | 1 | 1 | 2 | 2 | 13 | Dopo il core |
| QR menu | 1 | 2 | 1 | 2 | 2 | 2 | 2 | 2 | 14 | Dopo il core |
| Notifiche operative | 1 | 1 | 1 | 1 | 2 | 0 | 2 | 2 | 10 | Supporto |
| Explore e fork | 1 | 1 | 1 | 2 | 1 | 1 | 2 | 2 | 11 | Dopo attivazione |
| Activity log | 1 | 1 | 1 | 1 | 1 | 0 | 2 | 2 | 9 | Piano avanzato |
| API access | 1 | 1 | 1 | 0 | 0 | 0 | 2 | 1 | 6 | Enterprise, non landing |
| PrepStock | 2 | 2 | 1 | 2 | 1 | 0 | 0 | 1 | 9 | Roadmap da validare |
| AI scheduling | 1 | 2 | 1 | 1 | 0 | 0 | 0 | 1 | 6 | Roadmap da validare |
| POS e pagamenti | 1 | 1 | 0 | 1 | 2 | 0 | 0 | 0 | 5 | Evitare |
| Contabilità | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 2 | Evitare |
| Magazzino completo | 1 | 2 | 0 | 2 | 1 | 0 | 0 | 0 | 6 | Evitare nello scope attuale |
| Chat generica AI | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 2 | Evitare |

## Categorie operative

### Feature core da comunicare subito

**Decisione proposta**

- Ricette strutturate.
- Menu derivati dalle ricette.
- Allergeni con controllo.
- Lista generata da ricetta o menu.
- Collegamento tra ricetta e Piano di lavoro.

### Feature da mostrare dopo

- Nutrizione.
- QR.
- Collaborazione e notifiche.
- Explore come riuso professionale.
- Feature Pro già confermate.

### Feature da non mettere nella landing

- API access.
- Supporto SLA.
- Activity log come messaggio generale.
- Dettagli auth e sicurezza non rilevanti alla comprensione iniziale.
- Recent searches.

### Feature da validare prima di sviluppare

- Importazione massiva delle ricette.
- Separazione logica per clienti nel workspace personale.
- PrepStock.
- Scheduling avanzato.
- Parsing o assistenza AI.
- Export aggiuntivi non presenti nei piani.

### Feature da evitare

- POS e pagamenti.
- Contabilità e fatturazione.
- Magazzino completo e acquisti.
- Turnistica generica.
- CRM e loyalty.
- Chat AI non legata a un job verificato.
- Feed social consumer.
- Editor grafico generalista.

## Processo decisionale

1. Scrivere il job e il segmento.
2. Verificare che non esista già una soluzione nel prodotto.
3. Compilare la matrice con evidenze.
4. Applicare le penalità bloccanti.
5. Identificare la business rule o il piano coinvolto.
6. Definire il primo momento di valore.
7. Progettare un test prima dell’implementazione quando il totale è sotto 13.
8. Registrare la decisione nel Brain se cambia scope o regole.

## Regole

- Una feature core non è automaticamente una feature da hero.
- Il punteggio non sostituisce ricerca, fattibilità o decisioni di business.
- Nessun piano viene modificato per far passare una feature.
- Le feature roadmap restano escluse dalla comunicazione v1.
- Il valore deve essere raggiungibile senza configurazione sproporzionata.

## Esempi

Corretto:

> “Importazione ricette: da validare perché riduce la barriera del job
> principale, ma richiede test su formati e qualità.”

Errato:

> “Aggiungiamo un calendario perché ogni SaaS professionale ne ha uno.”

## Anti-pattern

- Punteggio gonfiato senza evidenze.
- Feature richiesta da una sola persona trattata come strategica.
- Feature sviluppata per completare una dashboard.
- Nuovo modulo senza relazione con le ricette.
- Competizione diretta con ERP per ampliare il mercato.

## Punti da validare

- Peso reale di importazione e migrazione.
- Quale feature genera upgrade a Start.
- Quale capacità distingue Pro.
- Valore e frequenza di Explore.
- Domanda reale per roadmap Piano di lavoro avanzata.

## Checklist finale

- [ ] La matrice è compilata con motivazioni.
- [ ] Nessuna penalità bloccante è ignorata.
- [ ] Job, segmento e momento di valore sono espliciti.
- [ ] Business rule e piano sono verificati alla fonte.
- [ ] È definita la categoria: subito, dopo, non landing, validare o evitare.
- [ ] La feature non aumenta la confusione di posizionamento.
