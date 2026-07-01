# Operational Protocol

## Posizionamento invariabile

Qoovex e il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

## Fonti di verita

1. `docs/00_PRODUCT_RESET.md`;
2. documenti numerati in `docs/`;
3. codice reale del repo;
4. Qoovex Brain tramite MCP.

## Regole operative

- Usare sempre il nuovo dominio: `Organization`, `Worker`, `JobSite`, `Document`, `Deadline`, `Checklist`, `Evidence`, `DocumentPackage`, `ShareLink`.
- Non reintrodurre compatibilita `Structure*`.
- Non inventare normative, obblighi, scadenze ufficiali o documenti legali.
- Non promettere conformita, certificazione o validita legale.
- Preservare auth, MFA, audit, support session, membership e inviti.
- Applicare default-deny server-side.
- Filtrare le query di dominio per `organizationId`.
- Usare Prisma per database e metadati.
- Usare Blob per PDF, immagini, documenti caricati, allegati e prove operative.
- Non introdurre Supabase, Firebase, S3 o provider non richiesti.

## Fine sessione

Aggiornare `00_System/session-log.md` tramite MCP `qoovex_brain.append_file` con data, task e file principali modificati.
