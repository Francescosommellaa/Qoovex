# Workspace UX Principles

## Scopo

Definire regole di comportamento per la futura app Qoovex. Il documento non
prescrive schermate o componenti: impedisce flussi che spezzano il percorso
ricetta → output → operatività.

## Principi trasversali

**Decisione proposta**

1. La ricetta è la base, non una sezione isolata.
2. L’utente deve vedere il prossimo output utile, non tutto il prodotto.
3. Automazione assistita significa risultato controllabile.
4. Informazioni incerte devono dichiarare fonte e stato.
5. I membri operativi vedono meno complessità del creator.
6. La creazione parte semplice e cresce per approfondimento progressivo.
7. Le azioni distruttive o irreversibili richiedono conseguenze esplicite.
8. Limiti e permessi devono essere spiegati nel momento in cui diventano
   rilevanti.

## Decisioni

**Decisione proposta**

- La futura app privilegia il prossimo output utile.
- Il creator e il membro operativo hanno complessità differenti.
- Automazione, stato di verifica e controllo umano sono sempre distinguibili.
- Le aree secondarie non interrompono il percorso di attivazione.

## Ricette

| Criterio | Regola |
| --- | --- |
| Scopo UX | Creare una fonte professionale riusabile. |
| Azione principale | Creare, completare o aggiornare una ricetta. |
| Errore da evitare | Trattarla come un post o un documento libero. |
| Momento di valore | La ricetta genera il primo output senza reinserire dati. |
| Non mostrare presto | Pubblicazione, like, fork e dettagli secondari. |
| Automatizzare | Normalizzazione, calcoli derivati e suggerimenti verificabili. |
| Controllo utente | Ingredienti, quantità, istruzioni, visibilità e correzioni. |
| Regola di copy | Usare “ricetta”, “ingredienti”, “porzioni”, “preparazione”. |
| Criterio di successo | Primo output creato dalla ricetta nella stessa sessione. |

**Decisione proposta**

Il flusso iniziale richiede solo i dati necessari a rendere la ricetta
riusabile. I dettagli avanzati vengono chiesti quando producono valore.

## Menu

| Criterio | Regola |
| --- | --- |
| Scopo UX | Comporre un output professionale a partire da ricette esistenti. |
| Azione principale | Selezionare e ordinare ricette nel menu. |
| Errore da evitare | Trasformare il flusso in un editor grafico libero. |
| Momento di valore | Il menu è pronto senza ricopiare titolo e allergeni. |
| Non mostrare presto | QR custom, pubblicazione avanzata e personalizzazione. |
| Automatizzare | Riportare dati derivati dalle ricette. |
| Controllo utente | Sezioni, ordine, descrizione, visibilità e verifica finale. |
| Regola di copy | Distinguere “componi” da “disegna”. |
| Criterio di successo | Menu creato usando almeno una ricetta senza duplicazione manuale. |

## Allergeni

| Criterio | Regola |
| --- | --- |
| Scopo UX | Ridurre lavoro manuale mantenendo trasparenza e verifica. |
| Azione principale | Controllare e confermare le informazioni. |
| Errore da evitare | Presentare il risultato come infallibile o certificato. |
| Momento di valore | L’utente individua rapidamente allergeni e dati incerti. |
| Non mostrare presto | Dettagli tecnici non necessari alla decisione. |
| Automatizzare | Aggregazione e inferenza assistita da ingredienti. |
| Controllo utente | Revisione, correzione e decisione di pubblicazione. |
| Regola di copy | “Rilevato”, “da verificare”, “confermato”; evitare “garantito”. |
| Criterio di successo | Nessun dato incerto viene pubblicato come certo. |

## Nutrizione

| Criterio | Regola |
| --- | --- |
| Scopo UX | Offrire informazioni utili e comprensibili derivate dagli ingredienti. |
| Azione principale | Consultare e verificare i valori. |
| Errore da evitare | Mostrare precisione fittizia o equivalenza con analisi certificata. |
| Momento di valore | L’utente comprende valore, intervallo e provenienza. |
| Non mostrare presto | Metriche che non servono al job corrente. |
| Automatizzare | Calcoli e aggregazioni coerenti con porzioni e quantità. |
| Controllo utente | Ingredienti di partenza e revisione dei dati. |
| Regola di copy | Dichiarare “stima” o “intervallo” quando applicabile. |
| Criterio di successo | L’utente interpreta correttamente precisione e limiti. |

## QR Code

| Criterio | Regola |
| --- | --- |
| Scopo UX | Rendere accessibile un menu già pronto. |
| Azione principale | Generare o condividere il QR del menu. |
| Errore da evitare | Trattare il QR come prodotto principale. |
| Momento di valore | Il menu è raggiungibile dal dispositivo del cliente. |
| Non mostrare presto | Personalizzazione Pro prima che il menu esista. |
| Automatizzare | Generazione e collegamento alla versione pubblicabile. |
| Controllo utente | Scelta del menu, stato pubblico e personalizzazione consentita. |
| Regola di copy | “Condividi il menu”; non “crea esperienze phygital”. |
| Criterio di successo | Il QR apre il menu corretto e aggiornato. |

## Lista della spesa

