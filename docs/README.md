# Qoovex docs

Questa cartella contiene la documentazione di prodotto e lavoro del nuovo Qoovex.

La fonte primaria e il set numerato `00`-`40`.

## Ordine di lettura

1. `00_PRODUCT_RESET.md`: reset rigido del posizionamento.
2. `01_PRODUCT_BRIEF.md`: definizione del nuovo prodotto.
3. `03_PRODUCT_SCOPE.md`: cosa entra e cosa resta fuori dall'MVP.
4. `04_DOMAIN_GLOSSARY.md`: glossario operativo non legale.
5. `05_RESEARCH_REQUESTS.md`: informazioni da chiedere prima di implementare parti sensibili.
6. `06_CODEX_WORKING_RULES.md`: regole operative per le sessioni future.
7. `07_INITIAL_WORK_PLAN.md`: piano iniziale in blocchi piccoli.
8. `08_REPO_CONTEXT_AUDIT.md`: audit delle tracce legacy nel repository.
9. `09_DOMAIN_NAMING_AND_PERMISSIONS.md`: naming tecnico, ruoli MVP e matrice permessi.
10. `10_LEGACY_REFACTOR_PLAN.md`: ordine controllato di bonifica legacy.
11. `11_STORAGE_AND_DATABASE_DECISIONS.md`: decisioni Prisma e Blob.
12. `12_ORGANIZATION_MIGRATION_PLAN.md`: piano storico superato dal reset definitivo.
13. `13_RUNTIME_AUTH_AND_PERMISSIONS.md`: ruoli runtime, permessi e regole default-deny.
14. `14_API_RENAME_REPORT.md`: report storico superato dal reset definitivo.
15. `15_MVP_DOMAIN_MODEL.md`: modello dominio MVP generico e configurabile.
16. `16_DOCUMENT_STATUS_AND_DEADLINES.md`: stati documentali, scadenze e copy prudente.
17. `17_DOCUMENT_PACKAGE_AND_SHARING.md`: pacchetti documentali, viewer e share link.
18. `18_MVP_API_AND_SERVICE_PLAN.md`: API/service futuri e criteri di sicurezza.
19. `19_DOCUMENTS_AND_DEADLINES_IMPLEMENTATION.md`: implementazione API minime per tipi documento, documenti e scadenze.
20. `20_DOCUMENT_VERSION_UPLOAD.md`: upload Blob privato e versioni documento.
21. `21_WORKERS_AND_JOBSITES_IMPLEMENTATION.md`: implementazione API minime per lavoratori e cantieri.
22. `22_MONOREPO_BOUNDARIES_AND_PLACEMENT.md`: confini app/package e regole di placement.
23. `23_SHARED_PACKAGES_ROADMAP.md`: roadmap per package condivisi futuri.
24. `24_APP_BOUNDARY_AUDIT.md`: audit specifico delle app del monorepo.
25. `25_CHECKLISTS_AND_EVIDENCE_IMPLEMENTATION.md`: implementazione API minime per checklist e prove operative.
26. `26_DOCUMENT_PACKAGES_AND_SHARE_LINKS_IMPLEMENTATION.md`: implementazione pacchetti documentali, share link e accesso viewer controllato.
27. `27_LEGACY_RESET_AND_DB_BASELINE.md`: reset legacy definitivo e baseline Prisma pulita.
28. `28_MOBILE_FIRST_DASHBOARD_IMPLEMENTATION.md`: prima dashboard operativa mobile-first del workspace.
29. `29_WORKSPACE_ADMIN_CORE_IMPLEMENTATION.md`: shell admin e prime schermate operative per documenti, scadenze, lavoratori e cantieri.
30. `30_WORKSPACE_ADMIN_EXTENDED_IMPLEMENTATION.md`: UI admin per checklist, prove, pacchetti documentali e share link.
31. `31_WORKSPACE_ADMIN_UX_REFINEMENT.md`: rifinitura UX, responsive, accessibilita e QA dell'admin MVP.
32. `32_NOTIFICATIONS_AND_REMINDERS_IMPLEMENTATION.md`: notifiche interne e promemoria operativi su scadenze, documenti, pacchetti e share link.
33. `33_EMAIL_REMINDERS_AND_DIGEST_IMPLEMENTATION.md`: digest email manuale e reminder singola notifica, senza invii massivi o scheduler.
34. `34_NOTIFICATION_PREFERENCES_AND_SCHEDULING.md`: preferenze email, delivery log minimale e endpoint scheduling protetto da secret.
35. `35_PRIVACY_AUDIT_SECURITY_HARDENING.md`: audit log prodotto, metadata redatti e header HTTP di base.
36. `36_RESOURCE_ASSIGNMENTS_AND_GRANULAR_ACCESS.md`: assegnazioni risorsa e accesso granulare per ruoli operativi.
37. `37_AUTH_ACCESS_AND_WORKSPACE_ENTRY_FIX.md`: hotfix accesso workspace, sign-in/sign-up NextAuth e setup azienda.
38. `38_DATA_RETENTION_EXPORT_AND_DELETION.md`: inventario dati, export metadata e retention operativa owner-only.
39. `39_MARKETING_SIRIO_UI_FOUNDATION.md`: foundation marketing pubblico, Sirio e prime primitive `packages/ui`.
40. `40_TESTING_READINESS_PLAN.md`: backlog operativo dei test mancanti per E2E, Blob, share link anonimi, ruoli, env production e drift Prisma.

## Documenti rimossi

I documenti prodotto legacy `ProductContext.md` ed `event-operations.md` sono stati eliminati definitivamente e non devono essere ricreati.
