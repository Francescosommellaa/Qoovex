# Qoovex

Qoovex e il sistema operativo exception-driven per documenti, scadenze e prove di cantiere destinato a piccole imprese, subappaltatori, artigiani e consulenti.

Il Workspace autenticato esegue quattro processi persistenti e deterministici: ricezione documento, creazione lavoratore, creazione cantiere e controllo continuo. Le persone lavorano soprattutto su eccezioni, decisioni e risultati. Qoovex organizza e prepara contenuti per revisione: non garantisce conformita, non certifica persone o documenti e non sostituisce valutazioni professionali.

## Stato attuale verificato

- `apps/workspace`: prodotto Next.js con Centro operativo, motore persistente, auth, MFA, inviti, API protette, supporto auditato e Console Qoovex.
- `apps/web`: sito pubblico, contenuti marketing e pagine legali.
- `apps/sirio`: catalogo e prova tecnica del design system; non ospita logica operativa.
- `apps/mobile`: placeholder per una futura app mobile.
- `packages/db`: Prisma, client, schema e dieci migration canoniche nel repository.
- `packages/types`: ruoli, permessi e DTO platform-neutral, inclusi i contratti operativi minimizzati.
- `packages/ui`: foundation condivisa shadcn `base-nova`, Base UI, Tabler, Geist e tema light/dark/system, invariata in Fase 3.
- `packages/brand-resources`: asset SVG proprietari condivisi.

Il dominio attivo comprende Aziende, lavoratori, cantieri, documenti e versioni private, requisiti, scadenze, calendario, checklist, prove, pacchetti, share link, notifiche, audit, supporto e data-control. Il motore aggiunge processi, step, eventi, decisioni, eccezioni, artifact reference, snapshot di regole ed effect receipt senza duplicare i contenuti file.

## Confini della Fase 3

- Registry server-side versionato con `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1` e `CONTINUOUS_CONTROL@1`.
- Runner protetto da `CRON_SECRET`, claim atomico, lease di cinque minuti, fencing, cinque tentativi massimi e backoff 1/5/15/60 minuti.
- Automazione solo per azioni `LOW`, deterministiche e reversibili con affidabilita `VERIFIED/HIGH`; gli altri casi aprono decisioni, eccezioni o restano vietati.
- Timeline operativa append-only separata dall'audit tecnico minimizzato.
- Ingresso universale come composizione dei flussi autorizzati esistenti, non come endpoint generico.
- OCR, AI, ricerca universale, nuovi canali, retention automatica, SLA e limiti commerciali restano decisioni aperte.

## Regole

- Il codice, `packages/db/prisma/schema.prisma` e i manifest descrivono lo stato implementato.
- La documentazione canonica e la sequenza `docs/00_PRODUCT_AND_SCOPE.md`-`docs/08_SUPPORT_AND_DATA_CONTROL.md`.
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
