# Web App

Sito marketing pubblico Qoovex, costruito sulla grammatica editoriale Traccia Operativa.

## Responsabilità

- homepage pubblica e pagine legali/editoriali;
- narrazione di frammento, traccia, vuoto indicizzato e prossima azione;
- dimostrazioni di prodotto autentiche e fotografie operative con diritti verificati;
- SEO tecnico base e collegamento configurabile al workspace;
- riuso della fondazione `@qoovex/ui` senza simulare il workspace.

## Confini

- niente Prisma, auth workspace o servizi prodotto;
- niente stock, mockup generici, testimonianze, prezzi o ricerche inventate;
- niente promesse di conformità, certificazione o validità legale;
- niente dark theme o librerie di animazione;
- in assenza di immagini approvate si usano prodotto e diagrammi, non riempitivi.

## Comandi

```bash
pnpm --filter @qoovex/web type-check
pnpm --filter @qoovex/web build
```
