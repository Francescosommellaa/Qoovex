# Prisma migrations

Questa cartella contiene l'unica cronologia Prisma canonica di Qoovex.

## Cronologia

- `20260712010000_single_company_baseline`: baseline completa registrata nel database condiviso. Il file e immutabile e il checksum deve coincidere con `_prisma_migrations`.
- `20260712020000_single_membership_forward`: migration incrementale e transazionale applicata al database condiviso; ha creato il modello con una sola `OrganizationMembership` per utente e rimosso `User.organizationId` e `User.organizationRole`.
- `20260713010000_mfa_hardening`: aggiunge recovery MFA, binding sessione, dispositivi e backup code con i relativi vincoli.
- `20260713020000_rate_limit_privacy_atomicity`: elimina le righe rate-limit legacy contenenti PII e aggiunge `userId`, timestamp, indice e FK per atomicita, attribuzione e retention.
- `20260720010000_calendar_events`: aggiunge `CalendarEvent`, priorita, stato, assegnatario, cantiere, origine iCalendar, indici e azioni audit. Non applicarla fuori dal deploy protetto.
- `20260722010000_document_taxonomy`: aggiunge categorie organizzative e sensibilita tipizzate a `DocumentType`; i tipi preesistenti restano `UNCLASSIFIED` senza inferenze automatiche. Non applicarla fuori dal deploy protetto.
- `20260723010000_people_invitation_worker`: aggiunge la relazione opzionale `OrganizationInvitation.workerId`, indici e azioni audit per inviti/membership. Gli inviti preesistenti restano validi. Applicata e verificata soltanto sul database locale `localhost:51225`; fuori dal locale richiede il deploy protetto.
- `20260723020000_job_site_operational_phase`: aggiunge la fase operativa opzionale dei cantieri e il relativo indice; i record legacy restano senza fase. Non applicarla fuori dal deploy protetto.
- `20260725010000_add_session_account_user_indexes`: aggiunge gli indici sulle foreign key `accounts.userId` e `sessions.userId`. Non applicarla fuori dal deploy protetto.
- `20260726010000_operational_engine_phase_3`: aggiunge modelli, enum, indici e vincoli del motore operativo persistente. Applicata e verificata soltanto sul database locale guardato; Preview e Production richiedono verifica e autorizzazione separate.

Le migration storiche esterne a questa cronologia non devono essere eseguite o marcate tramite `migrate resolve`.

## Regole operative

- Non modificare migration applicate o aggirare il controllo checksum. Il verifier considera equivalenti solo gli EOL LF e CRLF dello stesso SQL, perche la cronologia condivisa contiene migration applicate da ambienti Windows e Linux; ogni differenza sostanziale resta bloccante.
- Non applicare la baseline sopra un database esistente: sul database condiviso e gia registrata; su un database vuoto viene applicata prima della migration forward.
- `pnpm --filter @qoovex/db db:migrate:deploy` e deny-by-default. In manutenzione richiede `QOOVEX_MIGRATE_DEPLOY_APPROVED=1`, `QOOVEX_MIGRATION_BACKUP_REF` e `QOOVEX_EXPECTED_LAST_MIGRATION`.
- Non usare `pnpm --filter @qoovex/db exec prisma migrate deploy` sul database condiviso: aggira il wrapper e puo tentare migration di un checkout non canonico.
- La CI usa esclusivamente `--ci-ephemeral`, accettato soltanto per `qoovex_ci` su loopback. Il test upgrade separato usa solo `qoovex_upgrade_ci` su loopback con `QOOVEX_UPGRADE_CI_MODE=1`.
- Non usare `db push`, `migrate reset` o `migrate dev` su database condivisi.
- Dopo il deploy, `verify:prisma` deve confermare cronologia completa, checksum e diff schema nullo.
