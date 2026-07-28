# Calendar API

- `GET/POST /api/calendar/events`: legge o crea eventi e task soltanto con i permessi effettivi richiesti.
- `PATCH/DELETE /api/calendar/events/[eventId]`: aggiorna o archivia un impegno; l'assegnatario puo modificare soltanto il proprio stato.
- `POST /api/calendar/import`: importa fino a 200 VEVENT da un file iCalendar locale, massimo 512 KB.
- `GET /api/calendar/export`: esporta eventi autorizzati e scadenze in formato iCalendar.

Ogni accesso deriva Azienda e ruolo dal server. L'import non effettua fetch di URL esterni e non salva credenziali provider.
