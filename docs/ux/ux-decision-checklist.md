# UX Decision Checklist

## Scopo

Fornire un gate obbligatorio prima di approvare landing, flussi, copy, nuove
feature o materiali dimostrativi.

## Regole

- Compilare solo i gate pertinenti, senza saltare condizioni di blocco.
- Allegare la fonte delle affermazioni verificate.
- Motivare ogni eccezione e assegnare un owner.
- Respingere una proposta se richiede capacità non confermate.
- Aggiornare il documento canonico dopo l’approvazione.

## Gate 1: Contesto

- [ ] È stato richiamato il contesto tramite MCP `qoovex_brain`.
- [ ] Sono stati letti business rule, README locale e stato reale.
- [ ] La decisione non modifica implicitamente DB, architettura, billing o
  permessi.
- [ ] La fonte canonica dei piani è `packages/config/plan_rules.json`.
- [ ] La feature ha uno stato esplicito.

**Blocco:** fermarsi se una decisione UX richiede una business rule nuova.

## Gate 2: Target

- [ ] La decisione serve la nicchia primaria o una nicchia secondaria
  dichiarata.
- [ ] È chiaro se l’utente è buyer, utente primario o membro operativo.
- [ ] Il messaggio esclude implicitamente consumer e gestionali enterprise.
- [ ] La persona cambia davvero copy, flusso o priorità.
- [ ] Le ipotesi di conversione sono indicate come tali.

## Gate 3: Comprensione

- [ ] Un utente comprende l’azione senza spiegazione orale.
- [ ] Ogni blocco ha un messaggio dominante.
- [ ] I termini sono quelli del lavoro in cucina.
- [ ] “Workspace” è accompagnato da una spiegazione concreta dove necessario.
- [ ] Nessun testo usa gergo SaaS come sostituto del valore.

## Gate 4: Flusso prodotto

- [ ] La decisione rafforza ricetta → output → operatività.
- [ ] È definita l’azione principale.
- [ ] È definito il momento di valore.
- [ ] Il prossimo passo è visibile.
- [ ] Le feature secondarie non appaiono prima del valore core.
- [ ] Il membro operativo vede solo le azioni consentite.

## Gate 5: Automazione e fiducia

- [ ] È chiaro cosa viene calcolato, rilevato o suggerito.
- [ ] È chiaro cosa deve verificare l’utente.
- [ ] Fonte, incertezza e stato sono visibili quando rilevanti.
- [ ] Allergeni e nutrizione non sono presentati come certificati o infallibili.
- [ ] Nessuna roadmap AI è descritta come disponibile.

## Gate 6: Landing

- [ ] La hero risponde a cos’è, per chi è, problema, risultato e CTA.
- [ ] La headline parte da ricette e output.
- [ ] Il visual dimostra lo stesso dato che genera più output.
- [ ] Il primo scroll non è una griglia completa di feature.
- [ ] Proof e casi reali precedono il pricing.
- [ ] Sono dichiarati i confini rispetto a POS, ERP e app consumer.
- [ ] Explore, API, activity log e dettagli Enterprise restano fuori dalla hero.

## Gate 7: Piani

- [ ] Free comunica primo valore e partecipazione.
- [ ] Start comunica uso professionale ricorrente.
- [ ] Pro comunica uso intensivo e capacità confermate.
- [ ] Enterprise è un percorso custom, non una promessa generica.
- [ ] Prezzi approssimativi non sono pubblicati come definitivi.
- [ ] Il limite viene spiegato nel momento d’uso, non nascosto.

## Gate 8: Copy

- [ ] Il testo usa verbi e oggetti concreti.
- [ ] Non usa “all-in-one”, “rivoluzionario”, “next level” o equivalenti.
- [ ] Non promette gestione completa del ristorante.
- [ ] Non attribuisce capacità autonome all’AI.
- [ ] La CTA descrive un’azione.
- [ ] Errori e successi indicano cosa fare dopo.

## Gate 9: Feature

- [ ] La matrice di `feature-prioritization.md` è compilata.
- [ ] Le domande 3, 4 e 8 non hanno punteggio zero.
- [ ] Il job e il segmento sono espliciti.
- [ ] Il valore può emergere in tempi proporzionati.
- [ ] Non esiste una soluzione più semplice nel prodotto corrente.
- [ ] La feature non cerca di imitare un competitor fuori categoria.

## Gate 10: Materiali prima della UI

- [ ] Esiste un dataset realistico e coerente.
- [ ] Esiste un caso completo della nicchia primaria.
- [ ] Esiste uno storyboard del flusso core.
- [ ] Screenshot e video mostrano solo capacità reali.
- [ ] Le testimonianze sono verificate.
- [ ] Le proof di allergeni e nutrizione spiegano limiti e controllo.
- [ ] La tabella piani deriva dalla fonte canonica.

## Gate 11: Validazione

- [ ] Il test dei cinque secondi ha una soglia definita.
- [ ] La nicchia primaria è confrontata con almeno un’alternativa.
- [ ] Buyer e membri operativi sono inclusi nella ricerca.
- [ ] I test osservano comportamenti, non solo preferenze dichiarate.
- [ ] Ogni punto da validare può cambiare una decisione concreta.
- [ ] I risultati sono registrati senza trasformare opinioni isolate in fatti.

## Decisione finale

Una proposta può essere approvata solo se:

- non attiva alcuna condizione di blocco;
- supera tutti i gate pertinenti;
- dichiara le eccezioni residue;
- assegna un owner ai punti da validare;
- indica quale documento canonico deve essere aggiornato.

## Esempio

Proposta:

> Inserire “food cost” nella hero.

Esito:

> **Respinta.** Non è una capacità confermata, sposta Qoovex verso ERP e non
> rafforza il flusso attuale.

## Anti-pattern

- Approvare per gusto personale.
- Saltare un gate perché la modifica è “solo copy”.
- Usare una feature roadmap in mockup o video.
- Creare proof con dati inventati.
- Considerare il punteggio della matrice una decisione automatica.

## Punti da validare

- Owner e frequenza del review UX.
- Strumento in cui archiviare evidenze di ricerca.
- Metriche di attivazione disponibili quando la UI esisterà.
- Frequenza di revisione competitor.

## Checklist finale

- [ ] Tutti i gate pertinenti sono compilati.
- [ ] Le condizioni di blocco sono risolte.
- [ ] Fatti, ipotesi e decisioni sono separati.
- [ ] Sono indicate proof e validazioni mancanti.
- [ ] La decisione aggiorna la fonte corretta.
- [ ] Nessuna scelta visuale è stata introdotta implicitamente.
