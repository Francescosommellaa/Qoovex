# Shared API

Scopo: adapter e funzioni di accesso dati condivise nella workspace app.

Metti qui:
- fetcher, client wrapper, serializer e adapter usati da piu` feature/view dell'app.

Non mettere qui:
- route handlers Next;
- query specifiche di una sola feature se non sono riusate.

Regole:
- separa trasporto, parsing e mapping;
- niente JSX in questa cartella.
