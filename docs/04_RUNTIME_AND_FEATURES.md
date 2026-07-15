# Runtime and active features

Workspace espone auth credentials e OAuth opzionale, MFA TOTP con backup code, recupero autonomo auditato, inviti e supporto auditato, dashboard e console Qoovex Admin. Per gli account che la abilitano, MFA protegge l'intera sessione workspace; il recupero dei ruoli inferiori resta isolato per Azienda e richiede un OWNER.

La dashboard e una coda decisionale, non un riepilogo statistico. Il payload aggrega situazioni operative ordinate per scaduto, in scadenza, mancante e da verificare; ogni elemento dichiara motivo, conseguenza, contesto, responsabilita derivata e destinazione dell'azione. Pacchetti pronti, prossime scadenze e contesti sono sezioni separate e gli errori non autorizzativi restano circoscritti alla sezione. OWNER e ADMIN possono preparare e condividere pacchetti; SAFETY_CONSULTANT puo prepararli e caricare versioni documentali, ma non crea link esterni. SITE_MANAGER e WORKER vedono soltanto lo scope assegnato.

La navigazione quotidiana e deliberata per ruolo. OWNER, ADMIN e SAFETY_CONSULTANT vedono `Da fare`, `Cantieri`, `Lavoratori` e `Documenti`; SITE_MANAGER e WORKER vedono `Da fare`, `Cantieri` e `Documenti`. Notifiche, creazione globale e azienda/account hanno controlli separati. Scadenze, checklist, prove, condivisioni e assegnazioni restano disponibili come route secondarie o azioni contestuali; audit e controllo dati restano owner-only nelle impostazioni.

Le liste operative non affiancano piu il form completo. Le creazioni usano route dedicate `/new`; cantiere e lavoratore raccolgono documenti, scadenze e altre relazioni gia autorizzate. `/documents/new` crea il documento e carica il file come un solo percorso percepito, conservando l'identificativo per un retry senza duplicazione quando l'upload fallisce. Tipi e requisiti documento vivono in `/settings/documents`; preferenze e digest in `/settings/notifications`; persone e inviti in `/settings/people`.

Su host loopback e solo con `NODE_ENV=development`, l'accesso dev firmato apre la dashboard con ruolo OWNER e rende disponibile uno switch tra tutti i ruoli Azienda. Il cambio aggiorna navigazione, permessi, API e scope server-side senza modificare membership o creare dati; la console Qoovex resta raggiungibile grazie al ruolo piattaforma runtime `SUPER_ADMIN`.

I link inviati o copiati per un destinatario terminano su route frontend reali: `/invite?token=...` conserva il callback attraverso accesso e registrazione prima dell'accettazione, mentre `/shared/document-packages/[token]` mostra il pacchetto esterno in sola lettura e media i download tramite API tokenizzate.

Sono attive notifiche interne, preferenze e digest email paginato, reminder sincronizzati una volta per Azienda e run, assegnazioni granulari, audit log prodotto, inventario dati, export metadata completo, retention, job di cancellazione e verifica/bonifica Blob orfani. Inventario ed export includono tipi e requisiti documento, profili e membership, inviti, job data-control, supporto e metadata auth attribuibili; escludono sempre credenziali, codici, token, hash, chiavi storage e contenuti email. Le API dominio e le viste workspace derivano sempre l'unica Azienda dal server.

La base tecnica e testata contro isolamento aziendale server-side e accesso granulare.
