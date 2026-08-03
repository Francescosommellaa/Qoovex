# @qoovex/db

Prisma e accesso dati per Qoovex vNext. Lo schema conserva identity/security, piattaforma, Aziende, membership multiple, Worker, JobSite vNext, partecipanti, immobili cliente, timeline, agreement, step, richieste, proposte, deleghe, pagamenti documentati, dispute, closure/export, file/prove foundation, notifiche, audit e data-control.

La history canonica contiene 6 migration. Le prime 5 sono il baseline Production; `20260803230000_qoovex_vnext_from_zero` azzera i record del baseline, elimina il dominio legacy e crea Qoovex vNext. Fresh e upgrade 5→6 sono verificati localmente; Preview e Production verranno aggiornati dai workflow solo dopo il push.

Il client generato è normalizzato tramite `scripts/normalize-generated.mjs`. Comandi canonici: `db:generate`, `guard:local`, `verify:prisma`. Non usare `db push` o `migrate resolve`: il rollout remoto autorizzato passa dal wrapper guarded di `migrate deploy`.
