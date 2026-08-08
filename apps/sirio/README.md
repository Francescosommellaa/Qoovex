# Sirio App

Catalogo e superficie di verifica del design system canonico Qoovex.

Sirio consuma la stessa foundation di marketing e workspace da `@qoovex/ui`: shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4, General Sans / ARRAY e tema Vercel light/dark/system. Componenti, hook, utility e comportamenti condivisi non vengono duplicati nell'app.

I marchi provengono dagli SVG canonici di `@qoovex/brand-resources`. Provenienza e avvisi MIT della foundation sono conservati in `packages/ui/THIRD_PARTY_NOTICES.md`.

## Route

- `/`: catalogo di fondazioni, primitive e stati limite;
- `/marketing`: landing Qoovex rappresentativa;
- `/dashboard`: shell e dashboard Qoovex rappresentativa.

La preview marketing compone la dashboard reale di Sirio. I dati sono dimostrativi e non provengono dal runtime prodotto.

## Contratto

- gli import condivisi usano subpath espliciti `@qoovex/ui/components/*`, `hooks/*` e `lib/*`;
- `src/app/globals.css` importa una sola volta `@qoovex/ui/styles/base.css` e dichiara le sorgenti Tailwind dell'app;
- Sirio non contiene copie locali di primitive, provider tema, utility `cn` o hook mobile;
- nessun Prisma, auth, API o servizio prodotto;
- nessuna promessa normativa inventata.

La motion include reveal circolare del tema, navbar floating adattiva allo scroll, overlay Base UI, sidebar, switch, tab e stati di caricamento. Tutto rispetta `prefers-reduced-motion`.

## Comandi

```bash
pnpm --filter @qoovex/sirio type-check
pnpm --filter @qoovex/sirio build
```
