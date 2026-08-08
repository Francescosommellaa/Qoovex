# People views

Le viste compongono i primitive Qoovex esistenti. La distinzione visuale e contrattuale e:

- profilo operativo (`Worker`);
- account autenticato (`User`);
- ruolo e accesso aziendale (`OrganizationMembership`);
- scope operativo (`WorkerUserLink`, `JobSiteParticipant`, `JobSiteWorkerAssignment`).

Nel `verified_current_state` un User puÃ² avere una membership per ciascuna Azienda. La partecipazione `CLIENT` Ã¨ legata al singolo cantiere tramite `JobSiteParticipant`, separata da `OrganizationRole` e dai profili Worker.


Gli stati accesso sono derivati e non persistiti: `NO_ACCESS_REQUIRED`, `INVITATION_PENDING`, `INVITATION_EXPIRED`, `ACCESS_ACTIVE`, `ACCESS_SETUP_REQUIRED`, `ACCESS_REVOKED`.
