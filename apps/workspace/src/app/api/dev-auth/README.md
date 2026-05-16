# Dev Auth API

Endpoint locale per creare una sessione di sviluppo tramite cookie `httpOnly`.

Regole:
- risponde solo con `NODE_ENV=development`;
- in produzione restituisce `404`;
- la destinazione viene limitata allo stesso origin.

