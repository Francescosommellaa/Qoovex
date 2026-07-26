# Architecture and boundaries

Il monorepo contiene `apps/workspace` (prodotto Next.js, dashboard, auth e API), `apps/web` (sito pubblico), `apps/sirio` (showcase tecnico) e `apps/mobile` (placeholder). Le app non si importano tra loro.

`packages/db` contiene Prisma, migration e client server-side; `packages/types` contiene contratti platform-neutral; `packages/ui` e l'unica foundation condivisa per token Tailwind CSS v4, stili base, primitive, tema, hook e utility presentazionali. `packages/brand-resources` espone soltanto gli SVG proprietari. I servizi autorizzativi, Auth.js/NextAuth e le route restano nel workspace.

Le route validano input, applicano accesso server-side e delegano ai servizi. Il codice condiviso non importa da `apps/*`; DB e file binari non entrano nei componenti client.

Il registro canonico delle categorie documentali vive in `packages/types`, mentre Prisma persiste soltanto la chiave e la sensibilita sul tipo documento. Il workspace compone overview, viste per macroarea, profili e impostazioni dallo stesso contratto; nessuna view ricostruisce categorie dal nome del tipo.

Il workspace espone gli alias Feature-Sliced `@shared`, `@entities`, `@features`, `@widgets`, `@views` e `@content`. La struttura finale verra adottata in modo progressivo per flusso: gli alias non indicano che le view esistenti siano gia migrate.
