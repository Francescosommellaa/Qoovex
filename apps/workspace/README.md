# Workspace App

Runtime API-only di Qoovex. Conserva autenticazione, tenant `Organization`, membership, inviti, autorizzazioni e sessioni di supporto auditato.

Il dominio prodotto usa `Organization` come tenant canonico e "Azienda" come label utente. La baseline Prisma pulita usa tabelle fisiche `Organization*` e colonne `organizationId`.

Contiene route API, NextAuth, servizi, repository, regole di dominio e la prima dashboard operativa mobile-first.

La route `/dashboard` e la prima esperienza prodotto reale. La root `/` reindirizza alla dashboard. La dashboard legge un payload sintetico da service server-side e non espone `blobKey`, `tokenHash`, token raw o URL permanenti.

Il primo modulo dominio attivo espone API server-side per `DocumentType`, `Document` e `Deadline`. I documenti sono record logici e le scadenze sono date registrate dall'utente.

Le versioni file dei documenti usano Vercel Blob privato tramite `@vercel/blob`. Prisma salva solo metadati `DocumentVersion` e `blobKey`; la route di download legge il Blob lato server e non restituisce URL permanenti. Runtime Blob richiede le variabili standard dello SDK Vercel, ad esempio `BLOB_READ_WRITE_TOKEN` oppure OIDC Vercel con `BLOB_STORE_ID` dove disponibile.

Le API Worker e JobSite gestiscono solo metadati operativi minimi, filtrati per `Organization`. Non gestiscono presenze, geolocalizzazione, dati sanitari o assegnazioni operative.

Le API Checklist ed Evidence gestiscono checklist configurabili, voci operative e prove di cantiere. Evidence `PHOTO` e `FILE` salvano file su Vercel Blob privato e metadata su Prisma; le response non espongono URL permanenti.

Le API DocumentPackage e ShareLink permettono di preparare pacchetti documentali pronti per revisione e link revocabili in sola lettura. Il token raw viene restituito solo alla creazione, il database salva solo `tokenHash`, e il viewer vede solo gli item inclusi senza URL Blob permanenti.

Boundary:
- i servizi server-specifici restano in `src/shared/server`;
- le route API validano e delegano ai servizi;
- la UI specifica del prodotto resta app-local finche non esiste riuso cross-app;
- i DTO condivisi vivono in `packages/types`;
- Prisma schema, migrations e client vivono in `packages/db`;
- componenti UI generici futuri dovranno uscire verso `packages/ui` solo quando riusabili;
- asset brand canonici futuri dovranno uscire verso `packages/brand`.

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
