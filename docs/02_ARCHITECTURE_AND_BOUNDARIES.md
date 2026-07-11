# Architecture and boundaries

Il monorepo contiene `apps/workspace` (prodotto Next.js, dashboard, auth e API), `apps/web` (sito pubblico), `apps/sirio` (showcase tecnico) e `apps/mobile` (placeholder). Le app non si importano tra loro.

`packages/db` contiene Prisma, migration e client server-side; `packages/types` contiene contratti platform-neutral; `packages/ui` contiene primitive UI generiche usate da web e Sirio. I servizi autorizzativi e le route restano in workspace. `packages/brand-resources` contiene asset disponibili ma non e un package runtime.

Le route validano input, applicano accesso server-side e delegano ai servizi. Il codice condiviso non importa da `apps/*`; DB e file binari non entrano nei componenti client.
