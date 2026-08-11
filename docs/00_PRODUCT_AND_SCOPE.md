# 00 â€” Product and scope

## verified_current_state

Qoovex Ã¨ lo spazio condiviso in cui unâ€™impresa gestisce un lavoro edile con il cliente, documentando avanzamento, step, modifiche, prove e pagamenti dalla creazione del cantiere alla chiusura.

Promessa allâ€™Azienda: documenta il lavoro una volta e usa gli stessi aggiornamenti per informare il cliente, gestire le modifiche e presentare richieste di pagamento.

Promessa al cliente: segui i lavori sulle tue case, controlla ogni modifica e conserva tutto ciÃ² che Ã¨ stato condiviso.

Il prodotto riunisce accordi, avanzamento, fotografie, prove, scontrini, richieste, pagamenti e conferme in una cronologia condivisa, strutturata, versionata e scaricabile.

## implemented_decision


Modello commerciale approvato: paga soltanto lâ€™Azienda; Collaborator incluso nellâ€™Azienda; cliente gratuito per i cantieri invitati. Il repository non implementa billing e non definisce prezzi, piani, trial, limiti, commissioni o entitlement.

## Implementato ma non ancora provato end-to-end

Account con una sola Azienda attiva, cantiere attuale, partecipanti, inviti cliente, immobili, agreement iniziale, timeline interna/condivisa, allegati, step opzionali, richieste, proposte e controproposte versionate, deleghe economiche, pagamenti documentati, dispute, chiusura reciproca, export, archivio, richieste post-chiusura, riapertura, ricerca metadata-only e notifiche hanno schema, servizi, route o superfici presenti. Non sono una dichiarazione di readiness. La sequenza creazione cantiere â†’ invito cliente â†’ conferma iniziale Ã¨ `present_but_blocked` finchÃ© i test rossi sul participant creatore e sul cliente attivato troppo presto non diventano verdi tramite un task runtime separato.

## conceptual_not_implemented

Più clienti principali o ruoli cliente differenziati, tecnici/delegati del cliente, pricing e billing, marketplace, ricerca imprese, preventivi comparativi, commissioni, pagamenti in-app, escrow, rimborsi, arbitrato, KYC, firma elettronica qualificata, fatturazione, contabilità, paghe, BIM, geolocalizzazione continua, sorveglianza, automazioni intelligenti, portfolio e recensioni pubbliche.

## hard_stop

Nessuna cancellazione fisica di cantiere o account; nessuna promessa di conformitÃ , collaudo, assenza difetti o validitÃ  legale; nessun deploy o migration remoto senza un task separato autorizzato.
