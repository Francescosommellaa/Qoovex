# 05 — UI, brand and surfaces

## verified_current_state

La foundation visiva corrente resta invariata: shadcn base-nova, Base UI, Tabler, Tailwind v4, Geist/Geist Mono e token Qoovex. Le composizioni dominio sono app-local nel Workspace; nessun nuovo design system o brand è stato introdotto.

## Superficie Azienda

Home con cantieri aperti, in attesa e chiusi; lista cantieri; dettaglio con Riepilogo, Timeline, Step, Richieste, Modifiche, Pagamenti, Persone, File, Chiusura e Impostazioni. Sono raggiungibili creazione, Collaborator, invito cliente, agreement, deleghe, profilo pagamento, allegati, proposte, pagamenti, dispute, chiusura, export e archivio secondo stato e permessi.

## Superficie cliente

Home separata con immobili, cantieri collegati/non collegati e azioni richieste. Il dettaglio espone soltanto la proiezione condivisa: riepilogo, timeline, step, richieste, modifiche, pagamenti, persone minimizzate, documenti condivisi e archivio. Prima della conferma iniziale mostra soltanto il riepilogo e le decisioni consentite.

## Form e stati

Le form hanno validazione runtime server-side, errori field-level, focus sul primo campo errato, prevenzione double-submit, feedback e conferme critiche. Pagine e pannelli usano loading/error/access-denied/empty state reali. Nessuna card `Presto`, route placeholder o capability futura è mostrata.

## Copy prudente

Il prodotto usa “confermato dalle parti”, “invio dichiarato”, “ricezione confermata dall’Azienda”, “conclusione stimata” e “IBAN indicato dall’Azienda”. Non promette conformità, collaudo, assenza difetti, pagamento garantito o validità legale.
