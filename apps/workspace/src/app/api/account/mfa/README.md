# MFA API

Stato, challenge e ciclo di vita MFA dell'utente autenticato.

- `GET` usa l'identita primaria e restituisce stato e soddisfazione della sessione.
- `POST` avvia il setup solo con codice email, fattore corrente o recupero approvato.
- `DELETE` richiede sempre il fattore corrente e revoca tutte le sessioni.

Le route figlie gestiscono enrollment email, conferma TOTP, backup code, asserzione di sessione e recupero autonomo. Nessuna risposta espone secret attivi, hash o audit metadata interni.
