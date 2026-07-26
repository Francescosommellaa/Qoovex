# Domain and authorization

`Organization` e il tenant tecnico e `Azienda` la label prodotto. Il dominio persistito include Worker, JobSite, Document, DocumentType, DocumentRequirement, DocumentVersion, Deadline, CalendarEvent, Checklist, ChecklistItem, Evidence, DocumentPackage, ShareLink e audit di prodotto.

`JobSite.operationalPhase` e nullable soltanto per compatibilita legacy ed e indipendente da `RecordStatus`, `archivedAt`, `startDate` ed `endDate`. Ogni nuova creazione richiede una fase esplicita. Responsabili e lavoratori restano relazioni tenant-scoped; la creazione guidata puo registrarli nella stessa write annidata del cantiere, dopo avere validato membership e profili attivi dell'Azienda.

I ruoli interni sono OWNER, ADMIN, SAFETY_CONSULTANT, SITE_MANAGER e WORKER. Ogni utente ha al massimo una `OrganizationMembership`, riutilizzata dopo una revoca, e quindi zero o una sola Azienda. Ogni accesso nasce dal server: autenticazione, membership o support session valida, permesso esplicito e filtro per risorsa. SITE_MANAGER e WORKER operano solo nel proprio scope; gli esterni leggono esclusivamente tramite share link tokenizzati.

Le route non accettano `organizationId` dal client come fonte autorevole. Ogni query e mutazione dominio deve essere filtrata per organizzazione e applicare default-deny.

`DocumentType.categoryKey` collega il tipo al registro categorie condiviso e `DocumentType.sensitivity` applica la classe `STANDARD`, `RESTRICTED` o `HEALTH_JUDGMENT`. Categoria, macroarea e sensibilita sono validate server-side. I documenti non `STANDARD` sono visibili soltanto a OWNER e ADMIN; documenti non classificati o non `STANDARD` non possono entrare in nuovi pacchetti condivisi o link esterni. `WORKER_RESTRICTED_ADMINISTRATION` resta indisponibile finche non esistono entitlement commerciali e una matrice permessi dedicata.

Gli eventi calendario sono sempre filtrati per Azienda. OWNER e ADMIN possono creare, assegnare, spostare, aggiornare e archiviare eventi e task; gli altri ruoli leggono soltanto il proprio calendario o lo scope cantiere gia autorizzato. Una persona assegnata puo aggiornare esclusivamente lo stato del proprio impegno. Il ruolo non viene interpretato come una gerarchia HR inventata.

L'unica simulazione di ruolo e confinata al dev-auth locale: il ruolo selezionato viene validato e firmato dal server, modifica solo il contesto effettivo della sessione e non aggiorna `OrganizationMembership`. SITE_MANAGER e WORKER continuano ad applicare scope di risorsa; in dev usano una membership attiva dello stesso ruolo nell'Azienda quando disponibile.

`Worker`, `User`, `OrganizationMembership` e assegnazioni sono concetti distinti. Un invito WORKER nuovo deve riferire un `Worker` della stessa Azienda; l'accettazione crea o riattiva membership e `WorkerUserLink` nella stessa transazione Serializable. Gli inviti legacy senza `workerId` restano validi ma non deducono mai il profilo dall'email: l'account viene segnalato come configurazione incompleta. OWNER e ADMIN gestiscono assegnazioni; SAFETY_CONSULTANT le legge; SITE_MANAGER e WORKER mantengono scope server-side. La visibilita del consulente e la matrice privacy restano quelle della policy canonica esistente; non sono introdotti nuovi permessi granulari.
