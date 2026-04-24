# Clerk Webhook

Scopo: handler dei webhook Clerk.

Metti qui:
- verifica firma, parsing payload e delega al bootstrap o sync utente.

Non mettere qui:
- logica email, billing o altri provider;
- codice generico non legato a Clerk.

Regole:
- mantieni il provider boundary netto;
- se il flusso cresce, estrai funzioni server nel layer corretto.
