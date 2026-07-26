# Qoovex

Qoovex e il sistema operativo exception-driven per documenti, scadenze e prove di cantiere destinato a piccole imprese, subappaltatori, artigiani e consulenti.

La direzione approvata e prendere in carico obiettivi operativi, eseguire automaticamente gli step deterministici e reversibili e mostrare alle persone soprattutto eccezioni, decisioni e risultati. Qoovex organizza e prepara contenuti per revisione: non garantisce conformita, non certifica persone o documenti e non sostituisce valutazioni professionali.

## Stato attuale verificato

- `apps/workspace`: prodotto Next.js con dashboard situation-centric, auth, MFA, inviti, supporto auditato, API e Console Qoovex.
- `apps/web`: sito pubblico, contenuti marketing e pagine legali.
- `apps/sirio`: catalogo e prova tecnica del design system.
- `apps/mobile`: placeholder per una futura app mobile.
- `packages/db`: Prisma, client, schema e nove migration canoniche nel repository.
- `packages/types`: ruoli, permessi e DTO platform-neutral.
- `packages/ui`: foundation condivisa shadcn `base-nova`, Base UI, Tabler, Geist e tema light/dark/system.
- `packages/brand-resources`: asset SVG proprietari condivisi.

Il dominio attivo comprende Aziende, lavoratori, cantieri, documenti e versioni private, requisiti, scadenze, calendario, checklist, prove, pacchetti, share link, notifiche, audit, supporto e data-control. Non esistono ancora processi persistenti, eccezioni di processo, timeline operativa, ingresso o ricerca universali, OCR o AI documentale.

## Direzione approvata

- Il dominio rimane ricco, ma diventa fonte, risultato e dettaglio dei processi.
- `Da fare` evolve nel centro operativo per decisioni, processi in corso, blocchi e risultati.
- Un ingresso universale sostituisce progressivamente le azioni CRUD globali.
- Regole validate e versionate guidano l'automazione deterministica.
- Affidabilita, impatto, reversibilita e autorizzazione determinano se agire, chiedere conferma o bloccare.
- Timeline operativa e audit tecnico restano separati.

Questa direzione e documentata ma non implementata. Nomi delle entita processo, schema, migration, runner, soglie, provider, retention, policy e ruoli decisionali restano hard stop.

## Regole

- Il codice, `packages/db/prisma/schema.prisma` e i manifest descrivono lo stato implementato.
- La documentazione canonica e la sequenza `docs/00_PRODUCT_AND_SCOPE.md`–`docs/08_SUPPORT_AND_DATA_CONTROL.md`.
- Auth, Azienda, ruolo, permessi e resource scope derivano sempre dal server.
- Le app non si importano tra loro; le composizioni di dominio restano app-locali.
- Prisma conserva dati e metadati; Vercel Blob privato conserva file binari.
- Nessun requisito normativo, scadenza ufficiale, provider o promessa legale viene inventato.

## Comandi

`pnpm dev` avvia o riusa Prisma Postgres locale `qoovex-local` prima delle app e rifiuta target remoti.

```bash
pnpm install
pnpm dev
pnpm check:fast
pnpm check
```
