# `/document-packages`

Superficie Workspace “Condivisioni” per lista, creazione e preparazione dei pacchetti documentali. Usa API interne protette; la pubblicazione richiede una revisione completa e la conferma umana esplicita.

`?view=ready` filtra nella query tenant-scoped gli stati pronti o condivisi, con paginazione server-side e senza letture per card. La UI mostra inclusi, esclusi, mancanti, scaduti, da verificare, destinatario/finalita, scadenza e download prima di “Approva e crea link”. Una mutazione successiva non altera revisione o link gia approvati.
