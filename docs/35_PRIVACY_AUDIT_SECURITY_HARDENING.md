# 35 - Privacy, audit prodotto e security hardening

## Decisione

Questa fase introduce un audit log prodotto separato dagli audit di supporto e sicurezza auth. Lo scopo e registrare eventi operativi sensibili dell'azienda con metadata minimizzati, senza salvare contenuti privati o riferimenti di storage.

## Superfici sensibili controllate

- File documento: upload, download e archivio versione.
- Evidence: creazione, download e archivio.
- Pacchetti e share link: creazione, aggiornamento, archivio, item, creazione/revoca link e accesso viewer.
- Notifiche/email: lettura, dismiss, invio digest, preferenze e scheduling.
- Core operativo: documenti, scadenze, lavoratori, cantieri e checklist.

`SupportAuditEvent` resta dedicato alle sessioni di supporto. `SecurityAuditEvent` resta dedicato ai flussi auth/security. Il nuovo `ProductAuditEvent` copre il prodotto.

## Modello audit

Prisma aggiunge:

- enum `AuditAction`;
- enum `AuditEntityType`;
- enum `AuditOutcome`;
- modello `ProductAuditEvent`.

Campi principali:

- `organizationId`;
- `actorUserId`;
- `actorRole`;
- `action`;
- `entityType`;
- `entityId`;
- `outcome`;
- `metadata`;
- `requestId`;
- `supportSessionId`;
- `createdAt`.

Migration creata: `20260707000000_product_audit_log`.

## Metadata salvati

Il service accetta solo una allowlist di metadata operativi:

- `previousStatus`;
- `nextStatus`;
- `mimeType`;
- `size`;
- `itemType`;
- `entityType`;
- `expiresAt`;
- `notificationCount`;
- `deliveryStatus`;
- `emailDigestFrequency`;
- `reasonCode`;
- `trigger`;
- `frequency`;
- `scanned`;
- `sent`;
- `failed`;
- `skipped`;
- `hasFile`.

## Metadata redatti

Il service rimuove sempre chiavi riconducibili a:

- riferimenti Blob o storage;
- token e hash;
- URL privati o download;
- body email;
- contenuto file;
- password e secret;
- dati sanitari;
- coordinate;
- stack trace.

I valori non primitivi non vengono salvati.

## Service creato

`apps/workspace/src/shared/server/product-audit-service.ts`

Funzioni:

- `recordProductAuditEvent`;
- `recordProductAuditEventBestEffort`;
- `listProductAuditEvents`;
- `sanitizeAuditMetadata`;
- `auditActorFromContext`.

Le scritture audit operative sono best-effort: un problema nell'audit non blocca l'azione utente gia autorizzata. Download, share link ed email registrano l'esito dopo l'operazione nota, sempre senza salvare dati privati.

## API

Route creata:

- `GET /api/audit-log`

La route:

- richiede autenticazione;
- usa `organizationId` server-side;
- richiede `auditLog:read`;
- consente solo `OWNER`;
- supporta `limit`, `cursor`, `action`, `entityType`, `outcome`, `from`, `to`;
- restituisce solo DTO redatti.

Non esiste endpoint client-side per scrivere audit.

## UI

Route creata:

- `/audit-log`

La pagina usa componenti app-local del workspace e mostra:

- data evento;
- azione;
- entita;
- esito;
- ruolo attore se disponibile;
- metadata redatti.

Empty state:

> Nessun evento audit da mostrare. Le azioni sensibili verranno registrate qui quando disponibili.

La route resta owner-only lato service/API. La shell espone il link Audit; il controllo server-side resta la fonte di verita.

## Header sicurezza

Sono stati aggiunti in `apps/workspace/next.config.ts`:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Frame-Options: DENY`;
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

CSP e HSTS sono rimandati per non rischiare regressioni su auth, upload o ambienti non ancora stabilizzati.

## Cosa resta escluso

- SIEM o provider esterni;
- privacy policy pubblica;
- DPA o cookie policy;
- sistema enterprise di audit;
- export audit;
- alert automatici di sicurezza;
- CSP completa;
- HSTS;
- audit bloccante per ogni singola operazione.

## Rischi aperti

- Alcuni eventi read-only ordinari restano fuori dall'audit prodotto per evitare rumore.
- Il link Audit e visibile nella shell anche a ruoli non owner, ma pagina e API negano l'accesso.
- Il DB remoto deve ricevere la migration additiva prima della prova end-to-end.
- CSP e HSTS richiedono una decisione di deploy e test auth/upload dedicati.

## Prossima fase consigliata

13.2 dovrebbe completare audit filtering avanzato, retention, export controllato e una policy ambientale per CSP/HSTS.
