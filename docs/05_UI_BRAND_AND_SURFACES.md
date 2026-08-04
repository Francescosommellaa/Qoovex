# 05 — UI, brand and surfaces

## verified_current_state

La foundation visiva corrente resta invariata: shadcn base-nova, Base UI, Tabler, Tailwind v4, Geist/Geist Mono e token Qoovex. Le composizioni dominio sono app-local nel Workspace; nessun nuovo design system o brand è stato introdotto.

## Superficie Azienda

Home, lista cantieri e dettaglio vNext sono presenti e raggiungibili nel routing con Riepilogo, Timeline, Step, Richieste, Modifiche, Pagamenti, Persone, File, Chiusura e Impostazioni. La presenza delle azioni non prova l'uso end-to-end: la creazione produce oggi un responsabile `PENDING`, che blocca l'invito cliente protetto da actor `ACTIVE`.

## Superficie cliente

Home separata e dettaglio cliente sono presenti. Le query del dettaglio filtrano timeline e allegati condivisi, ma il lifecycle non è conforme al contratto perché l'accettazione dell'invito persiste oggi il participant cliente come `ACTIVE` prima della conferma iniziale. La UI non deve essere considerata verificata finché la vertical slice dedicata resta rossa.

## Form e stati

La validazione server-side e diversi stati UI sono presenti, ma errori field-level, focus, prevenzione double-submit e completezza degli stati non sono stati provati sistematicamente end-to-end. Nessuna capability deve essere classificata pronta sulla sola presenza di route, componenti o `testId` nel registry.

## Copy prudente

Il prodotto usa “confermato dalle parti”, “invio dichiarato”, “ricezione confermata dall’Azienda”, “conclusione stimata” e “IBAN indicato dall’Azienda”. Non promette conformità, collaudo, assenza difetti, pagamento garantito o validità legale.
