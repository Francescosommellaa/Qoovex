# @qoovex/db

Prisma e accesso dati per Qoovex. Lo schema conserva identity/security, piattaforma, Aziende, membership multiple, Worker, JobSite attuale, partecipanti, immobili cliente, timeline, agreement, step, richieste, proposte, deleghe, pagamenti documentati, dispute, closure/export, file/prove foundation, notifiche, audit e data-control.

La history canonica contiene 6 migration. Le prime 5 sono il baseline Production; la sesta migration pubblicata nel migration ledger azzera i record del baseline, elimina il dominio precedente e crea Qoovex. Fresh e upgrade 5â†’6 sono verificati localmente. Production Ã¨ stata verificata in sola lettura alla quinta migration; Preview resta non verificata. Nessun push aggiorna target remoti: i workflow distruttivi sono manuali e bloccati da conferma esatta.

Il client generato Ã¨ normalizzato tramite `scripts/normalize-generated.mjs`. Comandi canonici: `db:generate`, `guard:local`, `verify:prisma`. Non usare `db push`, `migrate reset` o `migrate resolve` su target remoti. Il wrapper guarded di `migrate deploy` Ã¨ una protezione tecnica e non costituisce autorizzazione al rollout.
