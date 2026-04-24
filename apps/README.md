# Apps

Questa cartella contiene solo applicazioni eseguibili del monorepo.

Metti qui:
- app finali come marketing site, workspace prodotto, playground o design system app;
- codice specifico di runtime, routing, provider e asset solo dell'app.

Non mettere qui:
- codice condiviso fra piu` app: va in `packages/*`;
- regole globali del repo: vanno in `docs/*`.

Regole:
- ogni app deve avere un `README.md` locale che ne definisce ruolo e confini;
- niente duplicazione di componenti condivisibili gia` estraibili in `packages`;
- `public/` contiene solo asset specifici dell'app.
