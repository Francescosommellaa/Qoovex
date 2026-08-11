# @qoovex/db

Prisma e accesso dati per Qoovex. Lo schema conserva identity/security, piattaforma, Aziende, una sola membership attiva per account, Worker, JobSite, partecipanti, immobili cliente, timeline, agreement, allegati contestuali, step, richieste, proposte, deleghe, pagamenti documentati, dispute, closure/export, notifiche, audit e data-control.

La history canonica contiene otto migration. Le prime cinque sono il baseline storico immutabile; le tre migration forward successive portano lo schema al dominio corrente. Fresh, upgrade e drift sono verificati localmente; Preview e Production sono stati verificati alla stessa head tramite i workflow e i cloud build guardati.

Il client generato è normalizzato tramite `scripts/normalize-generated.mjs`. Comandi canonici: `db:generate`, `guard:local`, `verify:prisma`. Non usare `db push`, `migrate reset` o `migrate resolve` su target remoti. Il wrapper di `prisma migrate deploy` verifica environment, head e drift ma non sostituisce l'autorizzazione del workflow manuale.
