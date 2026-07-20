# Domain and authorization

`Organization` e il tenant tecnico e `Azienda` la label prodotto. Il dominio persistito include Worker, JobSite, Document, DocumentType, DocumentRequirement, DocumentVersion, Deadline, CalendarEvent, Checklist, ChecklistItem, Evidence, DocumentPackage, ShareLink e audit di prodotto.

I ruoli interni sono OWNER, ADMIN, SAFETY_CONSULTANT, SITE_MANAGER e WORKER. Ogni utente ha al massimo una `OrganizationMembership`, riutilizzata dopo una revoca, e quindi zero o una sola Azienda. Ogni accesso nasce dal server: autenticazione, membership o support session valida, permesso esplicito e filtro per risorsa. SITE_MANAGER e WORKER operano solo nel proprio scope; gli esterni leggono esclusivamente tramite share link tokenizzati.

Le route non accettano `organizationId` dal client come fonte autorevole. Ogni query e mutazione dominio deve essere filtrata per organizzazione e applicare default-deny.

Gli eventi calendario sono sempre filtrati per Azienda. OWNER e ADMIN possono creare, assegnare, spostare, aggiornare e archiviare eventi e task; gli altri ruoli leggono soltanto il proprio calendario o lo scope cantiere gia autorizzato. Una persona assegnata puo aggiornare esclusivamente lo stato del proprio impegno. Il ruolo non viene interpretato come una gerarchia HR inventata.

L'unica simulazione di ruolo e confinata al dev-auth locale: il ruolo selezionato viene validato e firmato dal server, modifica solo il contesto effettivo della sessione e non aggiorna `OrganizationMembership`. SITE_MANAGER e WORKER continuano ad applicare scope di risorsa; in dev usano una membership attiva dello stesso ruolo nell'Azienda quando disponibile.
