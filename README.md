# Qoovex

Qoovex e il sistema operativo exception-driven per documenti, scadenze, prove di cantiere e condivisioni verificabili destinato a piccole imprese, subappaltatori, artigiani e consulenti.

Il Workspace autenticato esegue cinque processi persistenti e deterministici: ricezione documento, creazione lavoratore, creazione cantiere, controllo continuo e preparazione di una condivisione. Le persone lavorano soprattutto su eccezioni, decisioni, review e risultati. Qoovex organizza e prepara contenuti per revisione: non garantisce conformita, non certifica persone o documenti e non sostituisce valutazioni professionali.

## Stato attuale verificato

- `apps/workspace`: prodotto Next.js con Centro operativo, motore persistente, auth, MFA, inviti, API protette, supporto auditato e Console Qoovex.
- `apps/web`: sito pubblico, contenuti marketing e pagine legali.
- `apps/sirio`: catalogo e prova tecnica del design system, inclusa la proof Fase 4; non ospita logica operativa.
- `apps/mobile`: placeholder per una futura app mobile.
- `packages/db`: Prisma, client, schema e sedici migration canoniche nel repository; la sedicesima (`20260728030000_operational_workspace_expansion`) e additiva e resta pendente finche il wrapper non riceve un backup reference verificabile.
- `packages/types`: ruoli, permessi e DTO platform-neutral, inclusi i contratti operativi minimizzati.
- `packages/ui`: foundation condivisa shadcn `base-nova`, Base UI, Tabler, Geist e tema light/dark/system; la Fase 4 aggiunge solo primitive generiche per ricerca, timeline e work queue.
- `packages/brand-resources`: asset SVG proprietari condivisi.

Il dominio attivo comprende Aziende, lavoratori, cantieri, documenti e versioni private, requisiti, scadenze, calendario, checklist, prove, pacchetti, share link, notifiche, audit, supporto e data-control. Il motore aggiunge processi, step, eventi, decisioni, eccezioni, artifact reference, snapshot di regole ed effect receipt senza duplicare i contenuti file.

## Stato Fase 4

- Registry server-side versionato con `DOCUMENT_RECEIVED@1`, `WORKER_CREATED@1`, `JOB_SITE_CREATED@1`, `CONTINUOUS_CONTROL@1` e `DOCUMENT_PACKAGE_SHARING@1`.
- Profilo azienda e contatti operativi, versioni documentali revisionate, documenti centrali collegabili a piu cantieri, assegnazioni storicizzate, prove classificate, richieste, messaggi e timeline contestuale.
- Fonti documentali v1 limitate a upload diretto e procedura manuale guidata; integrazioni generiche e AI restano disabilitate.
- Runner protetto da `CRON_SECRET`, claim atomico, lease di cinque minuti, fencing, cinque tentativi massimi e backoff 1/5/15/60 minuti.
- Automazione solo per azioni `LOW`, deterministiche e reversibili con affidabilita `VERIFIED/HIGH`; gli altri casi aprono decisioni, eccezioni o restano vietati.
- Ricerca server-side limitata ai metadati autorizzati; nessuna query e salvata negli URL o nel database.
- Timeline operativa tipizzata e append-only, aggregata per artifact e separata dall'audit tecnico minimizzato.
- Condivisioni basate su revisione immutabile, review umana, download opt-in e link legato alla revisione approvata.
- Ingresso universale come composizione dei flussi autorizzati esistenti, non come endpoint generico.
- OCR/AI, ricerca nei file o semantica, viste salvate, nuovi canali, retention automatica, SLA e limiti commerciali restano decisioni aperte.

## Regole

- Il codice, `packages/db/prisma/schema.prisma` e i manifest descrivono lo stato implementato.
- La documentazione canonica e la sequenza `docs/00_PRODUCT_AND_SCOPE.md`-`docs/08_SUPPORT_AND_DATA_CONTROL.md`.
- Auth e Azienda derivano sempre dal server; ruolo organizzativo, preset, permessi persistiti, scadenza e resource grant restano separati e default-deny.
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
