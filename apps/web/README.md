# Web App

Sito marketing pubblico Qoovex costruito sul design system canonico condiviso.

## Responsabilita

- homepage pubblica, Pricing, Contattaci, Community e pagine legali/editoriali;
- contenuti prudenti e dimostrazioni di prodotto composte con primitive reali;
- SEO tecnico base e collegamento configurabile al workspace;
- cookie banner e contatti reali;
- tema light, dark e system con persistenza e controllo condiviso.

## Confini

- componenti, hook, utility e CSS di foundation provengono da `@qoovex/ui` tramite subpath espliciti;
- CSS app-local soltanto per layout e composizioni specifiche;
- asset proprietari da `@qoovex/brand-resources`;
- niente Prisma, auth workspace o servizi prodotto;
- niente testimonianze, prezzi, ricerche o promesse di conformita inventate; la pagina Pricing resta prudente finche i piani non sono validati.

## Comandi

```bash
pnpm --filter @qoovex/web type-check
pnpm --filter @qoovex/web build
```
