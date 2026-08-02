# Qoovex docs

Documentazione code-first dello stato implementato e delle decisioni prodotto. La classificazione canonica e:

- `verified_current_state`: provato da codice, schema, migration o runtime verificato;
- `implemented_decision`: decisione approvata e realizzata;
- `approved_product_direction`: decisione prodotto approvata, non prova di implementazione;
- `conceptual_not_implemented`: modello, lifecycle, capability o superficie futura;
- `open_decision`: scelta non ancora definita;
- `hard_stop`: impedisce schema o implementazione finche non viene risolto e approvato.

Il contratto prodotto vNext e registrato in D-VNEXT-01-17. Il contratto tecnico completo di Fase A e registrato in D-VNEXT-18-45, nelle matrici e nel threat model dei documenti `01`, `03`, `04`, `06`, `07` e `08`. Entrambi restano `conceptual_not_implemented`.

Il codice, `schema.prisma`, le migration e i manifest prevalgono per lo stato realmente disponibile.

1. `00_PRODUCT_AND_SCOPE.md` - identita, promesse, modello commerciale e perimetro vNext.
2. `01_DOMAIN_AND_AUTHORIZATION.md` - account, membership, partecipazione, autorita e privacy.
3. `02_ARCHITECTURE_AND_BOUNDARIES.md` - confini runtime, tenant, immobili e compatibilita legacy.
4. `03_DATA_STORAGE_AND_SECURITY.md` - persistenza corrente, timeline, allegati, export e retention.
5. `04_RUNTIME_AND_FEATURES.md` - funzioni attive e flussi vNext concettuali.
6. `05_UI_BRAND_AND_SURFACES.md` - superfici correnti e vista cliente concettuale.
7. `06_OPERATIONS_AND_ENVIRONMENT.md` - ambienti, impatto nullo del task e sequenza futura.
8. `07_QUALITY_AND_RELEASE.md` - gate e criteri di accettazione.
9. `08_SUPPORT_AND_DATA_CONTROL.md` - supporto, export, chiusura, archiviazione e cancellazione.

Non creare documenti di fase paralleli: decisioni e specifiche appartengono ai documenti numerati e al Qoovex-Brain.