| Criterio | Regola |
| --- | --- |
| Scopo UX | Trasformare ricetta o menu in elenco operativo. |
| Azione principale | Generare e spuntare la lista. |
| Errore da evitare | Promettere acquisti, prezzi, fornitori o inventario. |
| Momento di valore | Ingredienti aggregati senza trascrizione. |
| Non mostrare presto | Export Pro prima della lista utilizzabile. |
| Automatizzare | Somma per ingrediente e unità compatibili. |
| Controllo utente | Correzioni, aggiunte e stato spuntato. |
| Regola di copy | “Lista della spesa”; evitare “procurement” o “magazzino”. |
| Criterio di successo | Lista generata più rapidamente del metodo manuale. |

**Fatto confermato**

La lista non gestisce prezzi nello scope corrente.

## Piano di lavoro

| Criterio | Regola |
| --- | --- |
| Scopo UX | Portare ricette e istruzioni nel lavoro condiviso. |
| Azione principale | Creator: crea task. Membro: consulta e completa. |
| Errore da evitare | Copiare un task manager generico o alterare i permessi. |
| Momento di valore | Un membro completa un task con il contesto corretto. |
| Non mostrare presto | AI, stock, timeline e scheduling di roadmap. |
| Automatizzare | Snapshot ricetta e notifica al creator. |
| Controllo utente | Creator controlla struttura e membri; membro controlla completamento. |
| Regola di copy | “Piano di lavoro”, “task”, “preparazione”, “completato”. |
| Criterio di successo | Membro agisce senza chiedere nuovamente istruzioni essenziali. |

**Fatto confermato**

- Solo il creator crea task.
- I membri completano task.
- Il completamento notifica il creator.
- Lo snapshot della ricetta è immutabile.
- Partecipare ai piani altrui è gratis e illimitato.

## Explore

| Criterio | Regola |
| --- | --- |
| Scopo UX | Trovare contenuti professionali riusabili. |
| Azione principale | Consultare e duplicare una ricetta pubblica. |
| Errore da evitare | Ottimizzare per engagement social consumer. |
| Momento di valore | Il contenuto diventa una base nel workspace personale. |
| Non mostrare presto | Feed, like e visibilità prima del valore core. |
| Automatizzare | Copia strutturata con collegamento all’origine. |
| Controllo utente | Pubblicazione, scelta del contenuto e modifica della copia. |
| Regola di copy | “Esplora”, “usa come base”, “pubblicato da”. |
| Criterio di successo | Il contenuto trovato viene riusato in un job professionale. |

## Notifiche

| Criterio | Regola |
| --- | --- |
| Scopo UX | Chiudere loop operativi che richiedono attenzione. |
| Azione principale | Aprire il contesto e decidere cosa fare. |
| Errore da evitare | Creare un feed passivo o rumoroso. |
| Momento di valore | L’utente capisce evento, conseguenza e azione. |
| Non mostrare presto | Notifiche promozionali o di engagement. |
| Automatizzare | Eventi confermati come completamento task. |
| Controllo utente | Lettura e future preferenze, se approvate. |
| Regola di copy | Soggetto + evento + contesto, senza formule vaghe. |
| Criterio di successo | L’utente raggiunge il contesto corretto senza cercarlo. |

## Onboarding

| Criterio | Regola |
| --- | --- |
| Scopo UX | Portare al primo output utile, non completare un tour. |
| Azione principale | Creare la prima ricetta e scegliere un output. |
| Errore da evitare | Spiegare tutte le feature o chiedere configurazioni organizzative. |
| Momento di valore | Ricetta trasformata in menu, lista o task. |
| Non mostrare presto | Explore, piani avanzati, impostazioni, Enterprise e roadmap. |
| Automatizzare | Esempi, dati precompilati e suggerimento del prossimo passo. |
| Controllo utente | Scegliere caso d’uso, saltare elementi non necessari e correggere dati. |
| Regola di copy | Istruzioni brevi orientate al risultato. |
| Criterio di successo | Primo output nella prima sessione senza assistenza umana. |

### Percorsi di onboarding

**Decisione proposta**

- Consulente/freelance: prima ricetta → menu cliente.
- Ristorante: prima ricetta → menu o Piano di lavoro.
- Catering: prima ricetta/menu → lista.
- Membro invitato: apri piano → consulta task → completa.

## Regole

- Non bloccare l’utente con tour obbligatori.
- Non mostrare un’area finché non esiste un oggetto che la renda utile.
- Ogni empty state propone un’azione coerente con il job.
- Gli upgrade spiegano il valore bloccato, non solo il nome del piano.
- Lo stato di verifica è parte dell’informazione, non un dettaglio tecnico.
- Mobile e contesto cucina saranno requisiti da validare prima della UI.

## Esempi

Corretto:

> “Aggiungi una ricetta al menu. Allergeni e dati disponibili verranno
> riportati per la verifica.”

Errato:

> “Lascia che Qoovex faccia tutto automaticamente.”

## Anti-pattern

- Dashboard come primo valore.
- Modali di upgrade prima che l’utente capisca il job.
- Navigazione che presenta nove moduli equivalenti.
- Dati stimati senza stato.
- Task modificabili da ruoli non autorizzati.
- Onboarding basato su feature tour.

## Punti da validare

- Dispositivo e condizioni d’uso in cucina.
- Tempo accettabile per creare la prima ricetta.
- Output preferito come primo valore.
- Quantità minima di dati richiesta.
- Comprensione dello stato di verifica.

## Checklist finale

- [ ] Ogni area ha un’azione principale.
- [ ] È definito il momento di valore.
- [ ] Automazione e controllo utente sono separati.
- [ ] I permessi del Piano di lavoro sono preservati.
- [ ] Roadmap e feature secondarie non appaiono troppo presto.
- [ ] Il criterio di successo è osservabile.
