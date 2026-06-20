# Pre-Service Operations

## Ciclo operativo

1. Intake descrive un evento in testo libero.
2. Il sistema propone dati strutturati distinguendo confermato, incerto e mancante.
3. Una persona corregge e conferma prima di usare i dati nei calcoli.
4. Il motore seleziona una regola salvata o chiede il dato mancante una sola volta.
5. Ogni risultato mostra input, formula, regola, unità e arrotondamento.
6. Il sistema genera preparazioni consigliate per gli eventi futuri.
7. Lo chef approva o modifica quantità, margine, data, priorità e assegnatario.
8. La brigata registra quantità prodotta, posizione e nota opzionale.
9. Qoovex distingue sempre rimanenza teorica e quantità verificata fisicamente.
10. Cucina e sala ricevono briefing pre-servizio specifici.

## Modello concettuale

## Autorità e accesso

- Il Direttore crea la struttura e invita capi sala e cucina.
- Il Capo cucina invita la brigata e assegna soltanto piani approvati.
- Sala, cucina e brigata non possono aprire le viste degli altri reparti.
- Il supporto Qoovex usa sessioni di 30 minuti con MFA, motivo e audit.

- `StructureRule`: formula, contesto, unità, margine, arrotondamento, versione e autore.
- `StructuredEvent`: estrazione con campi confermati, mancanti e incerti.
- `CalculationTrace`: input, formula, regola, risultato e provenienza.
- `PreparationProposal`: quantità richiesta calcolata e motivazione.
- `ApprovedPreparation`: decisione dello chef e scostamento dalla proposta.
- `ProductionRecord`: quantità prodotta, posizione, autore e nota.
- `QuantitySnapshot`: richiesto, approvato, prodotto, assegnato/usato, teorico e verificato.
- `Briefing`: proiezione cucina o sala generata da dati strutturati.
- `OperationalIssue`: dato o regola mancante, conflitto o quantità insufficiente.

Sono concetti di UX e Sirio, non contratti persistenti.

## Regole e autorità

Precedenza: eccezione evento → menu/preparazione → tipo evento → regola generale. Un conflitto non viene risolto in silenzio. Margine e arrotondamento appartengono alla regola. Il sistema propone; lo chef decide e la differenza resta visibile.

## Fixture canonica

Comunione Rossi, 22 bambini. Regola: una cotoletta per bambino, margine 10%, arrotondamento superiore. Richieste 25; chef approva 35; brigata produce 38 in Frigo 2; assegnate 35; extra teoriche 3. Esito: **OK — verifica fisica consigliata**.

## Risposte operative

Risposta prima, dettaglio dopo, regola sempre visibile. Nessun entusiasmo, premessa o testo generico. Se una regola manca, Qoovex fa una domanda specifica e rende esplicito che il calcolo è bloccato.
