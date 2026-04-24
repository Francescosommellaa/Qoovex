# Code Patterns

Questa guida definisce il pattern trasversale del codice Qoovex. Ogni `README.md` locale di cartella lo estende con regole piu` specifiche.

## Workflow obbligatorio

Prima di creare o modificare codice:

1. leggi `docs/HowToUse.md`;
2. leggi `project_brain.json`;
3. leggi il `README.md` della cartella in cui stai entrando;
4. leggi i file reali gia` presenti nella feature o nel package coinvolto;
5. solo dopo scrivi codice.

## Regole trasversali

- naming file sempre in `kebab-case`, tranne file richiesti dal framework come `page.tsx`, `layout.tsx`, `route.ts`;
- una cartella deve avere una responsabilita` chiara;
- niente file vaghi come `helpers.ts`, `utils.ts`, `temp.ts`, `misc.ts` se il nome non spiega il dominio;
- se una cartella espone un'API pubblica, usa `index.ts` come entrypoint minimale;
- non lasciare logica business pesante dentro componenti React o route handlers;
- se il codice e` condiviso fra piu` app, spostalo in `packages/*`;
- se il codice e` riusato solo in un layer FSD, resta nel layer corretto;
- importa sempre verso il basso nell'architettura FSD.

## Ordine standard file TSX

Usa questo ordine per componenti, widget, view e sezioni UI:

1. direttive (`"use client"`) se servono;
2. import esterni (`react`, `next`, librerie);
3. import da alias di progetto e package condivisi;
4. import locali relativi;
5. tipi e interfacce esportate;
6. costanti, mappe statiche, config locali;
7. helper locali o sottocomponenti locali;
8. componente principale esportato;
9. `displayName` o export accessori finali.

Regole:

- il componente principale va in fondo al file, dopo costanti e helper;
- se un sottocomponente serve solo a quel file, tienilo locale sopra il componente principale;
- se un sottocomponente viene riusato cross-file, estrailo nella cartella corretta;
- niente funzioni anonime lunghe inline nel JSX se possono avere un nome chiaro.

## Ordine standard file TS server/lib

Usa questo ordine per `lib`, server actions, mapper, parser, utilita` pure:

1. import;
2. tipi e costanti;
3. guard/validator/parser locali;
4. funzione principale esportata;
5. helper piccoli privati in fondo, solo se migliorano lettura.

Regole:

- una funzione esportata principale per file, salvo file di soli tipi o soli costanti;
- se un file cresce troppo, dividi per responsabilita`, non per comodita`;
- niente accesso al database in file che dovrebbero restare puri.

## Ordine standard file `page.tsx` e `layout.tsx`

1. import;
2. `metadata` e `viewport` se servono;
3. tipi del componente;
4. funzione `Page` o `Layout`;
5. helper locali solo se strettamente necessari.

Regole:

- `page.tsx` resta sottile: compone `views`, `widgets` e `features`, non contiene flussi lunghi;
- `layout.tsx` definisce shell, provider e bootstrap globali, non UI di feature;
- niente query pesanti duplicate in piu` pagine se possono vivere in un layer piu` basso.

## Ordine standard file `route.ts`

1. import;
2. costanti e helper locali;
3. handler HTTP esportati (`GET`, `POST`, `PATCH`, `DELETE`);
4. utility locali private solo se davvero necessarie.

Regole:

- un route handler deve validare input, delegare la logica e restituire output;
- niente logica business lunga dentro la route;
- niente accesso a dipendenze client-side.

## Ordine standard file CSS

1. `@import`;
2. `@source` se richiesto;
3. regole globali o locali ordinate dalla piu` strutturale alla piu` specifica.

Regole:

- `packages/ui/styles/tokens.css` e` la singola fonte dei token;
- `packages/ui/styles/base.css` contiene il base layer condiviso;
- `apps/*/src/app/globals.css` deve restare minima e app-specifica.

## Ordine standard file Prisma

1. `generator`;
2. `datasource`;
3. enum;
4. model raggruppati per dominio;
5. dentro ogni model: campi scalari, relazioni, indici/unique.

Regole:

- `createdAt` e `updatedAt` stanno in fondo ai campi scalari;
- relazioni subito dopo i campi ID necessari;
- non mettere regole business applicative dentro lo schema.

## Regole di estrazione

- se qualcosa e` riusato solo nello stesso file, tienilo nello stesso file;
- se qualcosa e` riusato nella stessa cartella, estrailo nella cartella;
- se qualcosa e` riusato da piu` slice o app, valuta `packages/*`;
- non estrarre troppo presto: prima chiarezza, poi riuso vero.

## Regole di coerenza

- se aggiungi una nuova cartella sorgente manuale, aggiungi anche il suo `README.md`;
- se cambi il pattern di una cartella, aggiorna prima il suo `README.md` e poi il codice;
- se la convenzione cambia a livello repo, aggiorna anche `project_brain.json`.
