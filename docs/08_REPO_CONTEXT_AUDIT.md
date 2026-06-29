# Repo Context Audit

Data audit: 2026-06-29.

## Sintesi

Il repository contiene ancora tracce significative del vecchio Qoovex legato a pre-service, eventi, cucina, sala, chef e brigata. La base tecnica auth/API-only e in larga parte riutilizzabile, ma i contratti di dominio, i ruoli e diversi testi non sono coerenti con il nuovo prodotto.

Il prossimo intervento non deve limitarsi a cambiare etichette: ruoli, permessi e concetto di tenant devono essere riprogettati per aziende, lavoratori, cantieri, documenti e pacchetti documentali.

## File e cartelle con riferimenti legacy

- `README.md`: prima di questa sessione descriveva Qoovex come Pre-Service Brain per eventi, calcoli, briefing e preparazioni. Aggiornato in questa sessione per il posizionamento pubblico.
- `docs/ProductContext.md`: contiene missione, utenti e scope del vecchio prodotto con strutture eventi, menu, allergeni, chef, brigata e sala. Da considerare legacy e non canonico.
- `docs/event-operations.md`: contiene flusso pre-service, preparazioni, cucina/sala, cotoletta e regole food. Da archiviare o eliminare in una bonifica dedicata.
- `docs/OperationalProtocol.md`: cita ancora cervello operativo pre-service e Service Mode consultivo. Da riscrivere.
- `docs/README.md`: prima di questa sessione puntava ai documenti legacy come ordine di lettura. Aggiornato in questa sessione.
- `project_brain.json`: prima di questa sessione aveva audience legacy "professional chefs and cooks". Aggiornato in questa sessione.
- `packages/types/src/index.ts`: ora usa ruoli e permessi canonici `Organization`; gli alias `Structure*` restano solo come compatibilita temporanea.
- `packages/db/prisma/schema.prisma`: ora espone `Organization*` e `OrganizationRole` nel client Prisma usando mapping conservativo su tabelle fisiche legacy.
- `packages/db/prisma/migrations/20260625000000_auth_baseline/migration.sql`: migrazione baseline con enum legacy. Non modificare senza strategia DB.
- `apps/workspace/docs/architecture.md`: cita Pre-Service e backend Event.
- `apps/workspace/README.md`: cita dominio Event e AI non persistiti.
- `apps/workspace/src/shared/server/authorization-policy.ts`: policy migrata a ruoli e permessi Organization.
- `apps/workspace/src/shared/server/authorization-policy.test.ts`: test basati su ruoli legacy persistiti.
- `apps/workspace/src/shared/server/structure-access-service.ts`: wrapper legacy verso `organization-access-service.ts`.
- `apps/workspace/src/shared/server/structure-invitation-service.ts`: wrapper legacy verso `organization-invitation-service.ts`.
- `apps/workspace/src/shared/server/transactional-email-service.ts`: mantiene tipi ruolo legacy per compatibilita, ma il copy visibile e stato reso neutro.
- `apps/workspace/src/shared/server/auth-credentials-service.ts`: fallback nome legacy bonificato in questa sessione.
- `apps/workspace/src/shared/server/username-service.ts`: suffisso username legacy bonificato in questa sessione.
- `apps/workspace/src/shared/server/workspace-user-sync.ts`: fallback legacy bonificato in questa sessione.
- `apps/workspace/src/shared/server/structure-migration.test.ts`: bonificato per controllare che la baseline auth non includa modelli dominio futuri.

## Componenti o testi contaminati

- Ruoli: `HEAD_OF_HALL`, `HEAD_CHEF`, `KITCHEN_CREW`.
- Dipartimenti legacy rimossi dai tipi condivisi; restano valori ruolo e permessi runtime legacy.
- Permessi: `hall:read`, `kitchen:read`, `kitchen:plan`, `crew:tasks:*`.
- Copy: i testi visibili legacy principali sono stati bonificati; restano valori ruolo persistiti nel codice.
- Concetti: Pre-Service, Service Mode, Event, preparazioni, menu, allergeni, grammature, vassoi, cotoletta.

## Parti riutilizzabili

- Monorepo pnpm/turbo.
- `apps/workspace` come runtime API-only.
- NextAuth, credentials, MFA, device security, auth code e audit security.
- Support session auditata con MFA e motivo.
- Pattern default deny e autorizzazione server-side.
- Membership e inviti come base tecnica, se rinominati e rimodellati.
- Placeholder `apps/web` e `apps/mobile`.
- Separazione `packages/types` e `packages/db`.

## Parti da eliminare

- Documenti legacy di prodotto dopo migrazione del contenuto utile nei nuovi docs: `docs/ProductContext.md` e `docs/event-operations.md`.
- Fixture e riferimenti food nei test o nella documentazione.
- Copy utente legacy, se residuo in file marcati legacy o commenti storici.

## Parti da rinominare

- `Structure` probabilmente verso `Company`, `Organization` o `Workspace`, da decidere prima di migrare.
- `StructureRole` verso ruoli prodotto come `OWNER`, `ADMIN`, `OPERATOR`, `CONSULTANT`, `VIEWER`, se confermati.
- `StructureMembership` e `StructureInvitation` verso membership/inviti della nuova entita scelta.
- Permessi `hall:*`, `kitchen:*`, `crew:*` verso permessi su documenti, cantieri, lavoratori, pacchetti e checklist.

## Parti da riscrivere

- Moduli futuri Worker, JobSite, Document, Evidence, Checklist e DocumentPackage.
- Wrapper legacy `structure-*` dopo migrazione completa dei client.
- Route legacy `/api/structure*` e `/api/structures` quando non saranno piu usate.
- `apps/workspace/src/shared/server/transactional-email-service.ts`: copy neutro e prudente.
- README locali che citano Event, Pre-Service o vecchio dominio.

## Rischi di contaminazione concettuale

- Usare `Structure` come se fosse gia una azienda puo nascondere differenze tra tenant, azienda cliente e cantiere.
- Riutilizzare `KITCHEN_CREW` come lavoratore operativo porterebbe permessi sbagliati.
- Mantenere `HEAD_CHEF` come ruolo intermedio potrebbe creare logiche di invito non coerenti con consulenti e viewer.
- Copy "verifica fisica" o "sistema propone" puo essere interpretato come controllo tecnico, mentre Qoovex deve parlare di revisione documentale e informazioni da confermare.
- Liste documentali o scadenze hardcoded senza fonti possono sembrare requisiti normativi.

## Sostituzioni concettuali consigliate

- Chef/capo cucina -> admin azienda, collaboratore operativo o consulente, a seconda del caso.
- Brigata -> lavoratori o operatori invitati, senza assumere stessa gerarchia.
- Sala -> viewer o destinatari esterni, solo se leggono pacchetti.
- Evento -> cantiere o pacchetto, non sostituzione automatica: dipende dal flusso.
- Preparazione -> documento, checklist o prova di cantiere, in base alla funzione reale.
- Calculation Trace -> audit trail o storico modifiche, se serve nel nuovo dominio.

## Raccomandazione operativa

Il prossimo intervento dovrebbe essere una bonifica tecnica separata di ruoli, permessi e naming, preceduta da una scelta esplicita tra `Company`, `Organization` e `Workspace` come entita tenant principale.

Non modificare subito migrazioni Prisma senza decidere strategia dati. Prima produrre una matrice ruoli/permessi MVP e poi aggiornare `packages/types`, policy server, test, copy email e schema DB in un unico task coerente.
