# Runtime and active features

Workspace espone auth credentials e OAuth opzionale, MFA TOTP con backup code, recupero autonomo auditato, inviti e supporto auditato, dashboard e console Qoovex Admin. Per gli account che la abilitano, MFA protegge l'intera sessione workspace; il recupero dei ruoli inferiori resta isolato per Azienda e richiede un OWNER.

I link inviati o copiati per un destinatario terminano su route frontend reali: `/invite?token=...` conserva il callback attraverso accesso e registrazione prima dell'accettazione, mentre `/shared/document-packages/[token]` mostra il pacchetto esterno in sola lettura e media i download tramite API tokenizzate.

Sono attive notifiche interne, preferenze e digest email paginato, reminder sincronizzati una volta per Azienda e run, assegnazioni granulari, audit log prodotto, inventario dati, export metadata completo, retention, job di cancellazione e verifica/bonifica Blob orfani. Inventario ed export includono tipi e requisiti documento, profili e membership, inviti, job data-control, supporto e metadata auth attribuibili; escludono sempre credenziali, codici, token, hash, chiavi storage e contenuti email. Le API dominio e le viste workspace derivano sempre l'unica Azienda dal server.

La base tecnica e testata contro isolamento aziendale server-side e accesso granulare.
