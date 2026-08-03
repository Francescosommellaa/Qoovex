# People views

Le viste compongono i primitive Qoovex esistenti. La distinzione visuale e contrattuale e:

- profilo operativo (`Worker`);
- account autenticato (`User`);
- ruolo e accesso aziendale (`OrganizationMembership`);
- scope operativo (`WorkerUserLink`, `JobSiteParticipant`, `JobSiteWorkerAssignment`).

Nel `verified_current_state` un User può avere una membership per ciascuna Azienda. La partecipazione `CLIENT` è legata al singolo cantiere tramite `JobSiteParticipant`, separata da `OrganizationRole` e dai profili Worker.

D-VNEXT-20 è implementata con unicità `(organizationId,userId)` e resolver che non deducono mai l’Azienda dal solo `userId`.

Gli stati accesso sono derivati e non persistiti: `NO_ACCESS_REQUIRED`, `INVITATION_PENDING`, `INVITATION_EXPIRED`, `ACCESS_ACTIVE`, `ACCESS_SETUP_REQUIRED`, `ACCESS_REVOKED`.
