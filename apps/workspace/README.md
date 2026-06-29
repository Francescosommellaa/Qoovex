# Workspace App

Runtime API-only di Qoovex. Conserva autenticazione, tenant `Organization`, membership, inviti, autorizzazioni e sessioni di supporto auditato.

Il dominio prodotto usa `Organization` come tenant canonico e "Azienda" come label utente. Le tabelle fisiche `Structure*` restano temporaneamente mappate in Prisma per compatibilita conservativa.

Contiene route API, NextAuth, servizi, repository e regole di dominio. Route frontend, auth UI, viste, widget e componenti sono intenzionalmente assenti.

Regole:
- import sempre verso layer inferiori;
- ogni cartella manuale in `src` richiede `README.md`;
- nessun file generico;
- accesso DB solo nei moduli server consentiti;
- `src/proxy.ts` intercetta esclusivamente `/api/**`.
- nessun nuovo dominio food o reparto legacy;
- nessuna promessa di conformita o validita legale.

Per nominare manualmente il primo dipendente Qoovex:

```sql
UPDATE "User"
SET "platformRole" = 'SUPER_ADMIN', "authVersion" = "authVersion" + 1
WHERE "email" = 'account@qoovex.com';
```

La promozione non e esposta da alcuna API pubblica.
