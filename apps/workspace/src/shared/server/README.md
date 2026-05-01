# Shared Server

Scopo: helper server-only interni alla workspace app.

Metti qui:
- funzioni che leggono o scrivono database;
- integrazioni server-side condivise tra route handler, layout e server action.

Non mettere qui:
- componenti React;
- codice importabile dal client;
- logica specifica di una singola feature.

Regole:
- importa `server-only` nei file che non devono finire nel bundle client;
- mantieni input espliciti e serializzabili quando una funzione viene chiamata da una server action.
