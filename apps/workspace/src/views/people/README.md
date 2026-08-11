# People views

Le viste compongono i primitive Qoovex esistenti. La distinzione visuale e contrattuale è:

- profilo operativo (`Worker`);
- account autenticato (`User`);
- ruolo e accesso aziendale (`OrganizationMembership`);
- scope operativo (`WorkerUserLink`, `JobSiteParticipant`, `JobSiteWorkerAssignment`).

Nel `verified_current_state` un User può avere al massimo una membership Azienda attiva. La partecipazione `CLIENT` è legata al singolo cantiere tramite `JobSiteParticipant`, separata da `OrganizationRole` e dai profili Worker.

Gli stati accesso sono derivati e non persistiti: `NO_ACCESS_REQUIRED`, `INVITATION_PENDING`, `INVITATION_EXPIRED`, `ACCESS_ACTIVE`, `ACCESS_SETUP_REQUIRED`, `ACCESS_REVOKED`.
