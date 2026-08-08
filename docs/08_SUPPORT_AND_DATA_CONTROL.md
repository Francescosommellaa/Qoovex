# 08 â€” Support and data control

## verified_current_state

Lâ€™inventory e gli export includono i modelli attuale senza token, hash, Blob key o IBAN completo. Gli owner Blob comprendono versioni file, prove, attachment, export, immagini immobili e avatar autorizzati. Lâ€™orphan scan pagina tutti gli oggetti e fallisce chiuso se manca un cursore.

## Export

Export `CLIENT` e `ORGANIZATION` sono distinti. Il cliente riceve timeline condivisa, step, richieste/proposte/consensi, pagamenti/ricevute autorizzate, documenti condivisi e riepilogo chiusura; lâ€™Azienda puÃ² includere contenuti interni autorizzati. ZIP e manifest sono streammati direttamente a Blob privato.

Lâ€™email non allega archivi pesanti: contiene riepilogo, identificatore e link opaco autenticato di 7 giorni. Lo scambio produce un grant hashato di 15 minuti. Lâ€™archivio Blob scade dopo 30 giorni salvo hold/preservation.

## PortabilitÃ  cliente

`/api/client/data-export` esporta profilo, immobili privati, collegamenti e partecipazioni dellâ€™utente senza dati interni delle Aziende. Lâ€™eliminazione account fisica non Ã¨ disponibile; restano export, revoca sessioni e sospensione secondo i flussi correnti.

## Supporto e dispute

Support Agent resta metadata-only e non legge file, note immobili private, IBAN o ricevute. Platform Admin non Ã¨ scorciatoia prodotto. Le dispute generano preservation; legal hold non amplia la visibilitÃ  e impedisce cleanup pertinente.

## Cancellazione

Archiviazione logica conserva dati, timeline ed export e rende il JobSite read-only. Cancellazione fisica di JobSite o account Ã¨ `hard_stop` fino a policy verificata su retention, legal hold, contenzioso, dati fiscali, prove, diritti e portabilitÃ .
