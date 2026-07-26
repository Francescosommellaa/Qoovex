# Organization invitations API

`GET`, `POST` e `DELETE /api/organization/invitations` elencano gli inviti attivi, creano un invito e lo revocano. Il client non invia mai `organizationId`.

I nuovi inviti WORKER richiedono `workerId`, appartenente alla stessa azienda, attivo, non gia collegato e con email coerente. Gli altri ruoli rifiutano `workerId`. All'accettazione, membership e `WorkerUserLink` vengono creati o riattivati nella stessa transazione Serializable. Gli inviti legacy WORKER senza `workerId` restano accettabili e producono uno stato di configurazione da completare, senza associazioni dedotte dall'email.

Token ed email body non entrano nell'audit prodotto. OWNER non e invitabile.
