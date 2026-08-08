# Organization invitations API

`GET`, `POST` e `DELETE /api/organization/invitations` elencano gli inviti attivi, creano un invito e lo revocano. Il client non invia mai `organizationId`.

Un invito usa sempre il ruolo `COLLABORATOR`. Il preset `LIMITED_UPLOAD` richiede `workerId`, appartenente alla stessa Azienda, attivo, non gia collegato e con email coerente; gli altri preset rifiutano `workerId`. All'accettazione, membership e `WorkerUserLink` vengono creati o riattivati nella stessa transazione Serializable. Gli inviti preesistenti senza `workerId` restano accettabili e producono uno stato di configurazione da completare, senza associazioni dedotte dall'email.

Token ed email body non entrano nell'audit prodotto. OWNER non e invitabile.

