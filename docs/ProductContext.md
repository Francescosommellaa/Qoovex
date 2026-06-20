# Product Context — Qoovex Pre-Service Brain

## Missione

Qoovex è l’assistente operativo per strutture eventi. Prima del servizio trasforma eventi, menu, numeri, allergeni e regole interne in calcoli verificabili, briefing e preparazioni approvate.

La domanda guida è: **cosa serve, cosa manca e quale regola produce questo numero?**

## Utenti

- Event intake: inserisce l’evento in testo libero e verifica l’estrazione.
- Direzione: individua eventi incompleti, conflitti e criticità future.
- Chef: valuta quantità proposte, decide margini, priorità, assegnazioni e date.
- Brigata: vede solo preparazioni approvate e registra produzione e posizione.
- Sala: riceve un briefing pre-servizio con timing, note e vincoli pertinenti.

## Autorità e privacy

- Admin/Direttore: accesso completo alla propria struttura; invita e revoca capi reparto.
- Capo sala: esclusivamente briefing e dati necessari alla sala.
- Capo cucina: pianificazione cucina, produzione e gestione brigata.
- Brigata: soltanto piani approvati e assegnati dal Capo cucina.
- Super Admin Qoovex: supporto temporaneo con MFA, motivo, banner e audit.

Il codice struttura identifica il tenant ma non autentica. Ogni autorizzazione è
verificata lato server con default deny e proiezioni distinte per reparto.

## Modalità

1. **Setup:** insegna grammature, rese, vassoi, pezzi, margini, arrotondamenti ed eccezioni.
2. **Pre-Service:** struttura gli eventi, calcola, propone, genera briefing e segnala mancanze.
3. **Service:** consulta allergeni, eventi in corso, prossima portata e note critiche; non richiede aggiornamento continuo.

## Dentro la prima direzione

Intake testuale, revisione dati, regole interne, calcoli tracciabili, piano preparazioni futuro, approvazione chef, task brigata, briefing cucina/sala, criticità e separazione tra quantità teoriche e verificate.

## Fuori

KDS, gestione live complessa, CRM, fatture, POS, payroll, HACCP completo, magazzino contabile, fornitori completi, marketplace e app cliente.

## Criterio di riuscita

In meno di 30 secondi lo chef riconosce eventi futuri, lavoro anticipabile, richiesto, approvato, prodotto, mancante, teorico e da verificare. Nessun numero viene presentato come certo senza dati e regola visibili.
