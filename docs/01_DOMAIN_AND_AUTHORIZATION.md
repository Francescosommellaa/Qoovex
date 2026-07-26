# Domain and authorization

## Stato attuale verificato

`Organization` e il tenant tecnico e `Azienda` la label prodotto. Ogni utente ha al massimo una `OrganizationMembership`, riutilizzabile dopo revoca, e quindi zero o una sola Azienda. I ruoli interni sono OWNER, ADMIN, SAFETY_CONSULTANT, SITE_MANAGER e WORKER; gli esterni leggono esclusivamente tramite share link tokenizzati.

Il dominio persistito include Worker, JobSite, DocumentType, DocumentRequirement, Document, DocumentVersion, Deadline, CalendarEvent, Checklist, ChecklistItem, Evidence, DocumentPackage, DocumentPackageItem, ShareLink, Notification e ProductAuditEvent. Non esistono modelli Prisma per processo, step, proposta, decisione, eccezione o timeline operativa.

`Worker`, `User`, `OrganizationMembership`, `WorkerUserLink` e assegnazioni sono concetti distinti. `roleLabel` e una mansione libera, non un ruolo, permesso o abilitazione. Un invito WORKER nuovo riferisce un Worker della stessa Azienda; l'accettazione crea o riattiva membership e link nella stessa transazione Serializable. Gli inviti legacy privi di `workerId` non deducono il profilo dall'email.

`JobSite.operationalPhase` e indipendente da stato, archiviazione e date; e nullable per i legacy e richiesta nelle nuove creazioni. La fase non prova conformita e non viene dedotta automaticamente soltanto dal periodo.

Categoria, macroarea e sensibilita documentale sono validate server-side. Documenti non `STANDARD` sono visibili secondo la policy esistente e non entrano in nuovi pacchetti condivisi. Nessuna lista normativa o scadenza ufficiale e incorporata nel dominio.

## Invarianti autorizzativi

- Azienda, attore, ruolo, support session, permesso e resource scope derivano sempre dal server.
- Route e processi futuri non accettano `organizationId` dal client come fonte autorevole.
- Ogni query e mutazione applica default-deny e filtro Azienda; SITE_MANAGER e WORKER mantengono lo scope assegnato.
- Una previsione, un evento o un processo non amplia permessi e non crea scorciatoie autorizzative.
- Inviti, assegnazioni, ruoli, condivisioni e operazioni sensibili richiedono gli stessi controlli dei servizi dominio esistenti.
- Supporto resta temporaneo, motivato, MFA-protected, notificato e auditato.

## Direzione approvata

I processi futuri orchestrano il dominio senza sostituirlo. Ogni evento viene acquisito nel contesto autorizzativo corrente; ogni step dichiara risorsa, permesso e impatto. Un'eccezione identifica chi puo risolverla e la condizione per riprendere. Una decisione registra un attore gia autorizzato: non introduce un nuovo ruolo implicito.

Le regole validate diventano input versionati dei processi. Una regola puo descrivere cosa attendersi rispetto a una configurazione approvata, ma non equivale a un obbligo legale e non puo ampliare la visibilita dei dati.

## Specifiche concettuali non implementate

`Process Definition`, `Process Run`, `Process Step`, `Process Event`, `Proposal`, `Decision`, `Exception` e `Artifact Reference` sono nomi provvisori. Nessun tipo, DTO, modello o permission scope corrispondente esiste oggi.

## Decisioni aperte e hard stop

Restano da approvare i ruoli autorizzati per ogni proposta, override e condivisione, il trattamento per sensibilita, l'eventuale delega, la policy di annullamento e qualunque nuovo permesso. Non modificare la matrice attuale per anticipare il motore operativo.
