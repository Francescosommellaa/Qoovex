# Sirio App Router

Scopo: entrypoint App Router di Sirio.

Metti qui:
- `layout.tsx`, `page.tsx`, `globals.css` e componenti strettamente legati alla shell della documentazione;
- file che orchestrano le sezioni, non i componenti di design system condivisi.

Non mettere qui:
- primitive di UI riusabili;
- sezioni lunghe di showcase: vanno in `../sections`.

Regole:
- `page.tsx` deve comporre, non contenere tutta la documentazione inline;
- i file `sirio-*.tsx` in questa cartella sono shell/pattern locali dell'app;
- ordina i file secondo `docs/CodePatterns.md`.
