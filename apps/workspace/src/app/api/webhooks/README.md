# Webhooks API

Scopo: ingresso dei webhook esterni verso il workspace.

Metti qui:
- route handler di provider esterni e validazione delle firme.

Non mettere qui:
- endpoint usati dal frontend applicativo;
- logica di dominio che puo` essere richiamata da piu` webhook.

Regole:
- una sottocartella per provider;
- documenta sempre chiaramente la provenienza del webhook.
