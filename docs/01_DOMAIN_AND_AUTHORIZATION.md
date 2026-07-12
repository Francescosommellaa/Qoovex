# Domain and authorization

`Organization` e il record tecnico dell'Azienda unica associata all'account. Il dominio persistito include Worker, JobSite, Document, DocumentType, DocumentRequirement, DocumentVersion, Deadline, Checklist, ChecklistItem, Evidence, DocumentPackage, ShareLink e audit di prodotto.

I ruoli sono OWNER, ADMIN, SAFETY_CONSULTANT, SITE_MANAGER e WORKER. Ogni accesso nasce dal server: autenticazione, associazione aziendale o support session valida, permesso esplicito e filtro per risorsa. SITE_MANAGER e WORKER operano solo nel proprio scope. I destinatari esterni accedono esclusivamente al pacchetto condiviso tramite share link.

Le route non accettano `organizationId` dal client come fonte autorevole. Ogni query e mutazione dominio deve essere filtrata per organizzazione e applicare default-deny.
