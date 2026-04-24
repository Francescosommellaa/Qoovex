# Shared Actions

Scopo: server actions e azioni cross-cutting della workspace app.

Metti qui:
- server actions usate da piu` punti dell'app;
- bootstrap e sincronizzazioni applicative condivise.

Non mettere qui:
- action specifiche di una sola feature se hanno un dominio chiaro;
- utility pure che non sono action.

Regole:
- una action per file con nome verbo-oggetto;
- validazione e side effect espliciti.
