# `/document-packages`

Pagina admin workspace per lista e creazione di pacchetti documentali. Usa solo API interne protette e non implementa destinatario esterno UI pubblica.

`?view=ready` filtra nella query tenant-scoped gli stati `READY_FOR_REVIEW` e `SHARED`, con paginazione server-side e senza letture per card.
