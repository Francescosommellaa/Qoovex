# /invite

Route pubblica di ingresso per gli inviti Azienda inviati via email.

- valida il token senza esporre email, hash o dati tenant;
- conserva il link come callback durante accesso o registrazione;
- richiede una sessione valida e delega l'accettazione a `POST /api/organization/invitations/accept`;
- dopo l'accettazione richiede un nuovo accesso per applicare la membership aggiornata.
