# People views

Le viste compongono i primitive Qoovex esistenti. La distinzione visuale e contrattuale e:

- profilo operativo (`Worker`);
- account autenticato (`User`);
- ruolo e accesso aziendale (`OrganizationMembership`);
- scope operativo (`WorkerUserLink`, `JobSiteUserAssignment`, `JobSiteWorkerAssignment`).

Nel `verified_current_state` un User ha al massimo una membership Azienda e nessuna assegnazione rappresenta un cliente. La futura partecipazione `CLIENT` e legata al cantiere, non a `OrganizationRole`, ed e `conceptual_not_implemented`.

D-VNEXT-20 approva membership multiple future con unicita per `(organizationId,userId)`, ma il vincolo `userId @unique` e i servizi single-membership restano lo stato realmente disponibile.

Gli stati accesso sono derivati e non persistiti: `NO_ACCESS_REQUIRED`, `INVITATION_PENDING`, `INVITATION_EXPIRED`, `ACCESS_ACTIVE`, `ACCESS_SETUP_REQUIRED`, `ACCESS_REVOKED`.
