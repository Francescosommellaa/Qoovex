# Prisma migrations

Questa cartella contiene le migration Prisma ufficiali di Qoovex.

Il database attuale non è più una baseline limitata ad auth/tenant: include anche il dominio MVP documentale e operativo.

## Stato schema attuale

`packages/db/prisma/schema.prisma` contiene:

- auth/Auth.js: `Account`, `Session`, `VerificationToken`, `User`, `UserCredential`, `AuthCode`, `AuthRateLimit`, `SecurityAuditEvent`, `AuthDevice`, `MfaBackupCode`;
- tenant e accesso: `Organization`, `OrganizationMembership`, `OrganizationInvitation`, ruoli canonici `OrganizationRole`;
- supporto auditato: `SupportSession`, `SupportAuditEvent`;
- dominio MVP: `Worker`, `JobSite`, `DocumentType`, `Document`, `DocumentVersion`, `DocumentRequirement`, `Deadline`, `Checklist`, `ChecklistItem`, `Evidence`, `DocumentPackage`, `DocumentPackageItem`, `ShareLink`;
- notifiche e digest email: `Notification`, `NotificationPreference`, `NotificationEmailDelivery`;
- audit prodotto: `ProductAuditEvent`;
- assegnazioni granulari: `WorkerUserLink`, `JobSiteUserAssignment`, `JobSiteWorkerAssignment`.

Prisma salva metadati, relazioni, stati, scadenze, permessi e audit. I file binari, PDF, immagini, foto e prove operative restano su Vercel Blob e nel database vengono salvati solo metadati e riferimenti Blob.

## Migration presenti

- `20260701000000_clean_organization_baseline`: baseline pulita con Organization/auth/tenant, inviti, MFA, dispositivi, supporto e dominio documentale MVP iniziale.
- `20260705000000_add_notifications`: notifiche interne.
- `20260706000000_notification_preferences_and_delivery_log`: preferenze digest email e log consegna email.
- `20260707000000_product_audit_log`: audit prodotto minimizzato.
- `20260708000000_resource_assignments`: collegamenti utente-lavoratore e assegnazioni cantiere.
- `20260709000000_data_control`: azioni audit per export dati.

## Regole operative

- Non modificare migration già applicate su ambienti condivisi o produzione.
- Per produzione usare `prisma migrate deploy`, non `prisma db push`.
- Non usare reset o migration distruttive su database con dati reali.
- Se `prisma migrate diff` mostra solo differenze di naming indici, preferire `map:` nello schema Prisma quando il database reale è già corretto.
- Ogni nuova modifica persistente deve passare da migration Prisma esplicita e verificata.
