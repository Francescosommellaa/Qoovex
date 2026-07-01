# Workspace App Router

Il workspace espone route API e la prima dashboard operativa.

Route frontend attive:

- `/`: redirect a `/dashboard`;
- `/dashboard`: dashboard interna mobile-first per stato documentale, scadenze, cantieri, lavoratori, prove e pacchetti.

Regole:

- `page.tsx` compone e delega;
- business logic e query restano nei service server-side;
- nessuna route frontend deve promettere conformita, certificazione o validita legale.
