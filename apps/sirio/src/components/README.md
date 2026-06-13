# Sirio Components

Composizioni app-local usate esclusivamente per documentare e validare
`@qoovex/ui`.

## Può contenere

- specimen di token e primitive;
- composizioni dimostrative non collegate a dati reali;
- copy di revisione e criteri di approvazione;
- layout responsive del laboratorio.

## Non può contenere

- nuove primitive alternative a `packages/ui`;
- componenti di dominio o feature;
- business logic, auth o accesso dati;
- API visuali che i consumer dovrebbero importare.

Sirio compone la fonte condivisa; non diventa una seconda libreria UI.
