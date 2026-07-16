# UI, brand and surfaces

## Decisione canonica

Il design definitivo di Qoovex adotta la direzione dello starter pubblico [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter), fissata al commit `0edc5cf631ac7a8280112fd2bcb80312597bafdf`.

La foundation scelta usa realmente:

- shadcn `base-nova` con componenti open code;
- Base UI per i comportamenti accessibili;
- Tabler Icons;
- Tailwind CSS v4 CSS-first;
- Geist e Geist Mono;
- tema Vercel con palette OKLCH, light, dark e preferenza di sistema;
- raggi, ombre, sidebar e token chart derivati dalla fonte fissata;
- asset proprietari Sirio, marketing e workspace consumati direttamente da `@qoovex/brand-resources`.

Gli avvisi MIT e la provenienza sono conservati in `apps/sirio/THIRD_PARTY_NOTICES.md`. Ogni futura adozione esterna deve registrare fonte, versione o commit e licenza compatibile.

## Stato della migrazione

La scelta estetica è definitiva. L'approvazione Sirio riguarda la qualità dell'adattamento Qoovex e precede qualunque modifica alle superfici produttive.

- `apps/sirio` è la sandbox indipendente della nuova foundation.
- `packages/ui` conserva temporaneamente la vecchia implementazione per continuità dei consumer produttivi. Non è più autorità progettuale.
- `apps/web` e `apps/workspace` continuano a usare la UI esistente fino all'approvazione della sandbox.
- “Traccia Operativa” è ritirata come direzione canonica e non governa nuovo lavoro.

Questa fase non crea due design pubblici: il sistema precedente è legacy operativo, mentre il nuovo sistema è l'unica direzione destinata alla promozione.

## Superfici Sirio

- `/`: catalogo di fondazioni e componenti, inclusi tipografia, colori, raggi, ombre, controlli, feedback e stati limite.
- `/marketing`: landing rappresentativa con contenuti prudenti e preview composta dal componente dashboard reale di Sirio.
- `/dashboard`: shell applicativa con sidebar desktop/mobile, header, breadcrumb, ricerca, tema, menu utente, metriche, grafico, coda operativa e stati loading, empty, error e overflow.

Sirio non importa `@qoovex/ui`, Fontshare, auth, Prisma, API o servizi prodotto. Consuma soltanto gli SVG canonici esposti da `@qoovex/brand-resources`; i dati mostrati sono statici e dichiarati come dimostrativi.

## Contratto visivo corrente

- Font: Geist per testo e interfaccia, Geist Mono per dati e riferimenti.
- Tema: Vercel quasi invariato, governato da token semantici OKLCH.
- Modalità: light, dark e system con persistenza client e prevenzione del flash tramite `next-themes`.
- Icone funzionali: soltanto Tabler nel nuovo sistema. I marchi proprietari provengono da `@qoovex/brand-resources`: stella Sirio nel catalogo, marchio Qoovex nero nel marketing e marchio workspace bianco su nero nella dashboard.
- Componenti: sorgenti shadcn `base-nova` possedute localmente da Sirio durante l'approvazione.
- Semantica delle azioni: `Button` e i trigger Base UI sono riservati alle azioni; la navigazione usa sempre un `<a>` reale e può adottare `buttonVariants` soltanto per l'aspetto.
- Copy: stato documentale, elementi presenti, mancanti o da verificare e pacchetti pronti per revisione. Nessuna promessa di conformità, certificazione o validità legale.

## Motion canonica

Sirio include la motion applicabile del commit sorgente fissato, senza introdurre una libreria di animazione aggiuntiva:

- cambio tema con reveal circolare di `0.4s` originato dal controllo, tramite View Transition API;
- navbar pubblica floating che si restringe dopo `48px` di scroll e sostituisce la navigazione di superficie con tag di sezione sincronizzati alla posizione;
- fallback immediato quando la View Transition API non è disponibile;
- nessuna transizione di tema quando l'utente preferisce movimento ridotto;
- apertura e chiusura di menu, select, tooltip e sheet tramite gli stati Base UI;
- collasso della sidebar, rotazione degli indicatori collassabili, scorrimento dello switch e stato attivo delle tab;
- pulse degli skeleton e rotazione dello spinner per i soli stati di caricamento.

Le animazioni `motion/react` dello starter non sono parte della foundation: appartengono a chat e form multi-step esclusi dal perimetro Sirio e richiederebbero una dipendenza non approvata. Le animazioni promozionali legate a GitHub, Clerk o alle demo dello starter non vengono trasferite a Qoovex.

## Dipendenze ammesse nella sandbox

Oltre a Next.js, React e Tailwind già presenti, Sirio usa soltanto:

- `@base-ui/react`;
- `@qoovex/brand-resources` come dipendenza workspace asset-only;
- `@tabler/icons-react`;
- `class-variance-authority`;
- `clsx`;
- `tailwind-merge`;
- `tw-animate-css`;
- `next-themes`;
- `recharts`.

Non fanno parte della foundation Clerk, billing, organizzazioni Clerk, Sentry, React Query, Zustand, nuqs, kbar, TanStack Form/Table o i dati demo dello starter.

## Gate di approvazione

Prima della promozione verificare light e dark, tastiera, touch, focus, contrasto, reduced motion, zoom 200%, hydration, console e overflow a 320, 390, 768, 1024 e 1440 px.

L'approvazione non autorizza modifiche implicite a route, auth, ruoli, permessi, API, Prisma, Blob, dati o copy normativo.

## Passo successivo consentito

Dopo approvazione esplicita, promuovere la foundation in `packages/ui/styles/tokens.css`, `packages/ui/styles/base.css` e componenti condivisi. Solo in una fase successiva migrare `apps/web` e `apps/workspace` preservando comportamento, accessibilità e contratti prodotto.
