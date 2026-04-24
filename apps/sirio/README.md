# Sirio App

Scopo: app dedicata al design system Qoovex. Serve a mostrare token, componenti e pattern di `@qoovex/ui`.

Metti qui:
- pagine demo, shell di navigazione, sezioni showcase e composizioni di documentazione visuale;
- codice necessario a raccontare o verificare il design system.

Non mettere qui:
- logica business del prodotto Qoovex;
- componenti condivisi veri: quelli vivono in `packages/ui`.

Regole:
- `src/app` compone la shell e la pagina della documentazione;
- `src/sections` contiene una sezione per pattern o componente del design system;
- se un pezzo diventa riusabile fuori da Sirio, spostalo in `packages/ui`.

Ordine file: segui `docs/CodePatterns.md`.
