# Support and data control

Il supporto richiede sessione temporanea, motivo, MFA e audit; non espone password, TOTP, backup code o credenziali. Qoovex Admin gestisce utenti, organizzazioni e errori runtime con accesso server-side.

Gli owner possono consultare inventario, retention ed export metadata completi per dominio, inclusi eventi calendario e assegnatari, membership, inviti, data-control, supporto e auth attribuibile. L'export usa DTO e `select` allow-list: non include password/hash, OTP/TOTP, backup code, token, session token, HMAC, IP hash, Blob key/pathname, URL permanenti, body email o credenziali provider. Le operazioni di cancellazione e pulizia Blob sono job tracciati e soggetti a controlli. I risultati e i download restano limitati all'organizzazione autorizzata.

Il runner usa claim atomico, fencing tramite `startedAt`, recupero dei job fermi e retry con backoff. La scansione orfani percorre tutte le pagine Blob tramite cursor, rifiuta `hasMore=true` senza cursor e seleziona sull'inventario completo; ogni job elimina al massimo 50 oggetti. La cancellazione azienda e DB-first: una failure Prisma non elimina Blob, mentre il cleanup successivo e ripetibile e non usa cursor dopo le cancellazioni.

I runbook operativi devono distinguere fatti verificati nel codice da azioni manuali d'ambiente e non devono contenere segreti.
