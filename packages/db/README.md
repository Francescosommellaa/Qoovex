# @qoovex/db

Prisma e accesso dati per Qoovex vNext. Lo schema conserva identity/security, piattaforma, Aziende, membership multiple, Worker, JobSite vNext, partecipanti, immobili cliente, timeline, agreement, step, richieste, proposte, deleghe, pagamenti documentati, dispute, closure/export, file/prove foundation, notifiche, audit e data-control.

La history canonica contiene 19 migration. `20260802010000_remove_legacy_product_foundation` elimina il vecchio prodotto; `20260803010000_implement_qoovex_vnext` introduce il nuovo dominio e il backfill additivo. Nessuna delle due è stata applicata a Preview o Production.

Il client generato è normalizzato tramite `scripts/normalize-generated.mjs`. Comandi canonici: `db:generate`, `guard:local`, `verify:prisma`. Non usare `db push`, `migrate resolve` o operazioni remote senza autorizzazione esplicita.
