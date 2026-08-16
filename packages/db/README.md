# @qoovex/db

Prisma e accesso dati per Qoovex. Lo schema conserva identity/security, piattaforma, Aziende, una sola membership attiva per account, Worker, JobSite, partecipanti, immobili cliente, timeline, agreement, allegati contestuali, step, richieste, proposte, deleghe, pagamenti documentati, dispute, closure/export, notifiche, audit e data-control.

La history canonica contiene dieci migration. Le prime cinque sono il baseline storico immutabile; le migration forward successive portano schema e dati al dominio corrente. `20260816010000_job_site_participant_opener_foreign_keys` aggiunge FK `Restrict` per gli apritori di richieste, dispute e richieste post-chiusura. Preview e Production restano verificate alla precedente head finché la nuova migration non passa dai workflow e cloud build guardati.

Il client generato è normalizzato tramite `scripts/normalize-generated.mjs`. Comandi canonici: `db:generate`, `guard:local`, `verify:prisma`. Non usare `db push`, `migrate reset` o `migrate resolve` su target remoti. Il wrapper di `prisma migrate deploy` verifica environment, head e drift ma non sostituisce l'autorizzazione del workflow manuale.
