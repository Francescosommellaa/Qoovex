# Architecture and boundaries

Il monorepo contiene `apps/workspace` (prodotto Next.js, dashboard, auth e API), `apps/web` (sito pubblico), `apps/sirio` (showcase tecnico) e `apps/mobile` (placeholder). Le app non si importano tra loro.

`packages/db` contiene Prisma, migration e client server-side; `packages/types` contiene contratti platform-neutral; `packages/ui` contiene token Tailwind CSS v4, stili base e primitive UI generiche. `packages/brand-resources` e il package runtime che centralizza la tipografia Fontshare. I servizi autorizzativi, Auth.js/NextAuth e le route restano in workspace.

Le route validano input, applicano accesso server-side e delegano ai servizi. Il codice condiviso non importa da `apps/*`; DB e file binari non entrano nei componenti client.

Il workspace espone gli alias Feature-Sliced `@shared`, `@entities`, `@features`, `@widgets`, `@views` e `@content`. La struttura finale verra adottata in modo progressivo per flusso: gli alias non indicano che le view esistenti siano gia migrate.
