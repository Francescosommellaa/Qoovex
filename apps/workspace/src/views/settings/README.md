# Settings View

Scopo: composizione delle schermate impostazioni.

Metti qui:
- sezioni account, preferences, subscription e impostazioni utente.

Non mettere qui:
- routing auth;
- utility generiche o componenti shared.

Regole:
- mantieni chiari i confini tra settings e dominio `User`;
- se una parte diventa riusabile cross-view, estraila nel layer giusto.
- V1 read-only per profilo e piano.
