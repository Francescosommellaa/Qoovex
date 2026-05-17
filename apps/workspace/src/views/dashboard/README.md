# Dashboard View

Scopo: composizione della schermata dashboard.

Metti qui:
- layout, sezioni e orchestrazione della dashboard.

Non mettere qui:
- route entrypoint `app/dashboard`;
- widget o feature che possono vivere fuori dalla dashboard.

Regole:
- la route `app/dashboard/page.tsx` deve importare da qui quando la view prende forma;
- mantieni la schermata composta da blocchi leggibili.
- i conteggi arrivano da DTO server, non da Prisma diretto nella route.
