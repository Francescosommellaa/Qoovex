# @qoovex/db

Prisma e accesso dati per la foundation Qoovex. Lo schema corrente conserva identità/sicurezza, piattaforma, Aziende/accessi, Worker/assegnazioni, JobSite minimo, file/versioni private, prove, notifiche di sistema, audit e data-control.

La migration `20260802010000_remove_legacy_product_foundation` è additiva alla history e distruttiva rispetto al dominio precedente. Non è applicata a Preview o Production. Il client generato è normalizzato tramite `scripts/normalize-generated.mjs`.

Comandi canonici: `db:generate`, `guard:local`, `verify:prisma`. Non usare `db push` o operazioni remote senza autorizzazione esplicita.
