# Sirio App

Sandbox di prova e approvazione del nuovo design canonico Qoovex.

## Stato

Sirio è indipendente da `@qoovex/ui` e ospita una foundation app-local basata sullo starter Kiranism fissato al commit `0edc5cf631ac7a8280112fd2bcb80312597bafdf`.

Usa shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4, Geist, Geist Mono e il tema Vercel light/dark. Provenienza e avvisi MIT sono in `THIRD_PARTY_NOTICES.md`.

I marchi non sono ricreati localmente: Sirio consuma gli SVG canonici esposti da `@qoovex/brand-resources` e assegna la stella al catalogo, il marchio nero al marketing e il marchio workspace alla dashboard.

La motion applicabile dello starter è inclusa: reveal circolare al cambio tema, navbar floating che si restringe durante lo scroll e mostra tag di sezione dinamici, transizioni degli overlay e della sidebar, indicatori collassabili, switch, tab e stati di caricamento. Tutto rispetta `prefers-reduced-motion` e mantiene un fallback senza View Transition API.

## Route

- `/`: catalogo di fondazioni e componenti;
- `/marketing`: landing Qoovex rappresentativa;
- `/dashboard`: shell e dashboard Qoovex rappresentativa.

La preview marketing compone il componente dashboard reale di Sirio. I dati sono dimostrativi e non provengono dal runtime prodotto.

## Confini

- niente `@qoovex/ui` o Fontshare; `@qoovex/brand-resources` viene usato esclusivamente per gli asset SVG canonici;
- niente Prisma, auth, API o servizi prodotto;
- niente Clerk, billing, Sentry o librerie applicative dello starter;
- niente preset o promesse normative inventate;
- nessuna promozione in web, workspace o package condivisi prima dell'approvazione.

## Comandi

```bash
pnpm --filter @qoovex/sirio type-check
pnpm --filter @qoovex/sirio build
```
