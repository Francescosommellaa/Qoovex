# Support and data control

Il supporto richiede sessione temporanea, motivo, MFA e audit; non espone password, TOTP, backup code o credenziali. Qoovex Admin gestisce utenti, organizzazioni e errori runtime con accesso server-side.

Gli owner possono consultare inventario, retention ed export metadata; le operazioni di cancellazione e pulizia Blob sono job tracciati e soggetti a controlli. I risultati e i download restano limitati all'organizzazione autorizzata.

Il runner usa claim atomico, fencing tramite `startedAt`, recupero dei job fermi e retry con backoff. La cancellazione azienda e DB-first: una failure Prisma non elimina Blob, mentre il cleanup successivo e ripetibile e non usa cursor dopo le cancellazioni.

I runbook operativi devono distinguere fatti verificati nel codice da azioni manuali d'ambiente e non devono contenere segreti.
