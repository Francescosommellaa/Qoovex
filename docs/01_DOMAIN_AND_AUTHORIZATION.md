# Domain and authorization

`Organization` e il tenant tecnico e `Azienda` la label prodotto. Il dominio persistito include Worker, JobSite, Document, DocumentType, DocumentRequirement, DocumentVersion, Deadline, Checklist, ChecklistItem, Evidence, DocumentPackage, ShareLink e audit di prodotto.

I ruoli sono OWNER, ADMIN, SAFETY_CONSULTANT, SITE_MANAGER, WORKER e VIEWER. Ogni accesso nasce dal server: autenticazione, membership o support session valida, permesso esplicito e filtro per risorsa. SITE_MANAGER e WORKER operano solo nel proprio scope; VIEWER vede esclusivamente il contenuto condiviso.

Le route non accettano `organizationId` dal client come fonte autorevole. Ogni query e mutazione dominio deve essere filtrata per organizzazione e applicare default-deny.
